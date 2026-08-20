import type { FilmRoadState } from "../film/FilmRoad";
import type { FilmRoadVariant } from "../film/filmRoadConfig";

export const sceneIds = ["hero", "manifesto", "media", "takeover", "culture", "final"] as const;

export type MotionSceneId = (typeof sceneIds)[number];

interface SceneMotionConfig {
  desktopPinVh: number;
  compactPinVh: number;
  filmFrom: FilmRoadVariant;
  filmTo: FilmRoadVariant;
  reelStart: number;
  reelEnd: number;
}

export const sceneMotionConfig: Record<MotionSceneId, SceneMotionConfig> = {
  hero: { desktopPinVh: 2.25, compactPinVh: 1.35, filmFrom: "perspective", filmTo: "open-bend", reelStart: 0.04, reelEnd: 0.92 },
  manifesto: { desktopPinVh: 1.9, compactPinVh: 1.2, filmFrom: "open-bend", filmTo: "s-curve", reelStart: 0.92, reelEnd: 1.66 },
  media: { desktopPinVh: 2.2, compactPinVh: 1.35, filmFrom: "s-curve", filmTo: "diagonal", reelStart: 1.66, reelEnd: 2.58 },
  takeover: { desktopPinVh: 1.8, compactPinVh: 1.15, filmFrom: "diagonal", filmTo: "active-frame", reelStart: 2.58, reelEnd: 3.34 },
  culture: { desktopPinVh: 2.05, compactPinVh: 1.3, filmFrom: "active-frame", filmTo: "open-bend", reelStart: 3.34, reelEnd: 4.17 },
  final: { desktopPinVh: 1.2, compactPinVh: 0.9, filmFrom: "open-bend", filmTo: "outro", reelStart: 4.17, reelEnd: 4.58 },
};

export function getFilmRoadState(scene: MotionSceneId, progress: number): FilmRoadState {
  const config = sceneMotionConfig[scene];
  const amount = Math.max(0, Math.min(1, progress));

  return {
    from: config.filmFrom,
    to: config.filmTo,
    mix: amount,
    reel: config.reelStart + (config.reelEnd - config.reelStart) * amount,
  };
}
