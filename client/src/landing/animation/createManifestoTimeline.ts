import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createManifestoTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const lines = stage.querySelectorAll<HTMLElement>(".manifesto-title .kinetic-text__line");
  const surface = stage.querySelector<HTMLElement>(".manifesto-surface");
  const stamp = stage.querySelector<HTMLElement>(".manifesto-stamp");
  const handoff = stage.querySelector<HTMLElement>(".manifesto-handoff");
  const copy = stage.querySelector<HTMLElement>(".manifesto-copy");
  const timeline = createStageTimeline(args);

  timeline
    .to(lines, { xPercent: (index) => (index === 0 ? -11 : 16), rotate: (index) => (index === 0 ? -3 : 3), duration: 0.22, ease: "none" }, 0.18)
    .to(copy, { xPercent: 20, duration: 0.18, ease: "none" }, 0.22)
    .to(surface, { xPercent: -35, scale: 1.18, duration: 0.3, ease: "none" }, 0.36)
    .to(stamp, { rotate: 108, scale: 1.75, xPercent: -24, duration: 0.28, ease: "none" }, 0.44)
    .to(lines, { scaleX: 1.42, xPercent: (index) => (index === 0 ? -32 : 36), duration: 0.26, ease: "none" }, 0.62)
    .to(handoff, { scale: 3.2, xPercent: -26, rotate: -12, duration: 0.26, ease: "none" }, 0.78)
    .to(surface, { xPercent: -105, duration: 0.16, ease: "none" }, 0.9);

  return timeline;
}
