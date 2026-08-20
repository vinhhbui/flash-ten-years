import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createTakeoverTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const number = stage.querySelector<HTMLElement>(".takeover-number");
  const title = stage.querySelector<HTMLElement>(".takeover-title");
  const sweep = stage.querySelector<HTMLElement>(".takeover-sweep");
  const token = stage.querySelector<HTMLElement>(".takeover-token");
  const timeline = createStageTimeline(args);

  timeline
    .to(number, { scale: 1.28, rotate: -6, duration: 0.22, ease: "none" }, 0.16)
    .to(title, { xPercent: -10, scale: 1.08, duration: 0.2, ease: "none" }, 0.24)
    .to(stage, { backgroundColor: "#ff4d28", duration: 0.26, ease: "none" }, 0.4)
    .to(sweep, { xPercent: -158, duration: 0.3, ease: "none" }, 0.42)
    .to(number, { scale: 8.7, xPercent: 8, duration: 0.28, ease: "none" }, 0.62)
    .to(token, { scale: 3.7, rotate: 180, xPercent: 34, duration: 0.22, ease: "none" }, 0.77)
    .to(title, { xPercent: -58, duration: 0.18, ease: "none" }, 0.86);

  return timeline;
}
