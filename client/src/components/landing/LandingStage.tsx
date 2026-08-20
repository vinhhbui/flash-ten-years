import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LandingScene } from "../../data/landingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Filmstrip, type FilmstripHandle } from "./Filmstrip";

interface LandingStageProps {
  scene: LandingScene;
}

function StageTitle({ scene }: { scene: LandingScene }) {
  const title = scene.title.map((line) => <span key={line} className="landing-stage__title-line">{line}</span>);

  if (scene.id === "hero") {
    return <h1 className="landing-stage__title">{title}</h1>;
  }

  return <h2 className="landing-stage__title">{title}</h2>;
}

function HandoffMark({ scene }: { scene: LandingScene }) {
  return (
    <div className={`landing-stage__handoff landing-stage__handoff--${scene.handoffType}`} aria-hidden="true">
      {scene.handoffType === "cat" && <span className="landing-stage__handoff-cat" />}
      <span>{scene.handoff}</span>
    </div>
  );
}

export function LandingStage({ scene }: LandingStageProps) {
  const stageRef = useRef<HTMLElement>(null);
  const filmRef = useRef<FilmstripHandle>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const film = filmRef.current;
    if (reducedMotion || scene.final) {
      film?.setProgress(scene.final ? 0.18 : 0.33);
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
    const direction = scene.side === "right" ? -1 : 1;
    const context = gsap.context(() => {
      const titleLines = gsap.utils.toArray<HTMLElement>(".landing-stage__title-line", stage);
      const tokens = gsap.utils.toArray<HTMLElement>(".landing-stage__token", stage);
      const filmWrap = stage.querySelector<HTMLElement>(".landing-stage__film");
      const foreground = stage.querySelector<HTMLElement>(".landing-stage__foreground");
      const handoff = stage.querySelector<HTMLElement>(".landing-stage__handoff");
      const reel = { value: 0.05 };
      const applyReel = () => filmRef.current?.setProgress(reel.value);

      filmRef.current?.setProgress(reel.value);

      if (scene.id === "hero") {
        gsap.set(titleLines, { autoAlpha: 0, yPercent: 20, rotate: -4 });
        gsap.set(tokens, { autoAlpha: 0, scale: 0.3 });
        gsap.timeline()
          .fromTo(filmWrap, { scale: 0.78, rotation: -6 }, { scale: 1, rotation: 0, duration: 0.65, ease: "back.out(1.5)" })
          .to(titleLines, { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 0.55, stagger: 0.08, ease: "back.out(1.7)" }, "-=0.22")
          .to(tokens, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.06, ease: "back.out(2)" }, "-=0.34");
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${isSmallScreen ? Math.round((scene.pinDistance ?? 2000) * 0.58) : scene.pinDistance ?? 2000}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(reel, { value: 0.16, duration: 0.15, ease: "none", onUpdate: applyReel })
        .to(filmWrap, { xPercent: direction * 2, rotation: direction * 1.5, duration: 0.2, ease: "none" }, 0.15)
        .to(titleLines, { xPercent: direction * 5, rotate: direction * 2, duration: 0.2, stagger: 0.02, ease: "none" }, 0.15)
        .to(reel, { value: 0.52, duration: 0.25, ease: "none", onUpdate: applyReel })
        .to(filmWrap, { scale: isSmallScreen ? 1.04 : 1.13, rotation: direction * 4, duration: 0.25, ease: "none" }, 0.35)
        .to(tokens, {
          xPercent: (index) => (index % 2 === 0 ? direction * 120 : direction * -75),
          yPercent: (index) => (index % 2 === 0 ? -45 : 55),
          rotate: (index) => direction * (index % 2 === 0 ? 50 : -38),
          scale: (index) => 1 + index * 0.1,
          duration: 0.25,
          stagger: 0.015,
          ease: "none",
        }, 0.35)
        .to(foreground, { scale: isSmallScreen ? 1.18 : 1.45, xPercent: direction * 8, duration: 0.22, ease: "none" }, 0.55)
        .to(titleLines, { xPercent: direction * 24, yPercent: -10, scaleX: 1.12, duration: 0.22, stagger: 0.01, ease: "none" }, 0.55)
        .to(reel, { value: 0.84, duration: 0.22, ease: "none", onUpdate: applyReel })
        .to(filmWrap, { scale: isSmallScreen ? 1.14 : 1.3, xPercent: direction * 8, duration: 0.22, ease: "none" }, 0.6)
        .to(handoff, { autoAlpha: 1, scale: isSmallScreen ? 1.15 : 1.48, xPercent: direction * 18, rotation: direction * 11, duration: 0.16, ease: "none" }, 0.79)
        .to(reel, { value: 1, duration: 0.16, ease: "none", onUpdate: applyReel })
        .to(handoff, { xPercent: direction * 52, yPercent: -18, duration: 0.12, ease: "none" }, 0.9);
    }, stage);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      context.revert();
    };
  }, [reducedMotion, scene]);

  return (
    <section
      ref={stageRef}
      id={scene.id}
      className={`landing-stage landing-stage--${scene.id} landing-stage--${scene.theme} landing-stage--${scene.side}${scene.final ? " landing-stage--final" : ""}`}
    >
      <div className="landing-stage__grid" aria-hidden="true" />
      <div className="landing-stage__wash" aria-hidden="true" />
      {scene.tokens.map((token, index) => (
        <span
          key={`${token.type}-${index}`}
          className={`landing-stage__token landing-stage__token--${token.type}`}
          style={{ left: `${token.x}%`, top: `${token.y}%`, transform: `rotate(${token.rotation}deg) scale(${token.scale ?? 1})` }}
          aria-hidden="true"
        />
      ))}
      <div className="landing-stage__film" aria-hidden="true">
        <Filmstrip ref={filmRef} frames={scene.frames} label={`${scene.eyebrow} filmstrip`} />
      </div>
      <div className="landing-stage__foreground">
        <div className="landing-stage__copy">
          <p className="landing-stage__eyebrow">{scene.eyebrow}</p>
          <StageTitle scene={scene} />
          <p className="landing-stage__manifesto">{scene.manifesto}</p>
          {scene.body && <p className="landing-stage__body">{scene.body}</p>}
          {(scene.primaryAction || scene.secondaryAction) && <div className="landing-stage__actions">
            {scene.primaryAction && <Link className="landing-action landing-action--primary" to={scene.primaryAction.href}>{scene.primaryAction.label}</Link>}
            {scene.secondaryAction && <Link className="landing-action landing-action--secondary" to={scene.secondaryAction.href}>{scene.secondaryAction.label}</Link>}
          </div>}
        </div>
      </div>
      <HandoffMark scene={scene} />
      {scene.id === "memory-cat" && <div className="landing-stage__cat-cluster" aria-hidden="true">
        <span className="landing-stage__cat landing-stage__cat--one" />
        <span className="landing-stage__cat landing-stage__cat--two" />
        <span className="landing-stage__cat landing-stage__cat--three" />
      </div>}
    </section>
  );
}
