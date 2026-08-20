import { useRef } from "react";
import { FilmRoad, type FilmRoadHandle } from "./film/FilmRoad";
import { LandingHeader } from "./components/LandingHeader";
import { HeroScene } from "./scenes/HeroScene";
import { ManifestoScene } from "./scenes/ManifestoScene";
import { MediaScene } from "./scenes/MediaScene";
import { TakeoverScene } from "./scenes/TakeoverScene";
import { CultureScene } from "./scenes/CultureScene";
import { FinalScene } from "./scenes/FinalScene";
import { useLandingScroll } from "./animation/useLandingScroll";
import "./landing.css";

export function LandingExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const filmRef = useRef<FilmRoadHandle>(null);

  useLandingScroll({ rootRef, filmRef });

  return (
    <main className="film-road-experience" ref={rootRef}>
      <LandingHeader />
      <FilmRoad ref={filmRef} />
      <HeroScene />
      <ManifestoScene />
      <MediaScene />
      <TakeoverScene />
      <CultureScene />
      <FinalScene />
    </main>
  );
}
