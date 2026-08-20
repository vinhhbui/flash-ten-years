import type { FilmRoadState } from "../film/FilmRoad";

export const masterTimelineLabels = {
  flash10Horizon: 0,
  flash10Read: 18,
  tenYearsHorizon: 20,
  tenYearsRead: 36,
  connectedHorizon: 40,
  flashbackHorizon: 60,
  memoryHorizon: 80,
  memorySettle: 94,
} as const;

export const MASTER_TIMELINE_DURATION = 100;
export const CAMERA_END_Z = 12400;
export const MASTER_SCROLL_VH = {
  desktop: 9.6,
  compact: 7.2,
} as const;

export function getFilmRoadState(cameraProgress: number): FilmRoadState {
  const amount = Math.max(0, Math.min(1, cameraProgress));

  return {
    reel: 0.04 + amount * 8.4,
  };
}
