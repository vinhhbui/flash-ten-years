import { useEffect, useRef } from "react";
import { FilmRoad, type FilmRoadHandle } from "./film/FilmRoad";
import { LandingHeader } from "./components/LandingHeader";
import { useLandingScroll } from "./animation/useLandingScroll";
import { DepthWorld } from "./depth/DepthWorld";
import { StageBackground } from "./stage/StageBackground";
import LiveWall from "../components/LiveWall";
import "./landing.css";

export function LandingExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wallSectionRef = useRef<HTMLElement>(null);
  const filmRef = useRef<FilmRoadHandle>(null);

  const reducedMotion = useLandingScroll({ rootRef, trackRef, stageRef, filmRef });

  useEffect(() => {
    const root = rootRef.current;
    const wallSection = wallSectionRef.current;
    if (!root || !wallSection) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      root.classList.toggle("is-wall-active", entry.intersectionRatio > 0.45);
    }, { threshold: [0.45] });
    observer.observe(wallSection);

    return () => observer.disconnect();
  }, []);

  return (
    <main className={`film-road-experience${reducedMotion ? " is-reduced-motion" : ""}`} ref={rootRef}>
      <LandingHeader />
      <div className="landing-scroll-track" ref={trackRef} id="experience">
        <div className="landing-master-stage" ref={stageRef} role="region" aria-label="FLASH 10 motion experience">
          <StageBackground />
          <DepthWorld />
          <FilmRoad ref={filmRef} />
          <div className="landing-stage-grain" aria-hidden="true" />
        </div>
      </div>
      <section ref={wallSectionRef} className="landing-wall-section" id="live-wall" aria-label="FLASH 10 Live Wall">
        <div className="landing-wall-frame">
          <div className="landing-wall-frame__screen">
            <LiveWall variant="embedded" />
          </div>
          <span className="landing-wall-frame__label" aria-hidden="true">SECTION 12 / LIVE WALL / ROAD ENDS HERE</span>
        </div>
      </section>
    </main>
  );
}
