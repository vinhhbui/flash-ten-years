interface SpatialNode {
  element: HTMLElement;
  sceneZ: number;
  worldX: number;
  worldY: number;
  localZ: number;
  rotation: number;
  passDepth: number;
}

interface SpatialProjectorOptions {
  stage: HTMLElement;
  compact: boolean;
}

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

function resolveProjectionScale(distance: number, perspective: number, passDepth: number) {
  if (distance >= 0) {
    return Math.max(0.035, perspective / (perspective + distance));
  }

  const passProgress = clamp(-distance / Math.max(1, passDepth), 0, 1);
  return 1 / (1 - passProgress * 0.92);
}

export function createSpatialProjector({ stage, compact }: SpatialProjectorOptions) {
  const perspective = compact ? 860 : 1120;
  const firstSceneRevealDistance = compact ? 4400 : 5200;
  const firstSceneRevealRange = compact ? 2600 : 3400;
  const futureSceneRevealDistance = compact ? 1400 : 1600;
  const futureSceneRevealRange = compact ? 1400 : 1600;
  let width = 0;
  let height = 0;

  const nodes = Array.from(stage.querySelectorAll<HTMLElement>("[data-spatial-node]")).map((element): SpatialNode | null => {
    const scene = element.closest<HTMLElement>("[data-depth-scene]");
    if (!scene) return null;

    return {
      element,
      sceneZ: Number(scene.dataset.worldZ),
      worldX: Number(element.dataset.worldX),
      worldY: Number(element.dataset.worldY),
      localZ: Number(element.dataset.localZ),
      rotation: Number(element.dataset.rotation),
      passDepth: Number(element.dataset.passDepth),
    };
  }).filter((node): node is SpatialNode => node !== null);
  const firstSceneZ = Math.min(...nodes.map((node) => node.sceneZ));

  const resize = () => {
    width = stage.clientWidth;
    height = stage.clientHeight;
  };

  const render = (cameraZ: number) => {
    if (!width || !height) resize();

    const vanishingX = width * 0.5;
    const vanishingY = height * (compact ? 0.48 : 0.47);

    nodes.forEach((node) => {
      const sceneDistance = node.sceneZ - cameraZ;
      const distance = node.sceneZ - node.localZ - cameraZ;
      const scale = resolveProjectionScale(distance, perspective, node.passDepth);
      const pastCamera = distance <= -node.passDepth;
      const isFirstScene = node.sceneZ === firstSceneZ;
      const revealDistance = isFirstScene ? firstSceneRevealDistance : futureSceneRevealDistance;
      const revealRange = isFirstScene ? firstSceneRevealRange : futureSceneRevealRange;
      const farHaze = clamp((revealDistance - sceneDistance) / revealRange, 0, 1);
      const opacity = pastCamera ? 0 : farHaze;
      const x = vanishingX + node.worldX * scale;
      const y = vanishingY + node.worldY * scale;

      node.element.style.visibility = opacity > 0.01 ? "visible" : "hidden";
      node.element.style.opacity = opacity.toFixed(3);
      node.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)}) rotate(${node.rotation}deg)`;
    });
  };

  resize();

  return { render, resize };
}
