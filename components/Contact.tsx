"use client";

import { useState } from "react";
import { profile } from "@/content/site";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className="section section--ink contact">
      <div className="section-head" data-reveal>
        <span className="section-head__idx">07</span>
        <h2 className="section-head__title">Contact</h2>
      </div>

      <p className="contact__big" data-reveal>
        Got something that needs to <em>scale</em>? Let&apos;s talk.
      </p>

      <div className="contact__mail" data-reveal>
        <a href={`mailto:${profile.email}`} className="contact__email">
          {profile.email}
        </a>
        <button className="btn btn--invert" onClick={copy} aria-live="polite">
          {copied ? "Copied ✓" : "Copy email"}
        </button>
      </div>

      <ul className="contact__links" data-reveal>
        <li>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            <span>LinkedIn</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            <span>GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            <span>Résumé (PDF)</span>
            <span aria-hidden="true">↓</span>
          </a>
        </li>
      </ul>
    </section>
  );
}
