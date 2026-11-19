import Image from "next/image";
import { intro, profile } from "@/content/site";
import HeroStatus from "./HeroStatus";

function SplitWord({ word, offset = 0 }: { word: string; offset?: number }) {
  return (
    <span className="hero__word" aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span key={i} className="hero__char" style={{ "--i": i + offset } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__meta">
        <span>{profile.role}</span>
        <span>{profile.focus}</span>
        <span>{profile.location}</span>
      </div>

      <h1 id="hero-title" className="hero__title">
        <span className="sr-only">{profile.name}</span>
        <SplitWord word="Shreyash" />
        <SplitWord word="Chandra" offset={4} />
      </h1>

      <div className="hero__grid">
        <div className="hero__copy">
          <p className="hero__lead">{intro.lead}</p>
          <p className="hero__body">{intro.body}</p>
          <div className="hero__ctas">
            <a className="btn btn--fill" href="#work">
              See the work <span aria-hidden="true">↓</span>
            </a>
            <a className="btn" href={`mailto:${profile.email}`}>
              Get in touch
            </a>
          </div>
        </div>

        <figure className="hero__portrait">
          <Image
            src="/img/portrait.png"
            alt="Portrait of Shreyash Chandra in a dark suit"
            width={600}
            height={960}
            priority
            sizes="(max-width: 800px) 60vw, 320px"
          />
          <figcaption>
            <span>Fig. 01</span>
            <span>Probably thinking about cache invalidation</span>
          </figcaption>
        </figure>
      </div>

      <HeroStatus />
    </section>
  );
}
