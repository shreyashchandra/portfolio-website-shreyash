import { offClock } from "@/content/site";
import SectionHead from "./SectionHead";
import ChessPuzzle from "./ChessPuzzle";
import ChessStats from "./ChessStats";

const deco: Record<string, React.ReactNode> = {
  Movies: (
    <div className="deco deco--film" aria-hidden="true">
      <span>INT. NIGHT</span>
      <span>SCENE 42</span>
      <span>TAKE 3</span>
    </div>
  ),
  Sports: (
    <div className="deco deco--score" aria-hidden="true">
      <span>HOME</span>
      <b>2 : 1</b>
      <span>89′</span>
    </div>
  ),
};

export default function OffClock() {
  const [movies, sports, chess] = offClock;
  return (
    <section id="off-the-clock" className="section">
      <SectionHead index="06" title="Off the clock" aside={<span>When the terminal is closed</span>} />

      <div className="off">
        {[movies, sports].map((h) => (
          <article key={h.title} className="off__card" data-reveal>
            <span className="off__kicker">{h.title}</span>
            {deco[h.title]}
            <h3 className="off__line">{h.line}</h3>
            <p className="off__body">{h.body}</p>
          </article>
        ))}

        <article className="off__card off__card--chess" data-reveal>
          <div className="off__chess-copy">
            <span className="off__kicker">{chess.title}</span>
            <h3 className="off__line">{chess.line}</h3>
            <p className="off__body">{chess.body}</p>
            <p className="off__hint">Your move. Click a piece, then a square.</p>
          </div>
          <ChessPuzzle />
          <ChessStats />
        </article>
      </div>
    </section>
  );
}
