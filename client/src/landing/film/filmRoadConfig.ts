export interface FilmRoadPose {
  centerX: number;
  horizonY: number;
  farWidth: number;
  nearWidth: number;
}

const desktopFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 236,
  farWidth: 116,
  nearWidth: 480,
};

const compactFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 240,
  farWidth: 170,
  nearWidth: 640,
};

export function getFilmRoadPose(compact: boolean) {
  return compact ? compactFilmRoadPose : desktopFilmRoadPose;
}
