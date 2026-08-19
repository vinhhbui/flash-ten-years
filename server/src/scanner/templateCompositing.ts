import type { RawRgbaImage } from "./imageTypes.js";
import type { TemplatePreprocessProfile } from "./templateProfiles.js";

export interface Rgb {
  red: number;
  green: number;
  blue: number;
}

export interface TemplateComposition {
  image: RawRgbaImage;
  guestChangedPixelCount: number;
}

interface TemplateCompositionInput {
  scan: RawRgbaImage;
  blankTemplate: RawRgbaImage;
  allowedRegionMask: RawRgbaImage;
  bodyFillMask: RawRgbaImage;
  guideStrokeMask: RawRgbaImage;
  paperColor: Rgb;
  profile: TemplatePreprocessProfile;
}

export function composeTemplateArtwork(input: TemplateCompositionInput): TemplateComposition {
  const { scan, blankTemplate, allowedRegionMask, bodyFillMask, guideStrokeMask, paperColor, profile } = input;
  const pixelCount = scan.width * scan.height;
  const captureMask = createArtworkCaptureMask(
    allowedRegionMask,
    profile.output.outsideCaptureRadiusPx,
  );
  const guideCleanupBand = createGuideCleanupBand(
    guideStrokeMask,
    profile.guide.cleanupBandPaddingPx,
  );
  const interiorChanges = new Uint8Array(pixelCount);
  const outsideCandidates = new Uint8Array(pixelCount);

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const offset = pixelIndex * 4;
    const insideCharacter = allowedRegionMask.data[offset]! > 128;
    if (!insideCharacter && !captureMask[pixelIndex]) continue;
    if (scan.data[offset + 3]! < 128) continue;
    const corrected = correctPaperColor(scan.data, offset, paperColor);
    const difference = Math.hypot(
      corrected.red - blankTemplate.data[offset]!,
      corrected.green - blankTemplate.data[offset + 1]!,
      corrected.blue - blankTemplate.data[offset + 2]!,
    );
    // The guide mask is deliberately widened so interpolation halos from a scan
    // are compared against the template before they can become outside artwork.
    const threshold = guideCleanupBand[pixelIndex]
      ? profile.guideDifferenceThreshold
      : insideCharacter
        ? profile.differenceThreshold
        : profile.output.outsideDifferenceThreshold;
    if (difference <= threshold) continue;
    if (insideCharacter) {
      interiorChanges[pixelIndex] = 1;
    } else if (profile.output.preserveOutsideUserStrokes) {
      outsideCandidates[pixelIndex] = 1;
    }
  }

  const outsideChanges = filterOutsideComponents(
    outsideCandidates,
    scan.width,
    scan.height,
    profile.output.minimumOutsideComponentPixels,
  );
  const guestChangedPixelCount = countMaskPixels(interiorChanges) + countMaskPixels(outsideChanges);
  const output = composeFinalSprite(
    scan,
    bodyFillMask,
    interiorChanges,
    outsideChanges,
    profile,
  );
  return {
    image: { data: output, width: scan.width, height: scan.height },
    guestChangedPixelCount,
  };
}

export function createArtworkCaptureMask(mask: RawRgbaImage, radius: number): Uint8Array {
  const source = createBinaryMask(mask);
  if (radius <= 0) return source;
  return dilateMask(source, mask.width, mask.height, Math.floor(radius));
}

export function createGuideCleanupBand(mask: RawRgbaImage, paddingPx: number): Uint8Array {
  const source = createBinaryMask(mask);
  if (paddingPx <= 0) return source;
  return dilateMask(source, mask.width, mask.height, Math.floor(paddingPx));
}

function createBinaryMask(mask: RawRgbaImage): Uint8Array {
  const source = new Uint8Array(mask.width * mask.height);
  for (let pixelIndex = 0; pixelIndex < source.length; pixelIndex += 1) {
    source[pixelIndex] = mask.data[pixelIndex * 4]! > 128 ? 1 : 0;
  }
  return source;
}

