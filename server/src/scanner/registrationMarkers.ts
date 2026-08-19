import type { Point, RawRgbaImage } from "./imageTypes.js";

export interface CanonicalRegistrationMarker {
  x: number;
  y: number;
  size: number;
}

export interface RegistrationMarkerConfig {
  cornerRoiRatio: number;
  darkThreshold: number;
  minimumSizeRatio: number;
  maximumSizeRatio: number;
  minimumSquareRatio: number;
  markers: CanonicalRegistrationMarker[];
}

export interface DetectedRegistrationMarker {
  center: Point;
  size: number;
}

interface Roi {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MarkerCandidate extends DetectedRegistrationMarker {
  score: number;
}

export function detectRegistrationMarkers(
  image: RawRgbaImage,
  canonicalWidth: number,
  canonicalHeight: number,
  config: RegistrationMarkerConfig,
): DetectedRegistrationMarker[] | undefined {
  if (config.markers.length !== 4) return undefined;
  const roiWidth = Math.ceil(image.width * config.cornerRoiRatio);
  const roiHeight = Math.ceil(image.height * config.cornerRoiRatio);
  const sourceScale = Math.min(image.width / canonicalWidth, image.height / canonicalHeight);
  const expectedSize = average(config.markers.map((marker) => marker.size)) * sourceScale;
  const rois: Roi[] = [
    { left: 0, top: 0, width: roiWidth, height: roiHeight },
    { left: image.width - roiWidth, top: 0, width: roiWidth, height: roiHeight },
    { left: 0, top: image.height - roiHeight, width: roiWidth, height: roiHeight },
    { left: image.width - roiWidth, top: image.height - roiHeight, width: roiWidth, height: roiHeight },
  ];
  const markers = rois.map((roi) => findBestMarker(image, roi, expectedSize, config));
  if (markers.some((marker) => !marker)) return undefined;

  const detected = markers as DetectedRegistrationMarker[];
  return isPlausibleMarkerLayout(detected, image) ? detected : undefined;
}

function findBestMarker(
  image: RawRgbaImage,
  roi: Roi,
  expectedSize: number,
  config: RegistrationMarkerConfig,
): MarkerCandidate | undefined {
  const visited = new Uint8Array(roi.width * roi.height);
  const queue = new Int32Array(roi.width * roi.height);
  let best: MarkerCandidate | undefined;

  for (let localY = 0; localY < roi.height; localY += 1) {
    for (let localX = 0; localX < roi.width; localX += 1) {
      const localIndex = localY * roi.width + localX;
      if (visited[localIndex]) continue;
      visited[localIndex] = 1;
      const startX = roi.left + localX;
      const startY = roi.top + localY;
      if (!isDarkPixel(image, startX, startY, config.darkThreshold)) continue;

      let head = 0;
      let tail = 0;
      queue[tail] = localIndex;
      tail += 1;
      let left = startX;
      let right = startX;
      let top = startY;
      let bottom = startY;

      while (head < tail) {
        const current = queue[head]!;
        head += 1;
        const currentX = current % roi.width;
        const currentY = Math.floor(current / roi.width);
        const minX = Math.max(0, currentX - 1);
        const maxX = Math.min(roi.width - 1, currentX + 1);
        const minY = Math.max(0, currentY - 1);
        const maxY = Math.min(roi.height - 1, currentY + 1);
        for (let neighborY = minY; neighborY <= maxY; neighborY += 1) {
          for (let neighborX = minX; neighborX <= maxX; neighborX += 1) {
            const neighbor = neighborY * roi.width + neighborX;
            if (visited[neighbor]) continue;
            visited[neighbor] = 1;
            const imageX = roi.left + neighborX;
            const imageY = roi.top + neighborY;
            if (!isDarkPixel(image, imageX, imageY, config.darkThreshold)) continue;
            queue[tail] = neighbor;
            tail += 1;
            left = Math.min(left, imageX);
            right = Math.max(right, imageX);
            top = Math.min(top, imageY);
            bottom = Math.max(bottom, imageY);
          }
        }
      }

      const candidate = scoreMarkerCandidate(left, right, top, bottom, tail, expectedSize, config);
      if (candidate && (!best || candidate.score > best.score)) best = candidate;
    }
  }
  return best;
}

function scoreMarkerCandidate(
  left: number,
  right: number,
  top: number,
  bottom: number,
  area: number,
  expectedSize: number,
  config: RegistrationMarkerConfig,
): MarkerCandidate | undefined {
  const width = right - left + 1;
  const height = bottom - top + 1;
  const size = (width + height) / 2;
  const minimumSize = Math.max(4, expectedSize * config.minimumSizeRatio);
  const maximumSize = expectedSize * config.maximumSizeRatio;
  if (size < minimumSize || size > maximumSize) return undefined;
  const squareRatio = Math.min(width, height) / Math.max(width, height);
  if (squareRatio < config.minimumSquareRatio) return undefined;
  const fillRatio = area / (width * height);
  if (fillRatio < 0.45) return undefined;
  const sizeScore = 1 - Math.min(1, Math.abs(size - expectedSize) / Math.max(expectedSize, 1));
  return {
    center: { x: left + width / 2, y: top + height / 2 },
    size,
    score: squareRatio * 2 + fillRatio + sizeScore,
  };
}

function isDarkPixel(image: RawRgbaImage, x: number, y: number, threshold: number): boolean {
  const offset = (y * image.width + x) * 4;
  return image.data[offset + 3]! >= 128
    && image.data[offset]! <= threshold
    && image.data[offset + 1]! <= threshold
    && image.data[offset + 2]! <= threshold;
}

function isPlausibleMarkerLayout(markers: DetectedRegistrationMarker[], image: RawRgbaImage): boolean {
  const [topLeft, topRight, bottomLeft, bottomRight] = markers;
  if (!topLeft || !topRight || !bottomLeft || !bottomRight) return false;
  const topWidth = topRight.center.x - topLeft.center.x;
  const bottomWidth = bottomRight.center.x - bottomLeft.center.x;
  const leftHeight = bottomLeft.center.y - topLeft.center.y;
  const rightHeight = bottomRight.center.y - topRight.center.y;
  return topWidth > image.width * 0.45
    && bottomWidth > image.width * 0.45
    && leftHeight > image.height * 0.45
    && rightHeight > image.height * 0.45;
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
