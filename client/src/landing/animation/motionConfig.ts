import type { FilmRoadState } from "../film/FilmRoad";
import type { FilmRoadVariant } from "../film/filmRoadConfig";

export const masterTimelineLabels = {
  heroHold: 0,
  heroTakeover: 13,
  manifestoRead: 23,
  mediaEnter: 37,
  mediaSettle: 42,
  mediaTakeover: 54,
  objectField: 64,
  finalManifesto: 77,
  finalTakeover: 84,
  finalCTA: 90,
} as const;

export const MASTER_TIMELINE_DURATION = 100;
export const MASTER_SCROLL_VH = {
  desktop: 8.4,
  compact: 5.8,
} as const;

interface FilmRoadKeyframe {
  progress: number;
  variant: FilmRoadVariant;
}

const filmRoadKeyframes: FilmRoadKeyframe[] = [
  { progress: 0, variant: "perspective" },
  { progress: 0.18, variant: "open-bend" },
  { progress: 0.38, variant: "s-curve" },
  { progress: 0.58, variant: "diagonal" },
  { progress: 0.72, variant: "active-frame" },
  { progress: 0.88, variant: "open-bend" },
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