function composeFinalSprite(
  scan: RawRgbaImage,
  bodyFillMask: RawRgbaImage,
  interiorChanges: Uint8Array,
  outsideChanges: Uint8Array,
  profile: TemplatePreprocessProfile,
): Buffer {
  const output = Buffer.alloc(scan.data.length);
  for (let pixelIndex = 0; pixelIndex < interiorChanges.length; pixelIndex += 1) {
    const offset = pixelIndex * 4;
    const insideBodyFill = bodyFillMask.data[offset]! > 128;
    if (insideBodyFill && profile.output.preserveCharacterInterior) {
      output[offset] = 255;
      output[offset + 1] = 255;
      output[offset + 2] = 255;
      output[offset + 3] = 255;
    }
    if (!interiorChanges[pixelIndex] && !outsideChanges[pixelIndex]) continue;
    output[offset] = scan.data[offset]!;
    output[offset + 1] = scan.data[offset + 1]!;
    output[offset + 2] = scan.data[offset + 2]!;
    output[offset + 3] = 255;
  }
  return output;
}

function filterOutsideComponents(mask: Uint8Array, width: number, height: number, minimumPixels: number): Uint8Array {
  const retained = new Uint8Array(mask.length);
  const visited = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex += 1) {
    if (!mask[pixelIndex] || visited[pixelIndex]) continue;
    let head = 0;
    let tail = 0;
    queue[tail] = pixelIndex;
    tail += 1;
    visited[pixelIndex] = 1;
    while (head < tail) {
      const current = queue[head]!;
      head += 1;
      forEachNeighbor(current, width, height, (neighbor) => {
        if (!mask[neighbor] || visited[neighbor]) return;
        visited[neighbor] = 1;
        queue[tail] = neighbor;
        tail += 1;
      });
    }
    if (tail < minimumPixels) continue;
    for (let index = 0; index < tail; index += 1) retained[queue[index]!] = 1;
  }
  return retained;
}

function dilateMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const horizontal = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    for (let x = -radius; x < width; x += 1) {
      const entering = x + radius;
      const leaving = x - radius - 1;
      if (entering < width) count += mask[y * width + entering]!;
      if (leaving >= 0) count -= mask[y * width + leaving]!;
      if (x >= 0) horizontal[y * width + x] = count > 0 ? 1 : 0;
    }
  }
  const expanded = new Uint8Array(mask.length);
  for (let x = 0; x < width; x += 1) {
    let count = 0;
    for (let y = -radius; y < height; y += 1) {
      const entering = y + radius;
      const leaving = y - radius - 1;
      if (entering < height) count += horizontal[entering * width + x]!;
      if (leaving >= 0) count -= horizontal[leaving * width + x]!;
      if (y >= 0) expanded[y * width + x] = count > 0 ? 1 : 0;
    }
  }
  return expanded;
}

function correctPaperColor(pixels: Buffer, offset: number, paperColor: Rgb): Rgb {
  return {
    red: clampColor(pixels[offset]! + 255 - paperColor.red),
    green: clampColor(pixels[offset + 1]! + 255 - paperColor.green),
    blue: clampColor(pixels[offset + 2]! + 255 - paperColor.blue),
  };
}

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function countMaskPixels(mask: Uint8Array): number {
  let count = 0;
  for (const pixel of mask) count += pixel;
  return count;
}

function forEachNeighbor(
  pixelIndex: number,
  width: number,
  height: number,
  callback: (neighbor: number) => void,
) {
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);
  const left = Math.max(0, x - 1);
  const right = Math.min(width - 1, x + 1);
  const top = Math.max(0, y - 1);
  const bottom = Math.min(height - 1, y + 1);
  for (let neighborY = top; neighborY <= bottom; neighborY += 1) {
    for (let neighborX = left; neighborX <= right; neighborX += 1) {
      if (neighborX === x && neighborY === y) continue;
      callback(neighborY * width + neighborX);
    }
  }
}
