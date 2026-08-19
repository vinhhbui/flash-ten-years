import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const routePath = "M1125,-40 C996,130 1294,282 1162,476 C1040,653 848,670 960,919 C1071,1162 1350,1144 1260,1436 C1178,1708 832,1615 714,1880 C603,2128 840,2324 1086,2249 C1278,2190 1302,2460 1100,2603 C876,2764 686,2654 652,2950 C620,3224 904,3334 1064,3152 C1218,2978 1360,3199 1192,3418 C1006,3664 664,3568 532,3857 C434,4070 665,4230 844,4142 C1064,4034 1208,4236 1030,4453 C869,4650 592,4570 476,4809 C366,5030 563,5203 790,5116 C1012,5031 1123,5282 952,5450 C812,5587 664,5685 714,6038";

function Character({ variant }: { variant: "runner" | "reader" | "walker" }) {
  return (
    <div className={`landing-character landing-character--${variant}`} aria-hidden="true">
      <span className="landing-character__head" />
      <span className="landing-character__body" />
      <span className="landing-character__arm landing-character__arm--left" />
      <span className="landing-character__arm landing-character__arm--right" />
      {variant !== "reader" && <>
        <span className="landing-character__leg landing-character__leg--left" />
        <span className="landing-character__leg landing-character__leg--right" />
      </>}
      {variant === "reader" && <span className="landing-character__book" />}
    </div>
  );
}

export default function LandingPage() {
  const rootRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const path = pathRef.current;
    if (!root || !path) return undefined;

    const pathLength = path.getTotalLength();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-landing-reveal]").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 34,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      context.revert();
    };
  }, []);

  return (
    <main className="landing-page" ref={rootRef}>
      <header className="landing-nav" aria-label="FLASH 10 navigation">
        <Link className="landing-brand" to="/">FLASH 10</Link>
        <nav className="landing-nav__links" aria-label="Page sections">
          <a href="#memory">The memory</a>
          <a href="#cat">Make a cat</a>
          <a href="#wall">Live wall</a>
        </nav>
        <Link className="landing-nav__action" to="/create">Create yours</Link>
      </header>

      <section className="landing-section landing-hero" id="memory">
        <div className="landing-copy landing-hero__copy" data-landing-reveal>
          <p className="landing-eyebrow">FLASH 10 anniversary</p>
          <h1>TEN YEARS<br />OF MEMORIES.</h1>
          <p className="landing-body">A shared wall for the small moments, bright ideas and people who made the last decade matter.</p>
          <a className="landing-text-link" href="#cat">Follow the story</a>
        </div>
        <div className="landing-visual-field landing-hero__art" data-landing-reveal aria-hidden="true">
          <div className="landing-orbit landing-orbit--large" />
          <div className="landing-orbit landing-orbit--small" />
          <div className="landing-sun-disc" />
          <Character variant="runner" />
          <div className="landing-board" />
        </div>
      </section>

      <section className="landing-section landing-story landing-story--network">
        <div className="landing-story-number" aria-hidden="true">01</div>
        <div className="landing-copy landing-story__copy" data-landing-reveal>
          <p className="landing-eyebrow">One celebration, many people</p>
          <h2>EVERY MEMORY<br />HAS A PLACE.</h2>
          <p className="landing-body">FLASH 10 turns individual moments into one moving, living wall for everyone in the room to enjoy together.</p>
        </div>
        <div className="landing-image-card landing-image-card--green" data-landing-reveal aria-hidden="true">
          <div className="landing-planet landing-planet--one" />
          <div className="landing-planet landing-planet--two" />
          <p className="landing-speech-card">A decade of stories, made visible together.</p>
        </div>
      </section>

      <section className="landing-section landing-story landing-story--people" id="cat">
        <div className="landing-illustration-card" data-landing-reveal aria-hidden="true">
          <Character variant="reader" />
          <div className="landing-arc" />
          <div className="landing-dot" />
        </div>
        <div className="landing-copy landing-copy--card" data-landing-reveal>
          <p className="landing-eyebrow">Your part of the story</p>
          <h2>MAKE YOUR<br />MEMORY CAT.</h2>
          <p className="landing-body">Draw, write and decorate a blank cat. Choose the way it moves, then send it straight to the shared screen.</p>
          <Link className="landing-text-link" to="/create">Create a cat</Link>
        </div>
        <div className="landing-story-number landing-story-number--right" aria-hidden="true">02</div>
      </section>

      <section className="landing-section landing-story landing-story--future" id="wall">
        <div className="landing-copy landing-story__copy" data-landing-reveal>
          <p className="landing-eyebrow">From your phone to the room</p>
          <h2>BRING IT<br />TO LIFE.</h2>
          <p className="landing-body">Your exact drawing appears on the Live Wall and starts moving immediately, ready for the next memory to join it.</p>
          <Link className="landing-text-link" to="/wall">Open Live Wall</Link>
        </div>
        <div className="landing-visual-field landing-visual-field--coral" data-landing-reveal aria-hidden="true">
          <div className="landing-window-shape" />
          <Character variant="walker" />
          <div className="landing-spark landing-spark--one" />
          <div className="landing-spark landing-spark--two" />
        </div>
      </section>

      <section className="landing-section landing-story landing-story--outlook">
        <div className="landing-image-card landing-image-card--lavender" data-landing-reveal aria-hidden="true">
          <div className="landing-eye landing-eye--left" />
          <div className="landing-eye landing-eye--right" />
          <div className="landing-smile" />
          <div className="landing-ribbon" />
        </div>
        <div className="landing-copy landing-story__copy" data-landing-reveal>
          <p className="landing-eyebrow">A living keepsake</p>
          <h2>SEE THE<br />WHOLE STORY.</h2>
          <p className="landing-body">Every cat is a small piece of the anniversary. Together they make a wall that changes with every guest.</p>
        </div>
      </section>

      <section className="landing-section landing-outro">
        <div className="landing-copy landing-outro__copy" data-landing-reveal>
          <p className="landing-eyebrow">FLASH 10</p>
          <h2>MAKE A<br />MEMORY<br />MOVE.</h2>
          <Link className="landing-outro-link" to="/create">Start creating</Link>
        </div>
      </section>

      <div className="landing-svg-layer" aria-hidden="true">
        <svg className="landing-scroll-svg" viewBox="0 0 1440 6000" preserveAspectRatio="none" role="presentation">
          <path className="landing-scroll-path" ref={pathRef} d={routePath} />
        </svg>
      </div>
    </main>
  );
}
