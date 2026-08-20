import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface SceneTimelineArgs {
  stage: HTMLElement;
  pinVh: number;
  applyFilm: (progress: number) => void;
}

export function createStageTimeline({ stage, pinVh, applyFilm }: SceneTimelineArgs) {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * pinVh)}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  timeline.eventCallback("onUpdate", () => applyFilm(timeline.progress()));
  applyFilm(0);
  return timeline;
}

export function refreshLandingScroll() {
  ScrollTrigger.refresh();
}
