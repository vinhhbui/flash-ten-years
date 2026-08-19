import sharp from "sharp";

const maxInputPixels = 40_000_000;
const paperColorDistance = 105;

export class ScanPreprocessError extends Error {}

export async function preprocessScan(inputPath: string): Promise<Buffer> {
  const { data, info } = await sharp(inputPath, { failOn: "error", limitInputPixels: maxInputPixels })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) {
    throw new ScanPreprocessError("scan could not be converted to RGBA pixels");
  }

  const paperColor = estimatePaperColor(data, info.width, info.height);
  if (!paperColor) {
    throw new ScanPreprocessError("could not identify the paper background at the image edge");
  }

  removeConnectedPaperBackground(data, info.width, info.height, paperColor);
  isolatePrimaryArtwork(data, info.width, info.height, paperColor);
  if (!data.some((_value, index) => index % 4 === 3 && data[index] > 0)) {
    throw new ScanPreprocessError("scan does not contain artwork after paper background removal");
  }

  const cropped = cropToVisibleArtwork(data, info.width, info.height);

  return sharp(cropped.data, {
    raw: { width: cropped.width, height: cropped.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

type Rgb = { red: number; green: number; blue: number };

function estimatePaperColor(pixels: Buffer, width: number, height: number): Rgb | undefined {
  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];
  const addSample = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    const pixel = { red: pixels[offset]!, green: pixels[offset + 1]!, blue: pixels[offset + 2]! };
    if (!isLightNeutralPixel(pixel) || pixels[offset + 3]! < 128) return;
    red.push(pixel.red);
    green.push(pixel.green);
    blue.push(pixel.blue);
  };
  const step = Math.max(1, Math.floor(Math.max(width, height) / 600));

  for (let x = 0; x < width; x += step) {
    addSample(x);
    addSample((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += step) {
    addSample(y * width);
    addSample(y * width + width - 1);
  }

  if (!red.length) return undefined;
  return { red: median(red), green: median(green), blue: median(blue) };
}

function removeConnectedPaperBackground(pixels: Buffer, width: number, height: number, paperColor: Rgb) {
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;
  const enqueueIfPaper = (pixelIndex: number) => {
    if (visited[pixelIndex]) return;
    const offset = pixelIndex * 4;
    const pixel = { red: pixels[offset]!, green: pixels[offset + 1]!, blue: pixels[offset + 2]! };
    if (!isPaperPixel(pixel, pixels[offset + 3]!, paperColor)) return;
    visited[pixelIndex] = 1;
    queue[tail] = pixelIndex;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueIfPaper(x);
    enqueueIfPaper((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueIfPaper(y * width);
    enqueueIfPaper(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = queue[head]!;
    head += 1;
    const x = pixelIndex % width;
    if (x > 0) enqueueIfPaper(pixelIndex - 1);
    if (x + 1 < width) enqueueIfPaper(pixelIndex + 1);
    if (pixelIndex >= width) enqueueIfPaper(pixelIndex - width);
    if (pixelIndex + width < pixelCount) enqueueIfPaper(pixelIndex + width);
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (visited[pixelIndex]) pixels[pixelIndex * 4 + 3] = 0;
  }
}

function isolatePrimaryArtwork(pixels: Buffer, width: number, height: number, paperColor: Rgb) {
  const pixelCount = width * height;
  const ink = createInkMask(pixels, paperColor);
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let largestComponentSize = 0;
  let largestComponentSeed = -1;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (visited[pixelIndex] || !ink[pixelIndex]) continue;
    const size = visitForegroundComponent(ink, width, height, pixelIndex, visited, queue);
    if (size > largestComponentSize) {
      largestComponentSize = size;
      largestComponentSeed = pixelIndex;
    }
  }

  const minimumArtworkPixels = Math.max(24, Math.floor(pixelCount * 0.0001));
  if (largestComponentSeed < 0 || largestComponentSize < minimumArtworkPixels) return;

  const primaryArtwork = new Uint8Array(pixelCount);
  markForegroundComponent(ink, width, height, largestComponentSeed, primaryArtwork, queue);
  const frameClosureRadius = Math.max(2, Math.min(12, Math.round(Math.min(width, height) / 250)));
  const closedFrame = dilateFrame(primaryArtwork, width, height, frameClosureRadius);
  const outsideFrame = markOutsidePrimaryFrame(closedFrame, width, height, queue);
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (outsideFrame[pixelIndex]) pixels[pixelIndex * 4 + 3] = 0;
  }
}

function dilateFrame(frame: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const expanded = new Uint8Array(frame.length);
  for (let pixelIndex = 0; pixelIndex < frame.length; pixelIndex += 1) {
    if (!frame[pixelIndex]) continue;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const left = Math.max(0, x - radius);
    const right = Math.min(width - 1, x + radius);
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height - 1, y + radius);
    for (let targetY = top; targetY <= bottom; targetY += 1) {
      for (let targetX = left; targetX <= right; targetX += 1) {
        expanded[targetY * width + targetX] = 1;
      }
    }
  }
  return expanded;
}

function createInkMask(pixels: Buffer, paperColor: Rgb): Uint8Array {
  const ink = new Uint8Array(pixels.length / 4);
  for (let pixelIndex = 0; pixelIndex < ink.length; pixelIndex += 1) {
    const offset = pixelIndex * 4;
    const pixel = { red: pixels[offset]!, green: pixels[offset + 1]!, blue: pixels[offset + 2]! };
    ink[pixelIndex] = isPaperPixel(pixel, pixels[offset + 3]!, paperColor) ? 0 : 1;
  }
  return ink;
}

function visitForegroundComponent(
  foreground: Uint8Array,
  width: number,
  height: number,
  seed: number,
  visited: Uint8Array,
  queue: Int32Array,
): number {
  let head = 0;
  let tail = 0;
  queue[tail] = seed;
  tail += 1;
  visited[seed] = 1;

  while (head < tail) {
    const pixelIndex = queue[head]!;
    head += 1;
    forEachNeighbor(pixelIndex, width, height, (neighbor) => {
      if (visited[neighbor] || !foreground[neighbor]) return;
      visited[neighbor] = 1;
      queue[tail] = neighbor;
      tail += 1;
    });
  }
  return tail;
}

function markForegroundComponent(
  foreground: Uint8Array,
  width: number,
  height: number,
  seed: number,
  component: Uint8Array,
  queue: Int32Array,
) {
  let head = 0;
  let tail = 0;
  queue[tail] = seed;
  tail += 1;
  component[seed] = 1;

  while (head < tail) {
    const pixelIndex = queue[head]!;
    head += 1;
    forEachNeighbor(pixelIndex, width, height, (neighbor) => {
      if (component[neighbor] || !foreground[neighbor]) return;
      component[neighbor] = 1;
      queue[tail] = neighbor;
      tail += 1;
    });
  }
}

function markOutsidePrimaryFrame(primaryArtwork: Uint8Array, width: number, height: number, queue: Int32Array): Uint8Array {
  const pixelCount = width * height;
  const outside = new Uint8Array(pixelCount);
  let head = 0;
  let tail = 0;
  const enqueueOutside = (pixelIndex: number) => {
    if (outside[pixelIndex] || primaryArtwork[pixelIndex]) return;
    outside[pixelIndex] = 1;
    queue[tail] = pixelIndex;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueOutside(x);
    enqueueOutside((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueOutside(y * width);
    enqueueOutside(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = queue[head]!;
    head += 1;
    forEachCardinalNeighbor(pixelIndex, width, height, enqueueOutside);
  }
  return outside;
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

function forEachCardinalNeighbor(
  pixelIndex: number,
  width: number,
  height: number,
  callback: (neighbor: number) => void,
) {
  const x = pixelIndex % width;
  if (x > 0) callback(pixelIndex - 1);
  if (x + 1 < width) callback(pixelIndex + 1);
  if (pixelIndex >= width) callback(pixelIndex - width);
  if (pixelIndex + width < width * height) callback(pixelIndex + width);
}

function cropToVisibleArtwork(pixels: Buffer, width: number, height: number) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) {
    throw new ScanPreprocessError("scan does not contain visible artwork");
  }

  const padding = Math.max(4, Math.ceil(Math.max(right - left + 1, bottom - top + 1) * 0.025));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  const croppedWidth = right - left + 1;
  const croppedHeight = bottom - top + 1;
  const croppedPixels = Buffer.alloc(croppedWidth * croppedHeight * 4);

  for (let y = 0; y < croppedHeight; y += 1) {
    const sourceStart = ((top + y) * width + left) * 4;
    const destinationStart = y * croppedWidth * 4;
    pixels.copy(croppedPixels, destinationStart, sourceStart, sourceStart + croppedWidth * 4);
  }
  return { data: croppedPixels, width: croppedWidth, height: croppedHeight };
}

function isLightNeutralPixel(pixel: Rgb): boolean {
  const brightness = (pixel.red + pixel.green + pixel.blue) / 3;
  const chroma = Math.max(pixel.red, pixel.green, pixel.blue) - Math.min(pixel.red, pixel.green, pixel.blue);
  return brightness >= 160 && chroma <= 80;
}

function isPaperPixel(pixel: Rgb, alpha: number, paperColor: Rgb): boolean {
  if (alpha < 128) return true;
  const chroma = Math.max(pixel.red, pixel.green, pixel.blue) - Math.min(pixel.red, pixel.green, pixel.blue);
  const paperChroma = Math.max(paperColor.red, paperColor.green, paperColor.blue)
    - Math.min(paperColor.red, paperColor.green, paperColor.blue);
  const distance = Math.hypot(
    pixel.red - paperColor.red,
    pixel.green - paperColor.green,
    pixel.blue - paperColor.blue,
  );
  return distance <= paperColorDistance && chroma <= Math.max(55, paperChroma + 30);
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)]!;
}
