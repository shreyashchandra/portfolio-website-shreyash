// Server-side Chess.com Published-Data API client. Results are cached and refreshed hourly.
const API = "https://api.chess.com/pub/player";
const REVALIDATE = 3600;
const DRAWS = new Set(["agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"]);

type Record_ = { win: number; loss: number; draw: number };
type Rated = { last?: { rating: number }; best?: { rating: number }; record?: Record_ };
type StatsResponse = {
  chess_rapid?: Rated;
  chess_blitz?: Rated;
  chess_bullet?: Rated;
  chess_daily?: Rated;
  tactics?: { highest?: { rating: number } };
  puzzle_rush?: { best?: { score: number } };
};
type Side = { username: string; rating: number; result: string };
type Game = { url: string; time_class: string; end_time: number; eco?: string; white: Side; black: Side };

export type Format = {
  key: "rapid" | "blitz" | "bullet";
  label: string;
  nickname: string;
  rating: number;
  best: number | null;
  win: number;
  draw: number;
  loss: number;
  games: number;
};

export type LastGame = {
  url: string;
  result: "win" | "draw" | "loss";
  how: string;
  format: string;
  opponent: string;
  opponentRating: number;
  opening: string | null;
  endedAt: number;
};

export type ChessData = {
  username: string;
  profileUrl: string;
  league: string | null;
  lastOnline: number;
  joined: number;
  formats: Format[];
  totalGames: number;
  mostPlayed: Format;
  tacticsPeak: number | null;
  puzzleRush: number | null;
  month: { label: string; games: number; wins: number; timeouts: number; topOpening: { name: string; count: number } | null };
  lastGame: LastGame | null;
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "portfolio-site (chess stats widget)" },
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

/** "Scandinavian-Defense-Mieses-Kotrc-Main-Line-4.Nf3" → "Scandinavian Defense" (the opening family). */
function openingFamily(eco?: string): string | null {
  if (!eco) return null;
  const tokens = eco.split("/").pop()!.split("-");
  const end = tokens.findIndex((t) => /^(Defense|Game|Opening|Gambit|Attack|System)$/.test(t));
  const words = end >= 0 ? tokens.slice(0, end + 1) : tokens.filter((t) => !/^\d/.test(t)).slice(0, 3);
  return words.length ? words.join(" ") : null;
}

function resultFor(game: Game, user: string) {
  const me = game.white.username.toLowerCase() === user ? game.white : game.black;
  const them = me === game.white ? game.black : game.white;
  const result: LastGame["result"] = me.result === "win" ? "win" : DRAWS.has(me.result) ? "draw" : "loss";
  const how = result === "win" ? them.result : me.result; // e.g. "checkmated", "resigned", "timeout"
  return { me, them, result, how };
}

export async function getChessData(username: string): Promise<ChessData | null> {
  const user = username.toLowerCase();
  try {
    const [player, stats, archives] = await Promise.all([
      get<{ url: string; league?: string; last_online: number; joined: number }>(`${API}/${user}`),
      get<StatsResponse>(`${API}/${user}/stats`),
      get<{ archives: string[] }>(`${API}/${user}/games/archives`),
    ]);

    const defs = [
      { key: "rapid", label: "Rapid", nickname: "Thinking speed", src: stats.chess_rapid },
      { key: "blitz", label: "Blitz", nickname: "Coffee speed", src: stats.chess_blitz },
      { key: "bullet", label: "Bullet", nickname: "Panic speed", src: stats.chess_bullet },
    ] as const;

    const formats: Format[] = defs
      .filter((d) => d.src?.last)
      .map((d) => {
        const r = d.src!.record ?? { win: 0, loss: 0, draw: 0 };
        return {
          key: d.key,
          label: d.label,
          nickname: d.nickname,
          rating: d.src!.last!.rating,
          best: d.src!.best?.rating ?? null,
          win: r.win,
          draw: r.draw,
          loss: r.loss,
          games: r.win + r.draw + r.loss,
        };
      });
    if (!formats.length) return null;

    const daily = stats.chess_daily?.record;
    const totalGames =
      formats.reduce((s, f) => s + f.games, 0) + (daily ? daily.win + daily.loss + daily.draw : 0);
    const mostPlayed = formats.reduce((a, b) => (b.games > a.games ? b : a));

    // Latest month of games: favourite opening, timeouts, last game.
    let month: ChessData["month"] = { label: "", games: 0, wins: 0, timeouts: 0, topOpening: null };
    let lastGame: LastGame | null = null;
    const latest = archives.archives.at(-1);
    if (latest) {
      const { games } = await get<{ games: Game[] }>(latest);
      const [y, m] = latest.split("/").slice(-2).map(Number);
      const counts = new Map<string, number>();
      let wins = 0;
      let timeouts = 0;
      for (const g of games) {
        const r = resultFor(g, user);
        if (r.result === "win") wins++;
        if (r.result === "loss" && r.how === "timeout") timeouts++;
        const fam = openingFamily(g.eco);
        if (fam) counts.set(fam, (counts.get(fam) ?? 0) + 1);
      }
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      month = {
        label: new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" }),
        games: games.length,
        wins,
        timeouts,
        topOpening: top ? { name: top[0], count: top[1] } : null,
      };

      const g = games.at(-1);
      if (g) {
        const r = resultFor(g, user);
        lastGame = {
          url: g.url,
          result: r.result,
          how: r.how,
          format: g.time_class,
          opponent: r.them.username,
          opponentRating: r.them.rating,
          opening: openingFamily(g.eco),
          endedAt: g.end_time,
        };
      }
    }

    return {
      username,
      profileUrl: player.url,
      league: player.league ?? null,
      lastOnline: player.last_online,
      joined: player.joined,
      formats,
      totalGames,
      mostPlayed,
      tacticsPeak: stats.tactics?.highest?.rating ?? null,
      puzzleRush: stats.puzzle_rush?.best?.score ?? null,
      month,
      lastGame,
    };
  } catch (err) {
    console.error("chess.com fetch failed:", err);
    return null;
  }
}
