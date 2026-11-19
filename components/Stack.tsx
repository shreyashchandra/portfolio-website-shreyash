"use client";

import { useEffect, useRef } from "react";
import { stack } from "@/content/site";
import SectionHead from "./SectionHead";

const all = stack.flatMap((g) => g.items);
const rowA = all.slice(0, Math.ceil(all.length / 2));
const rowB = all.slice(Math.ceil(all.length / 2));

/** Two marquee rows that drift on their own and speed up / skew with scroll velocity. */
function useVelocityMarquee(refs: React.RefObject<HTMLDivElement | null>[]) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    const offsets = refs.map(() => 0);

    const loop = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      velocity += (delta - velocity) * 0.1;

      refs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const dir = i % 2 === 0 ? -1 : 1;
        const half = el.scrollWidth / 2;
        offsets[i] += dir * (0.5 + Math.abs(velocity) * 0.35);
        if (half > 0) {
          if (offsets[i] <= -half) offsets[i] += half;
          if (offsets[i] > 0) offsets[i] -= half;
        }
        const skew = Math.max(-8, Math.min(8, velocity * 0.25));
        el.style.transform = `translate3d(${offsets[i]}px,0,0) skewX(${-skew}deg)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [refs]);
}

function Row({ items, innerRef, outline }: { items: string[]; innerRef: React.Ref<HTMLDivElement>; outline?: boolean }) {
  return (
    <div className={`marquee${outline ? " marquee--outline" : ""}`} aria-hidden="true">
      <div className="marquee__track" ref={innerRef}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="marquee__item">
            {t}
            <span className="marquee__sep">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Stack() {
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const refs = useRef([a, b]).current;
  useVelocityMarquee(refs);

  return (
    <section id="stack" className="section section--flush">
      <div className="section__pad">
        <SectionHead index="04" title="Toolbox" aside={<span>Technology agnostic. These are the current favourites.</span>} />
      </div>

      <div className="marquees">
        <Row items={rowA} innerRef={a} />
        <Row items={rowB} innerRef={b} outline />
      </div>

      <div className="section__pad">
        <dl className="stack">
          {stack.map((g) => (
            <div key={g.group} className="stack__group" data-reveal>
              <dt>{g.group}</dt>
              {g.items.map((it) => (
                <dd key={it}>{it}</dd>
              ))}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
