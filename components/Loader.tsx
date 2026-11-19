"use client";

import { useEffect, useState } from "react";

/** Short intro counter (000 → 100). Shown once per session; skipped for reduced motion. */
export default function Loader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-skip")) return;

    const duration = 1100;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        root.classList.add("loaded");
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {}
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__inner">
        <span className="loader__name">Shreyash Chandra</span>
        <span className="loader__count">{String(count).padStart(3, "0")}</span>
      </div>
      <div className="loader__bar" style={{ transform: `scaleX(${count / 100})` }} />
    </div>
  );
}
