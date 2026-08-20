import { useRef } from "react";
import { FilmRoad, type FilmRoadHandle } from "./film/FilmRoad";
import { LandingHeader } from "./components/LandingHeader";
import { useLandingScroll } from "./animation/useLandingScroll";
import { DepthWorld } from "./depth/DepthWorld";
import { StageBackground } from "./stage/StageBackground";
import "./landing.css";

export function LandingExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const filmRef = useRef<FilmRoadHandle>(null);

  const reducedMotion = useLandingScroll({ rootRef, trackRef, stageRef, filmRef });

  return (
    <main className={`film-road-experience${reducedMotion ? " is-reduced-motion" : ""}`} ref={rootRef}>
      <LandingHeader />
      <div className="landing-scroll-track" ref={trackRef} id="experience">
        <section className="landing-master-stage" ref={stageRef} aria-label="FLASH 10 motion experience">
          <StageBackground />
          <DepthWorld />
          <FilmRoad ref={filmRef} />
          <div className="landing-stage-grain" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
