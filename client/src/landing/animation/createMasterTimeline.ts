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
  exitX: number;
  exitY: number;
  rotationY: number;
  first?: boolean;
  settle?: boolean;
}

const depthBeats: DepthBeatConfig[] = [
  { id: "flash10", start: 0, laneX: 0, exitX: -72, exitY: 48, rotationY: -12, first: true },
  { id: "ten-years", start: 4, laneX: -8, exitX: 74, exitY: -44, rotationY: 11 },
  { id: "connected", start: 18, laneX: 8, exitX: -64, exitY: 42, rotationY: -10 },
  { id: "flashback", start: 32, laneX: -5, exitX: 70, exitY: 48, rotationY: 10 },
  { id: "memory", start: 46, laneX: 0, exitX: 0, exitY: 0, rotationY: 0, settle: true },
];

function addDepthBeat(
  master: gsap.core.Timeline,
  beat: HTMLElement,
  config: DepthBeatConfig,
  compact: boolean,
) {
  const object = beat.querySelector<HTMLElement>(".depth-beat__object");
  const farScale = compact ? 0.18 : 0.16;
  const approachScale = compact ? 0.5 : 0.38;
  const foregroundScale = compact ? 3.2 : 6;
  const laneX = `${config.laneX}vw`;
  const entryDuration = config.first ? 6 : 7;
  const readStart = config.first ? config.start : config.start + entryDuration;
  const foregroundStart = readStart + 6;

  master.set(beat, { autoAlpha: 0 }, 0);

  if (config.first) {
    master.set(beat, {
      autoAlpha: 1,
      xPercent: -50,
      yPercent: -50,
      x: laneX,
      y: "7vh",
      z: -620,
      scale: approachScale,
      rotationY: config.rotationY * 0.5,
      rotationX: 3,
      rotationZ: -1,
    }, config.start);
  } else {
    master.set(beat, {
      autoAlpha: 1,
      xPercent: -50,
      yPercent: -50,
      x: laneX,
      y: "0vh",
      z: -900,
      scale: farScale,
      rotationY: config.rotationY * 0.35,
      rotationX: 2,
      rotationZ: 0,
    }, config.start);
    master.to(beat, {
      y: "8vh",
      z: -620,
      scale: approachScale,
      rotationY: config.rotationY * 0.7,
      rotationX: 3,
      duration: entryDuration,
    }, config.start);
  }

  master.to(beat, {
    y: "18vh",
    z: -70,
    scale: 1,
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0,
    duration: 6,
  }, readStart);

  if (object) {
    master.to(object, {
      rotation: config.rotationY * -1.8,
      duration: 6,
    }, readStart - 2);
  }

  if (config.settle) {
    master.to(beat, {
      y: "20vh",
      z: -10,
      scale: 1.06,
      duration: 14,
    }, foregroundStart);
    return;
  }

  master.to(beat, {
    y: "27vh",
    z: 250,
    scale: compact ? 1.65 : 1.95,
    rotationY: config.rotationY * 0.4,
    rotationX: -3,
    duration: 4,
  }, foregroundStart);

  master.to(beat, {
    x: `${config.exitX}vw`,
    y: `${config.exitY}vh`,
    z: 380,
    scale: foregroundScale,
    rotationY: config.rotationY,
    rotationX: -8,
    rotationZ: config.rotationY * 0.35,
    duration: 7,
  }, foregroundStart + 4);

  // The beat is hidden only after its geometry has moved beyond the camera.
  master.set(beat, { autoAlpha: 0 }, foregroundStart + 11);
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
      scrub: 0.8,
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
