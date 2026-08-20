export interface FilmRoadPose {
  centerX: number;
  horizonY: number;
  farWidth: number;
  nearWidth: number;
}

const desktopFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 232,
  farWidth: 132,
  nearWidth: 408,
};

const compactFilmRoadPose: FilmRoadPose = {
  centerX: 500,
  horizonY: 238,
  farWidth: 190,
  nearWidth: 460,
};

export function getFilmRoadPose(compact: boolean) {
  return compact ? compactFilmRoadPose : desktopFilmRoadPose;
}
