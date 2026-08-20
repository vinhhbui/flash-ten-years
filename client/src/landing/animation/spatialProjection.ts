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

export function createSpatialProjector({ stage, compact }: SpatialProjectorOptions) {
  const perspective = compact ? 860 : 1120;
  const hazeDistance = compact ? 4400 : 5200;
  const hazeRange = compact ? 2600 : 3400;
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

  const resize = () => {
    width = stage.clientWidth;
    height = stage.clientHeight;
  };

  const render = (cameraZ: number) => {
    if (!width || !height) resize();

    const vanishingX = width * 0.5;
    const vanishingY = height * (compact ? 0.48 : 0.47);

    nodes.forEach((node) => {
      const distance = node.sceneZ - node.localZ - cameraZ;
      const boundedDistance = Math.max(distance, -perspective * 0.84);
      const scale = clamp(perspective / (perspective + boundedDistance), 0.035, compact ? 4.6 : 6.2);
      const pastCamera = distance < -node.passDepth;
      const farHaze = clamp((hazeDistance - distance) / hazeRange, 0, 1);
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
