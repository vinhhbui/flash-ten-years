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

  master
    .set(background, { backgroundColor: "#10111b" }, 0)
    .to(background, { backgroundColor: "#25254b", duration: 24 }, 26)
    .to(background, { backgroundColor: "#10111b", duration: 28 }, 66)
    .to(camera, { z: CAMERA_END_Z, duration: MASTER_TIMELINE_DURATION }, 0);

  master.eventCallback("onUpdate", renderWorld);
  renderWorld();

  return master;
}
