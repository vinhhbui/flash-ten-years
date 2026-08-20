import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmRoadHandle } from "../film/FilmRoad";
import {
  MASTER_SCROLL_VH,
  getFilmRoadState,
  masterTimelineLabels,
} from "./motionConfig";

interface CreateMasterTimelineArgs {
  track: HTMLDivElement;
  stage: HTMLElement;
  film: FilmRoadHandle;
  compact: boolean;
}

interface DepthBeatConfig {
  id: string;
  start: number;
  laneX: number;
  passDriftX: number;
  rotationY: number;
  settle?: boolean;
}

const depthBeats: DepthBeatConfig[] = [
  { id: "flash10", start: 0, laneX: 0, passDriftX: -10, rotationY: -3 },
  { id: "ten-years", start: 15, laneX: -3, passDriftX: 12, rotationY: 3 },
  { id: "connected", start: 30, laneX: 3, passDriftX: -8, rotationY: -2 },
  { id: "flashback", start: 45, laneX: -2, passDriftX: 10, rotationY: 2 },
  { id: "memory", start: 60, laneX: 0, passDriftX: 0, rotationY: 0, settle: true },
];

function addDepthBeat(
  master: gsap.core.Timeline,
  beat: HTMLElement,
  config: DepthBeatConfig,
  compact: boolean,
) {
  const farScale = compact ? 0.15 : 0.12;
  const approachScale = compact ? 0.36 : 0.32;
  const foregroundScale = compact ? 4.2 : 5.2;
  const laneX = `${config.laneX}vw`;
  const approachStart = config.start + 7;
  const readStart = approachStart + 5;
  const nearStart = readStart + 4;
  const passStart = nearStart + 4;

  if (config.start > 0) {
    master.set(beat, { autoAlpha: 0 }, 0);
  }
  master.set(beat, {
    visibility: "visible",
    opacity: 0.16,
    xPercent: -50,
    yPercent: -50,
    x: laneX,
    y: "-9vh",
    z: -1100,
    scale: farScale,
    rotationY: config.rotationY * 0.35,
    rotationX: 1,
    rotationZ: config.rotationY * -0.12,
  }, config.start);

  master.to(beat, {
    opacity: 0.62,
    y: "0vh",
    z: -620,
    scale: approachScale,
    rotationY: config.rotationY * 0.7,
    rotationX: 1.5,
    rotationZ: config.rotationY * -0.16,
    duration: 7,
  }, config.start);

  master.to(beat, {
    opacity: 1,
    y: "14vh",
    z: -80,
    scale: 0.96,
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0,
    duration: 5,
  }, approachStart);

  if (config.settle) {
    master.to(beat, {
      opacity: 1,
      y: "15vh",
      z: -40,
      scale: 1,
      duration: 24,
    }, readStart);
    return;
  }

  master.to(beat, {
    opacity: 0.96,
    y: "15vh",
    z: -40,
    scale: 1,
    duration: 4,
  }, readStart);

  master.to(beat, {
    opacity: 0.74,
    y: "24vh",
    z: 220,
    scale: compact ? 1.5 : 1.7,
    rotationY: config.rotationY * 0.45,
    rotationX: -1,
    duration: 4,
  }, nearStart);

  master.to(beat, {
    opacity: 0,
    x: `${config.passDriftX}vw`,
    y: "36vh",
    z: 780,
    scale: foregroundScale,
    rotationY: config.rotationY,
    rotationX: -2,
    rotationZ: config.rotationY * 0.25,
    duration: 5,
  }, passStart);

  // The beat is hidden only after its geometry has moved beyond the camera.
  master.set(beat, { autoAlpha: 0 }, passStart + 5);
}

export function createMasterTimeline({ track, stage, film, compact }: CreateMasterTimelineArgs) {
  const background = stage.querySelector<HTMLElement>("[data-stage-background]");
  const beats = depthBeats.map((config) => ({
    config,
    element: stage.querySelector<HTMLElement>(`[data-depth-beat='${config.id}']`),
  }));

  if (!background || beats.some(({ element }) => !element)) return null;

  const master = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: track,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * (compact ? MASTER_SCROLL_VH.compact : MASTER_SCROLL_VH.desktop))}`,
      pin: stage,
      scrub: 1.1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  Object.entries(masterTimelineLabels).forEach(([label, position]) => master.addLabel(label, position));

  master
    .set(background, { backgroundColor: "#10111b" }, 0)
    .to(background, { backgroundColor: "#25254b", duration: 28 }, 30)
    .to(background, { backgroundColor: "#10111b", duration: 28 }, 65);

  beats.forEach(({ config, element }) => {
    if (element) addDepthBeat(master, element, config, compact);
  });

  master.eventCallback("onUpdate", () => film.setState(getFilmRoadState(master.progress())));
  film.setState(getFilmRoadState(0));

  return master;
}
