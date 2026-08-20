import { type RefObject, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmRoadHandle } from "../film/FilmRoad";
import { createCultureTimeline } from "./createCultureTimeline";
import { createFinalTimeline } from "./createFinalTimeline";
import { createHeroTimeline } from "./createHeroTimeline";
import { createManifestoTimeline } from "./createManifestoTimeline";
import { createMediaTimeline } from "./createMediaTimeline";
import { createTakeoverTimeline } from "./createTakeoverTimeline";
import { refreshLandingScroll } from "./createStageTimeline";
import { getFilmRoadState, sceneMotionConfig, type MotionSceneId } from "./motionConfig";
import { useReducedMotion } from "./useReducedMotion";

interface UseLandingScrollArgs {
  rootRef: RefObject<HTMLElement>;
  filmRef: RefObject<FilmRoadHandle>;
}

const timelineFactories = {
  hero: createHeroTimeline,
  manifesto: createManifestoTimeline,
  media: createMediaTimeline,
  takeover: createTakeoverTimeline,
  culture: createCultureTimeline,
  final: createFinalTimeline,
} as const;

export function useLandingScroll({ rootRef, filmRef }: UseLandingScrollArgs) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    const film = filmRef.current;
    if (!root || !film) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    let compact = window.matchMedia("(max-width: 767px)").matches;
    film.setCompact(compact);

    if (reducedMotion) {
      film.setState(getFilmRoadState("final", 1));
      return undefined;
    }

    const context = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>("[data-scene='hero']");
      if (hero) {
        const intro = gsap.timeline({ defaults: { ease: "back.out(1.6)" } });
        intro
          .fromTo(hero.querySelectorAll(".hero-title .kinetic-text__line"), { yPercent: 115, rotate: -7 }, { yPercent: 0, rotate: 0, duration: 0.72, stagger: 0.08 })
          .fromTo(hero.querySelectorAll(".hero-object"), { scale: 0.2, rotate: -35 }, { scale: 1, rotate: 0, duration: 0.54, stagger: 0.06 }, "-=0.42")
          .fromTo(hero.querySelector(".hero-manifesto"), { scaleX: 0.5 }, { scaleX: 1, duration: 0.42 }, "-=0.45");
      }

      (Object.keys(timelineFactories) as MotionSceneId[]).forEach((sceneId) => {
        const stage = root.querySelector<HTMLElement>(`[data-scene='${sceneId}']`);
        if (!stage) return;

        const config = sceneMotionConfig[sceneId];
        timelineFactories[sceneId]({
          stage,
          pinVh: compact ? config.compactPinVh : config.desktopPinVh,
          applyFilm: (progress) => film.setState(getFilmRoadState(sceneId, progress)),
        });
      });
    }, root);

    const handleResize = () => {
      compact = window.matchMedia("(max-width: 767px)").matches;
      film.setCompact(compact);
      refreshLandingScroll();
    };

    window.addEventListener("resize", handleResize);
    requestAnimationFrame(refreshLandingScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      context.revert();
    };
  }, [filmRef, reducedMotion, rootRef]);
}
