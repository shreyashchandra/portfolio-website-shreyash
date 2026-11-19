"use client";

import { useState } from "react";
import { education, experience } from "@/content/site";
import SectionHead from "./SectionHead";

export default function ExperienceSection() {
  // Open the most recent role with real detail by default.
  const [open, setOpen] = useState<number | null>(
    Math.max(0, experience.findIndex((e) => e.points.length > 0))
  );

  return (
    <section id="experience" className="section">
      <SectionHead index="01" title="Experience" aside={<span>Two years shipping to production</span>} />

      <ol className="xp">
        {experience.map((job, i) => {
          const isOpen = open === i;
          const hasDetail = job.points.length > 0;
          return (
            <li key={job.company} className={`xp__row${isOpen ? " is-open" : ""}`} data-reveal>
              <button
                className="xp__head"
                onClick={() => hasDetail && setOpen(isOpen ? null : i)}
                aria-expanded={hasDetail ? isOpen : undefined}
                aria-controls={`xp-${i}`}
                disabled={!hasDetail}
              >
                <span className="xp__period">{job.period}</span>
                <span className="xp__company">
                  {job.company}
                  {job.current ? (
                    <span className="xp__now">
                      <span className="pulse" aria-hidden="true" /> Now
                    </span>
                  ) : null}
                </span>
                <span className="xp__role">{job.role}</span>
                <span className="xp__toggle" aria-hidden="true">
                  {hasDetail ? (isOpen ? "−" : "+") : ""}
                </span>
              </button>

              <div id={`xp-${i}`} className="xp__panel" role="region" aria-label={`${job.company} details`}>
                <div className="xp__panel-inner">
                  <p className="xp__summary">{job.summary}</p>
                  {hasDetail ? (
                    <ul className="xp__points">
                      {job.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ) : null}
                  {job.stack.length ? (
                    <ul className="chips" aria-label="Tools used">
                      {job.stack.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="edu" data-reveal>
        <span className="edu__label">Education</span>
        <span className="edu__school">{education.school}</span>
        <span className="edu__degree">{education.degree}</span>
        <span className="edu__note">
          {education.period} · {education.note}
        </span>
      </div>
    </section>
  );
}
