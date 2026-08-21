import type { FilmRoadState } from "../film/FilmRoad";

export const masterTimelineLabels = {
  flash10: 0,
  content01: 9,
  content02: 18,
  content03: 27,
  content04: 36,
  content05: 45,
  content06: 54,
  content07: 63,
  content08: 72,
  content09: 81,
  content10: 90,
} as const;

export const MASTER_TIMELINE_DURATION = 100;
export const CAMERA_START_Z = 3690;
export const CAMERA_END_Z = 25400;
export const MASTER_SCROLL_VH = {
  desktop: 20.4,
  compact: 16.8,
} as const;

export function getFilmRoadState(cameraProgress: number): FilmRoadState {
  const amount = Math.max(0, Math.min(1, cameraProgress));

  return {
    reel: 0.04 + amount * 18.8,
  };
}
