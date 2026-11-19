"use client";

import { useEffect, useState } from "react";
import { useClock } from "./useClock";

const links = [
  { id: "experience", label: "Experience", idx: "01" },
  { id: "work", label: "Work", idx: "02" },
  { id: "stack", label: "Stack", idx: "04" },
  { id: "off-the-clock", label: "Off the clock", idx: "06" },
  { id: "contact", label: "Contact", idx: "07" },
];

export default function Nav() {
  const time = useClock();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <header className={`nav${scrolled ? " nav--scrolled" : ""}${open ? " nav--open" : ""}`}>
      <div className="nav__bar">
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__mark" aria-hidden="true">SC</span>
          <span className="nav__name">Shreyash Chandra</span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? "is-active" : undefined}
              aria-current={active === l.id ? "true" : undefined}
            >
              <span className="nav__idx">{l.idx}</span>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__meta">
          <span className="nav__clock" title="My local time (IST)">
            <span className="nav__tz">IST</span> {time}
          </span>
          <button className="nav__theme" onClick={toggleTheme} aria-label="Toggle colour theme">
            <span aria-hidden="true" />
          </button>
          <button
            className="nav__menu"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
            <span className="nav__idx">{l.idx}</span>
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}
