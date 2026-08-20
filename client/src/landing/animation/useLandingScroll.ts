import { type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmRoadHandle } from "../film/FilmRoad";
import { createMasterTimeline } from "./createMasterTimeline";
import { getFilmRoadState } from "./motionConfig";
import { useReducedMotion } from "./useReducedMotion";

interface UseLandingScrollArgs {
  rootRef: RefObject<HTMLElement>;
  trackRef: RefObject<HTMLDivElement>;
  stageRef: RefObject<HTMLElement>;
  filmRef: RefObject<FilmRoadHandle>;
}

function getCompactViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export function useLandingScroll({ rootRef, trackRef, stageRef, filmRef }: UseLandingScrollArgs) {
  const reducedMotion = useReducedMotion();
  const [compact, setCompact] = useState(getCompactViewport);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setCompact(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const film = filmRef.current;
    if (!root || !track || !stage || !film) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    film.setCompact(compact);

    if (reducedMotion) {
      film.setState(getFilmRoadState(0.72));
      return undefined;
    }

    const context = gsap.context(() => {
      createMasterTimeline({ track, stage, film, compact });
    }, root);

    const handleResize = () => ScrollTrigger.refresh();

    window.addEventListener("resize", handleResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", handleResize);
      context.revert();
    };
  }, [compact, filmRef, reducedMotion, rootRef, stageRef, trackRef]);

  return reducedMotion;
}
