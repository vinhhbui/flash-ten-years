export interface FilmRoadPose {
  centerX: number;
  horizonY: number;
  farWidth: number;
  nearWidth: number;
  depthPower: number;
  widthPower: number;
  verticalReach: number;
  depthRange: number;
}

const desktopFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 178,
  farWidth: 100,
  nearWidth: 735,
  depthPower: 2.15,
  widthPower: 10,
  verticalReach: 1050,
  depthRange: 1.24,
};

const compactFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 180,
  farWidth: 200,
  nearWidth: 1000,
  depthPower: 2.15,
  widthPower: 10,
  verticalReach: 1050,
  depthRange: 1.24,
};

export function getFilmRoadPose(compact: boolean) {
  return compact ? compactFilmRoadPose : desktopFilmRoadPose;
}
