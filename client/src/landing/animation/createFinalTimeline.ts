import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createFinalTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const title = stage.querySelector<HTMLElement>(".final-title");
  const actions = stage.querySelector<HTMLElement>(".final-actions");
  const credit = stage.querySelector<HTMLElement>(".final-credit");
  const timeline = createStageTimeline(args);

  timeline
    .to(title, { scale: 1.08, xPercent: -5, duration: 0.28, ease: "none" }, 0.22)
    .to(actions, { yPercent: -12, duration: 0.22, ease: "none" }, 0.38)
    .to(credit, { xPercent: 8, duration: 0.2, ease: "none" }, 0.62);

  return timeline;
}
