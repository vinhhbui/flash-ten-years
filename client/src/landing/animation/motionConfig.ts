import type { FilmRoadState } from "../film/FilmRoad";
import type { FilmRoadVariant } from "../film/filmRoadConfig";

export const masterTimelineLabels = {
  flash10Read: 0,
  tenYearsHorizon: 4,
  tenYearsRead: 11,
  connectedHorizon: 18,
  flashbackHorizon: 32,
  memoryHorizon: 46,
  memorySettle: 59,
} as const;

export const MASTER_TIMELINE_DURATION = 100;
export const MASTER_SCROLL_VH = {
  desktop: 8.8,
  compact: 6.2,
} as const;

interface FilmRoadKeyframe {
  progress: number;
  variant: FilmRoadVariant;
}

const filmRoadKeyframes: FilmRoadKeyframe[] = [
  { progress: 0, variant: "perspective" },
  { progress: 0.2, variant: "open-bend" },
  { progress: 0.4, variant: "s-curve" },
  { progress: 0.6, variant: "diagonal" },
  { progress: 0.78, variant: "active-frame" },
  { progress: 0.9, variant: "open-bend" },
  { progress: 1, variant: "outro" },
];

export function getFilmRoadState(progress: number): FilmRoadState {
  const amount = Math.max(0, Math.min(1, progress));
  const targetIndex = filmRoadKeyframes.findIndex((keyframe) => keyframe.progress >= amount);
  const nextIndex = targetIndex === -1 ? filmRoadKeyframes.length - 1 : targetIndex;
  const previousIndex = Math.max(0, nextIndex - 1);
  const previous = filmRoadKeyframes[previousIndex];
  const next = filmRoadKeyframes[nextIndex];
  const range = Math.max(next.progress - previous.progress, 0.0001);

  return {
    from: previous.variant,
    to: next.variant,
    mix: (amount - previous.progress) / range,
    reel: 0.04 + amount * 4.54,
  };
}
