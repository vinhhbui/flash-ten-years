import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createCultureTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const cards = stage.querySelectorAll<HTMLElement>(".culture-card");
  const title = stage.querySelector<HTMLElement>(".culture-title");
  const foreground = stage.querySelector<HTMLElement>(".culture-foreground");
  const handoff = stage.querySelector<HTMLElement>(".culture-final-handoff");
  const timeline = createStageTimeline(args);

  timeline
    .to(cards, { xPercent: (index) => [-18, 24, -32][index], yPercent: (index) => [20, -18, 34][index], rotate: (index) => [-9, 11, -15][index], duration: 0.28, stagger: 0.03, ease: "none" }, 0.17)
    .to(title, { xPercent: 14, scale: 1.12, duration: 0.22, ease: "none" }, 0.31)
    .to(foreground, { xPercent: -82, scale: 1.45, duration: 0.32, ease: "none" }, 0.45)
    .to(cards, { scale: (index) => [0.78, 1.3, 1.46][index], duration: 0.26, stagger: 0.02, ease: "none" }, 0.57)
    .to(handoff, { scale: 4.2, rotate: -10, xPercent: 24, duration: 0.28, ease: "none" }, 0.76)
    .to(foreground, { xPercent: -152, duration: 0.18, ease: "none" }, 0.9);

  return timeline;
}
