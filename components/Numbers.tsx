"use client";

import { useEffect, useRef, useState } from "react";
import { numbers } from "@/content/site";
import SectionHead from "./SectionHead";

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVal(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min(1, (now - start) / 1400);
          setVal(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) raf = requestAnimationFrame(run);
        };
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="num__value">
      {val}
      <span className="num__suffix">{suffix}</span>
    </span>
  );
}

export default function Numbers() {
  return (
    <section id="numbers" className="section section--ink">
      <SectionHead index="03" title="By the numbers" aside={<span>From production, not side projects</span>} />
      <ul className="nums">
        {numbers.map((n) => (
          <li key={n.label} className="num" data-reveal>
            <Counter to={n.value} suffix={n.suffix} />
            <span className="num__label">{n.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
