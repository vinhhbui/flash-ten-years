import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FilmRoadHandle } from "../film/FilmRoad";
import {
  CAMERA_END_Z,
  CAMERA_START_Z,
  MASTER_TIMELINE_DURATION,
  MASTER_SCROLL_VH,
  getFilmRoadState,
  masterTimelineLabels,
} from "./motionConfig";
import { createSpatialProjector } from "./spatialProjection";

interface CreateMasterTimelineArgs {
  track: HTMLDivElement;
  stage: HTMLElement;
  film: FilmRoadHandle;
  compact: boolean;
}

export function createMasterTimeline({ track, stage, film, compact }: CreateMasterTimelineArgs) {
  const background = stage.querySelector<HTMLElement>("[data-stage-background]");
  if (!background) return null;

  const projector = createSpatialProjector({ stage, compact });
  const camera = { z: CAMERA_START_Z };
  const cameraTravel = CAMERA_END_Z - CAMERA_START_Z;
  const renderWorld = () => {
    projector.render(camera.z);
    film.setState(getFilmRoadState((camera.z - CAMERA_START_Z) / cameraTravel));
  };

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
      onRefresh: () => {
        projector.resize();
        renderWorld();
      },
    },
  });

  Object.entries(masterTimelineLabels).forEach(([label, position]) => master.addLabel(label, position));

  const backgroundTransitions = [
    { color: "#25254b", position: 12 },
    { color: "#221426", position: 23 },
    { color: "#10111b", position: 34 },
    { color: "#17203a", position: 45 },
    { color: "#281814", position: 56 },
    { color: "#211936", position: 67 },
    { color: "#1c2412", position: 78 },
    { color: "#10111b", position: 89 },
  ];

  master.set(background, { backgroundColor: "#10111b" }, 0);
  backgroundTransitions.forEach(({ color, position }) => {
    master.to(background, { backgroundColor: color, duration: 7 }, position);
  });
  master.to(camera, { z: CAMERA_END_Z, duration: MASTER_TIMELINE_DURATION }, 0);

  master.eventCallback("onUpdate", renderWorld);
  renderWorld();

  return master;
}
