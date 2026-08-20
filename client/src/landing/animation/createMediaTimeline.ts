import { createStageTimeline, type SceneTimelineArgs } from "./createStageTimeline";

export function createMediaTimeline(args: SceneTimelineArgs) {
  const { stage } = args;
  const cards = stage.querySelectorAll<HTMLElement>(".media-card");
  const title = stage.querySelector<HTMLElement>(".media-title");
  const backgroundWord = stage.querySelector<HTMLElement>(".media-background-word");
  const transfer = stage.querySelector<HTMLElement>(".media-transfer-token");
  const timeline = createStageTimeline(args);

  timeline
    .to(backgroundWord, { xPercent: -14, rotate: -4, duration: 0.24, ease: "none" }, 0.12)
    .to(cards, { xPercent: (index) => [-12, 22, -34, 40][index], yPercent: (index) => [16, -24, 38, -34][index], rotate: (index) => [-8, 12, -16, 18][index], duration: 0.3, stagger: 0.02, ease: "none" }, 0.22)
    .to(title, { xPercent: 18, scale: 1.1, duration: 0.2, ease: "none" }, 0.38)
    .to(cards, { scale: (index) => [0.75, 1.2, 0.66, 1.38][index], duration: 0.28, stagger: 0.02, ease: "none" }, 0.53)
    .to(transfer, { scale: 7.8, rotate: 90, xPercent: -46, yPercent: -12, duration: 0.3, ease: "none" }, 0.72)
    .to(cards, { xPercent: (index) => (index % 2 ? 130 : -130), duration: 0.2, ease: "none" }, 0.86);

  return timeline;
}
