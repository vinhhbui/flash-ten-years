import type { FilmRoadState } from "../film/FilmRoad";

export const masterTimelineLabels = {
  flash10Horizon: 0,
  flash10Read: 12,
  tenYearsHorizon: 15,
  tenYearsRead: 27,
  connectedHorizon: 30,
  flashbackHorizon: 45,
  memoryHorizon: 60,
  memorySettle: 72,
} as const;

export const MASTER_TIMELINE_DURATION = 100;
export const MASTER_SCROLL_VH = {
  desktop: 8.8,
  compact: 6.2,
} as const;

export function getFilmRoadState(progress: number): FilmRoadState {
  const amount = Math.max(0, Math.min(1, progress));

  return {
    reel: 0.04 + amount * 4.2,
  };
}
