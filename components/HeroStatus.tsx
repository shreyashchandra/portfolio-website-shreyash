"use client";

import { profile } from "@/content/site";
import { useClock } from "./useClock";

export default function HeroStatus() {
  const time = useClock(true);
  return (
    <div className="hero__status">
      <span className="status">
        <span className="pulse" aria-hidden="true" />
        Currently · {profile.status}
      </span>
      <span className="hero__time">India · {time} IST</span>
      <a href="#experience" className="hero__scroll">
        Scroll <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
