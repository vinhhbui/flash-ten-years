import { useRef } from "react";
import { FilmRoad, type FilmRoadHandle } from "./film/FilmRoad";
import { LandingHeader } from "./components/LandingHeader";
import { FinalDestinationWall } from "./components/FinalDestinationWall";
import { useLandingScroll } from "./animation/useLandingScroll";
import { DepthWorld } from "./depth/DepthWorld";
import { StageBackground } from "./stage/StageBackground";
import "./landing.css";

export function LandingExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<FilmRoadHandle>(null);

  const reducedMotion = useLandingScroll({ rootRef, trackRef, stageRef, filmRef });

  return (
    <main className={`film-road-experience${reducedMotion ? " is-reduced-motion" : ""}`} ref={rootRef}>
      <LandingHeader />
      <div className="landing-scroll-track" ref={trackRef} id="experience">
        <div className="landing-master-stage" ref={stageRef} role="region" aria-label="FLASH 10 motion experience">
          <StageBackground />
          <FinalDestinationWall />
          <FilmRoad ref={filmRef} />
          <DepthWorld />
          <div className="landing-stage-grain" aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}
