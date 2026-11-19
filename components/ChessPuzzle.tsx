"use client";

import { useState } from "react";

type Piece = { type: "K" | "R" | "P"; white: boolean };
type Board = Record<string, Piece>;

const FILES = "abcdefgh";
const GLYPH: Record<Piece["type"], string> = { K: "♚", R: "♜", P: "♟" };

// White to move, mate in one: the classic back-rank. Answer: Ra8#.
const START: Board = {
  g1: { type: "K", white: true },
  a1: { type: "R", white: true },
  f2: { type: "P", white: true },
  g2: { type: "P", white: true },
  h2: { type: "P", white: true },
  g8: { type: "K", white: false },
  f7: { type: "P", white: false },
  g7: { type: "P", white: false },
  h7: { type: "P", white: false },
};

const SOLUTION = { from: "a1", to: "a8" };

function sq(file: number, rank: number) {
  return `${FILES[file]}${rank}`;
}

export default function ChessPuzzle() {
  const [board, setBoard] = useState<Board>(START);
  const [selected, setSelected] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "wrong" | "solved">("idle");

  const reset = () => {
    setBoard(START);
    setSelected(null);
    setState("idle");
  };

  const click = (square: string) => {
    if (state === "solved") return;
    const piece = board[square];

    if (piece?.white) {
      setSelected(square === selected ? null : square);
      setState("idle");
      return;
    }
    if (!selected) return;

    if (selected === SOLUTION.from && square === SOLUTION.to) {
      const next = { ...board };
      next[SOLUTION.to] = next[SOLUTION.from];
      delete next[SOLUTION.from];
      setBoard(next);
      setState("solved");
    } else {
      setState("wrong");
    }
    setSelected(null);
  };

  const message =
    state === "solved"
      ? "Ra8#. Checkmate. The king is boxed in by its own pawns."
      : state === "wrong"
        ? "Not mate. Look at the back rank."
        : selected
          ? `${board[selected]?.type === "R" ? "Rook" : "Piece"} selected. Where does it go?`
          : "White to play. Mate in one.";

  return (
    <div className={`chess${state === "solved" ? " is-solved" : ""}`}>
      <div className="chess__board" role="grid" aria-label="Chess puzzle, white to move, mate in one">
        {Array.from({ length: 8 }, (_, r) => 7 - r).map((rank) =>
          Array.from({ length: 8 }, (_, f) => {
            const id = sq(f, rank + 1);
            const piece = board[id];
            const dark = (f + rank) % 2 === 0;
            return (
              <button
                key={id}
                className={[
                  "chess__sq",
                  dark ? "is-dark" : "is-light",
                  selected === id ? "is-selected" : "",
                  state === "solved" && id === SOLUTION.to ? "is-mate" : "",
                ].join(" ")}
                onClick={() => click(id)}
                aria-label={`${id}${piece ? `, ${piece.white ? "white" : "black"} ${{ K: "king", R: "rook", P: "pawn" }[piece.type]}` : ""}`}
              >
                {piece ? (
                  <span className={`chess__piece ${piece.white ? "is-white" : "is-black"}`}>
                    {GLYPH[piece.type]}
                    {"︎"}
                  </span>
                ) : null}
                {f === 0 ? <span className="chess__coord chess__coord--rank">{rank + 1}</span> : null}
                {rank === 0 ? <span className="chess__coord chess__coord--file">{FILES[f]}</span> : null}
              </button>
            );
          })
        )}
      </div>
      <div className="chess__foot">
        <p className="chess__msg" aria-live="polite">
          {message}
        </p>
        {state !== "idle" ? (
          <button className="link" onClick={reset}>
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
