"use client";

import { useEffect, useRef, useState } from "react";
import { profile, projects, type Project } from "@/content/site";
import SectionHead from "./SectionHead";

function Preview({ p }: { p: Project }) {
  return (
    <div className="preview__card" style={{ "--h": p.hue } as React.CSSProperties}>
      <div className="preview__top">
        <span className="preview__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{p.kind}</span>
      </div>
      <div className="preview__name">{p.name}</div>
      <div className="preview__term">
        <span className="preview__prompt">$</span> {p.snippet}
        <span className="preview__caret" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Cursor-following preview, eased with rAF. Only on devices with a fine pointer.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
    };
    const loop = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="work" className="section">
      <SectionHead
        index="02"
        title="Selected work"
        aside={
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link">
            Everything else on GitHub ↗
          </a>
        }
      />

      <ol className={`work${hovered !== null ? " has-hover" : ""}`} onMouseLeave={() => setHovered(null)}>
        {projects.map((p, i) => (
          <li
            key={p.name}
            className={`work__row${hovered === i ? " is-hovered" : ""}`}
            style={{ "--h": p.hue } as React.CSSProperties}
            onMouseEnter={() => setHovered(i)}
            data-reveal
          >
            <span className="work__idx">{String(i + 1).padStart(2, "0")}</span>
            <div className="work__main">
              <h3 className="work__name">
                <a href={p.live ?? p.code} target="_blank" rel="noopener noreferrer" className="work__link">
                  {p.name}
                </a>
              </h3>
              <p className="work__kind">
                {p.kind} · {p.year}
                {p.award ? <span className="work__award">{p.award}</span> : null}
              </p>
            </div>
            <div className="work__side">
              <p className="work__blurb">{p.blurb}</p>
              <ul className="chips chips--small" aria-label="Stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="work__links">
                {p.live ? (
                  <a href={p.live} target="_blank" rel="noopener noreferrer">
                    Live ↗
                  </a>
                ) : null}
                {p.code ? (
                  <a href={p.code} target="_blank" rel="noopener noreferrer">
                    Code ↗
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div ref={previewRef} className={`preview${hovered !== null ? " is-visible" : ""}`} aria-hidden="true">
        <div className="preview__stack">
          {projects.map((p, i) => (
            <div key={p.name} className={`preview__slide${hovered === i ? " is-active" : ""}`}>
              <Preview p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
