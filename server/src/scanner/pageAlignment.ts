import type { Point, RawRgbaImage } from "./imageTypes.js";
import type { DetectedRegistrationMarker, RegistrationMarkerConfig } from "./registrationMarkers.js";

export function normalizePageFromMarkers(
  source: RawRgbaImage,
  markers: DetectedRegistrationMarker[],
  canonicalWidth: number,
  canonicalHeight: number,
  markerConfig: RegistrationMarkerConfig,
): RawRgbaImage {
  const destinationPoints = markerConfig.markers.map((marker) => ({
    x: marker.x + marker.size / 2,
    y: marker.y + marker.size / 2,
  }));
  const sourcePoints = markers.map((marker) => marker.center);
  const transform = solveHomography(destinationPoints, sourcePoints);
  return warpProjective(source, canonicalWidth, canonicalHeight, transform);
}

function solveHomography(from: Point[], to: Point[]): number[] {
  if (from.length !== 4 || to.length !== 4) throw new Error("A projective transform requires four registration markers");
  const matrix: number[][] = [];
  for (let index = 0; index < 4; index += 1) {
    const source = from[index]!;
    const destination = to[index]!;
    matrix.push([
      source.x, source.y, 1, 0, 0, 0, -destination.x * source.x, -destination.x * source.y, destination.x,
    ]);
    matrix.push([
      0, 0, 0, source.x, source.y, 1, -destination.y * source.x, -destination.y * source.y, destination.y,
    ]);
  }
  return gaussianElimination(matrix).concat(1);
}

function gaussianElimination(matrix: number[][]): number[] {
  const size = matrix.length;
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(matrix[row]![column]!) > Math.abs(matrix[pivot]![column]!)) pivot = row;
    }
    if (Math.abs(matrix[pivot]![column]!) < 1e-8) throw new Error("Registration marker geometry is degenerate");
    [matrix[column], matrix[pivot]] = [matrix[pivot]!, matrix[column]!];
    const pivotValue = matrix[column]![column]!;
    for (let current = column; current <= size; current += 1) {
      matrix[column]![current] = matrix[column]![current]! / pivotValue;
    }
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = matrix[row]![column]!;
      if (factor === 0) continue;
      for (let current = column; current <= size; current += 1) {
        matrix[row]![current] = matrix[row]![current]! - factor * matrix[column]![current]!;
      }
    }
  }
  return matrix.map((row) => row[size]!);
}

function warpProjective(source: RawRgbaImage, width: number, height: number, transform: number[]): RawRgbaImage {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const denominator = transform[6]! * x + transform[7]! * y + transform[8]!;
      const sourceX = roundNearInteger((transform[0]! * x + transform[1]! * y + transform[2]!) / denominator);
      const sourceY = roundNearInteger((transform[3]! * x + transform[4]! * y + transform[5]!) / denominator);
      writeBilinearSample(data, (y * width + x) * 4, source, sourceX, sourceY);
    }
  }
  return { data, width, height };
}

function writeBilinearSample(target: Buffer, targetOffset: number, source: RawRgbaImage, x: number, y: number) {
  if (x < 0 || y < 0 || x > source.width - 1 || y > source.height - 1) {
    target[targetOffset] = 255;
    target[targetOffset + 1] = 255;
    target[targetOffset + 2] = 255;
    target[targetOffset + 3] = 255;
    return;
  }
  const left = Math.floor(x);
  const top = Math.floor(y);
  const right = Math.min(source.width - 1, left + 1);
  const bottom = Math.min(source.height - 1, top + 1);
  const horizontal = x - left;
  const vertical = y - top;
  for (let channel = 0; channel < 4; channel += 1) {
    const topLeft = source.data[(top * source.width + left) * 4 + channel]!;
    const topRight = source.data[(top * source.width + right) * 4 + channel]!;
    const bottomLeft = source.data[(bottom * source.width + left) * 4 + channel]!;
    const bottomRight = source.data[(bottom * source.width + right) * 4 + channel]!;
    const upper = topLeft + (topRight - topLeft) * horizontal;
    const lower = bottomLeft + (bottomRight - bottomLeft) * horizontal;
    target[targetOffset + channel] = Math.round(upper + (lower - upper) * vertical);
  }
}

function roundNearInteger(value: number): number {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < 1e-8 ? rounded : value;
}
