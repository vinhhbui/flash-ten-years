export type FilmRoadVariant =
  | "perspective"
  | "open-bend"
  | "s-curve"
  | "active-frame"
  | "diagonal"
  | "outro";

export interface FilmRoadPose {
  centerX: number;
  horizonY: number;
  farWidth: number;
  nearWidth: number;
  bend: number;
  tilt: number;
  activeScale: number;
}

const desktopFilmRoadConfig: Record<FilmRoadVariant, FilmRoadPose> = {
  perspective: { centerX: 500, horizonY: 225, farWidth: 148, nearWidth: 592, bend: 0, tilt: 0, activeScale: 1 },
  "open-bend": { centerX: 478, horizonY: 238, farWidth: 164, nearWidth: 650, bend: -84, tilt: -3, activeScale: 1.12 },
  "s-curve": { centerX: 516, horizonY: 212, farWidth: 150, nearWidth: 620, bend: 128, tilt: 5, activeScale: 1.06 },
  "active-frame": { centerX: 500, horizonY: 260, farWidth: 194, nearWidth: 670, bend: 10, tilt: 0, activeScale: 1.34 },
  diagonal: { centerX: 476, horizonY: 210, farWidth: 150, nearWidth: 700, bend: 170, tilt: -10, activeScale: 1.1 },
  outro: { centerX: 500, horizonY: 244, farWidth: 170, nearWidth: 534, bend: 36, tilt: 0, activeScale: 1.18 },
};

const compactFilmRoadConfig: Record<FilmRoadVariant, FilmRoadPose> = {
  perspective: { centerX: 500, horizonY: 230, farWidth: 198, nearWidth: 768, bend: 0, tilt: 0, activeScale: 1 },
  "open-bend": { centerX: 482, horizonY: 238, farWidth: 214, nearWidth: 790, bend: -52, tilt: -2, activeScale: 1.08 },
  "s-curve": { centerX: 510, horizonY: 220, farWidth: 202, nearWidth: 760, bend: 74, tilt: 3, activeScale: 1.04 },
  "active-frame": { centerX: 500, horizonY: 260, farWidth: 232, nearWidth: 812, bend: 5, tilt: 0, activeScale: 1.18 },
  diagonal: { centerX: 480, horizonY: 218, farWidth: 202, nearWidth: 820, bend: 94, tilt: -6, activeScale: 1.06 },
  outro: { centerX: 500, horizonY: 246, farWidth: 216, nearWidth: 700, bend: 24, tilt: 0, activeScale: 1.1 },
};

export function getFilmRoadPose(variant: FilmRoadVariant, compact: boolean) {
  return (compact ? compactFilmRoadConfig : desktopFilmRoadConfig)[variant];
}

export function interpolateFilmRoadPose(from: FilmRoadPose, to: FilmRoadPose, progress: number): FilmRoadPose {
  const amount = Math.max(0, Math.min(1, progress));
  const interpolate = (start: number, end: number) => start + (end - start) * amount;

  return {
    centerX: interpolate(from.centerX, to.centerX),
    horizonY: interpolate(from.horizonY, to.horizonY),
    farWidth: interpolate(from.farWidth, to.farWidth),
    nearWidth: interpolate(from.nearWidth, to.nearWidth),
    bend: interpolate(from.bend, to.bend),
    tilt: interpolate(from.tilt, to.tilt),
    activeScale: interpolate(from.activeScale, to.activeScale),
  };
}
