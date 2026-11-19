import { profile } from "@/content/site";
import { getChessData, type ChessData, type LastGame } from "@/lib/chess";
import TimeAgo from "./TimeAgo";

const HOW: Record<string, string> = {
  timeout: "on time",
  resigned: "by resignation",
  checkmated: "by checkmate",
  abandoned: "by abandonment",
  agreed: "by agreement",
  repetition: "by repetition",
  stalemate: "by stalemate",
  insufficient: "on insufficient material",
  timevsinsufficient: "on time vs. insufficient material",
  "50move": "by the 50-move rule",
};

const QUIP: Record<string, string> = {
  bullet: "Thinking is optional at one minute a side.",
  blitz: "Fast enough to blunder, slow enough to regret it.",
  rapid: "Time to think. Time to blunder anyway.",
};

function facts(d: ChessData): string[] {
  const out = [`${d.mostPlayed.games.toLocaleString()} ${d.mostPlayed.label.toLowerCase()} games. ${QUIP[d.mostPlayed.key]}`];
  if (d.month.topOpening) {
    out.push(`${d.month.label}'s weapon of choice: the ${d.month.topOpening.name}, ${d.month.topOpening.count} times.`);
  }
  if (d.month.timeouts > 0) {
    out.push(`Flagged ${d.month.timeouts} times in ${d.month.label}. The clock is undefeated.`);
  }
  if (d.tacticsPeak) {
    out.push(`Puzzle peak ${d.tacticsPeak.toLocaleString()}. Tactics are easier when nobody's clock is ticking.`);
  }
  if (d.puzzleRush) out.push(`Puzzle Rush personal best: ${d.puzzleRush}.`);
  return out.slice(0, 4);
}

function lastGameLine(g: LastGame) {
  const how = HOW[g.how] ?? "";
  const verb = g.result === "win" ? "Beat" : g.result === "draw" ? "Drew with" : "Lost to";
  return (
    <>
      {verb} <b>{g.opponent}</b> ({g.opponentRating}) {how}
      {g.opening ? <> in the {g.opening}</> : null}
    </>
  );
}

export default async function ChessStats() {
  const d = await getChessData(profile.chessUser);

  if (!d) {
    return (
      <div className="cstats cstats--empty">
        <a href={profile.chessProfile} target="_blank" rel="noopener noreferrer" className="link">
          Find me on Chess.com as @{profile.chessUser} ↗
        </a>
      </div>
    );
  }

  return (
    <div className="cstats">
      <div className="cstats__head">
        <div className="cstats__who">
          <span className="cstats__live">
            <span className="pulse" aria-hidden="true" /> Live from Chess.com
          </span>
          <a href={d.profileUrl} target="_blank" rel="noopener noreferrer" className="cstats__user">
            @{d.username} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl className="cstats__meta">
          <div>
            <dt>Games played</dt>
            <dd>{d.totalGames.toLocaleString()}</dd>
          </div>
          {d.league ? (
            <div>
              <dt>League</dt>
              <dd>{d.league}</dd>
            </div>
          ) : null}
          <div>
            <dt>Last online</dt>
            <dd>
              <TimeAgo ts={d.lastOnline} />
            </dd>
          </div>
        </dl>
      </div>

      <ul className="clocks">
        {d.formats.map((f) => {
          const pct = (n: number) => (f.games ? (n / f.games) * 100 : 0);
          return (
            <li key={f.key} className={`clock${f.key === d.mostPlayed.key ? " clock--main" : ""}`}>
              <div className="clock__top">
                <span>{f.label}</span>
                <span className="clock__nick">{f.key === d.mostPlayed.key ? "Most played" : f.nickname}</span>
              </div>
              <div className="clock__face">
                <span className="clock__rating">{f.rating}</span>
                {f.best && f.best > f.rating ? <span className="clock__peak">peak {f.best}</span> : <span className="clock__peak">at peak</span>}
              </div>
              <div
                className="clock__bar"
                role="img"
                aria-label={`${f.win} wins, ${f.draw} draws, ${f.loss} losses`}
              >
                <span className="is-win" style={{ width: `${pct(f.win)}%` }} />
                <span className="is-draw" style={{ width: `${pct(f.draw)}%` }} />
                <span className="is-loss" style={{ width: `${pct(f.loss)}%` }} />
              </div>
              <div className="clock__record">
                <span>{f.win}W</span>
                <span>{f.draw}D</span>
                <span>{f.loss}L</span>
                <span className="clock__games">{f.games.toLocaleString()} games</span>
              </div>
            </li>
          );
        })}
      </ul>

      <ol className="cstats__facts">
        {facts(d).map((f, i) => (
          <li key={i}>
            <span className="cstats__fact-idx">{String(i + 1).padStart(2, "0")}</span>
            {f}
          </li>
        ))}
      </ol>

      {d.lastGame ? (
        <a className={`lastgame lastgame--${d.lastGame.result}`} href={d.lastGame.url} target="_blank" rel="noopener noreferrer">
          <span className="lastgame__tag">
            Last game · {d.lastGame.format} · <TimeAgo ts={d.lastGame.endedAt} />
          </span>
          <span className="lastgame__line">{lastGameLine(d.lastGame)}</span>
          <span className="lastgame__cta">
            Replay <span aria-hidden="true">↗</span>
          </span>
        </a>
      ) : null}

      <p className="cstats__foot">
        Stats refresh hourly from the Chess.com public API.{" "}
        <a href={d.profileUrl} target="_blank" rel="noopener noreferrer" className="link">
          Challenge me
        </a>
        .
      </p>
    </div>
  );
}
