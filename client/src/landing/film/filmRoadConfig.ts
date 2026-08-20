export interface FilmRoadPose {
  centerX: number;
  horizonY: number;
  foregroundY: number;
  farWidth: number;
  nearWidth: number;
  depthPower: number;
  depthRange: number;
}

const desktopFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 650,
  foregroundY: 1280,
  farWidth: 100,
  nearWidth: 680,
  depthPower: 2.15,
  depthRange: 1.24,
};

const compactFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 500,
  foregroundY: 1230,
  farWidth: 200,
  nearWidth: 820,
  depthPower: 2.15,
  depthRange: 1.24,
};

export function getFilmRoadPose(compact: boolean) {
  return compact ? compactFilmRoadPose : desktopFilmRoadPose;
}
