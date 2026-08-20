import { gsap } from "gsap";
import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createHeroTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const lines = stage.querySelectorAll<HTMLElement>(".hero-title .kinetic-text__line");
  const objects = stage.querySelectorAll<HTMLElement>(".hero-object");
  const portal = stage.querySelector<HTMLElement>(".hero-portal");
  const manifesto = stage.querySelector<HTMLElement>(".hero-manifesto");
  const cue = stage.querySelector<HTMLElement>(".hero-scroll-cue");
  const timeline = createStageTimeline(args);

  timeline
    .to(objects, { xPercent: (index) => (index % 2 ? -18 : 16), yPercent: (index) => (index % 2 ? 18 : -14), rotation: (index) => (index % 2 ? -16 : 18), duration: 0.2, ease: "none" }, 0.16)
    .to(lines, { xPercent: (index) => (index === 0 ? -8 : 18), yPercent: (index) => (index === 0 ? -10 : 12), rotate: (index) => (index === 0 ? -3 : 4), duration: 0.24, ease: "none" }, 0.28)
    .to(manifesto, { xPercent: -15, scale: 1.12, duration: 0.2, ease: "none" }, 0.36)
    .to(cue, { xPercent: -48, duration: 0.16, ease: "none" }, 0.44)
    .to(lines, { scale: 1.6, xPercent: (index) => (index === 0 ? -38 : 62), duration: 0.25, ease: "none" }, 0.56)
    .to(objects, { xPercent: (index) => (index % 2 ? -120 : 105), yPercent: (index) => (index % 2 ? 70 : -65), rotation: (index) => (index % 2 ? -72 : 72), duration: 0.25, ease: "none" }, 0.58)
    .to(portal, { scale: 13, rotate: -8, duration: 0.24, ease: "none" }, 0.75)
    .to(portal, { xPercent: 8, yPercent: -10, duration: 0.16, ease: "none" }, 0.92);

  return timeline;
}
