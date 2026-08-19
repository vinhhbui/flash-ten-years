import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { preprocessScan, ScanPreprocessError } from "./preprocessScan.js";

const templateDirectory = path.resolve(import.meta.dirname, "../../../shared/templates/cat-v1");
const printableTemplatePath = path.join(templateDirectory, "printable-template.svg");
const allowedRegionMaskPath = path.join(templateDirectory, "allowed-region-mask.svg");
const canonicalWidth = 1240;
const canonicalHeight = 1754;

interface TemplateGeometry {
  shape: {
    path: string;
    transform: string;
  };
}

let templateGeometry: Promise<TemplateGeometry> | undefined;

test("a4-cat-v1 rejects a blank template with only registration markers and guide", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "blank.png");
    await writeFile(scanPath, await createBlankTemplate());

    await assert.rejects(preprocessScan(scanPath, "a4-cat-v1"), ScanPreprocessError);
  });
});

test("a4-cat-v1 keeps normal inside coloring and removes guide and registration markers", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "inside-color.png");
    await writeFile(scanPath, await addArtwork(await createBlankTemplate(), [rectangle(600, 760, 42, 42, "#E65064")]));

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [230, 80, 100]) > 500, true);
    assert.equal(countOpaqueColor(pixels.data, [184, 184, 184]), 0);
    assert.equal(countOpaqueColor(pixels.data, [17, 17, 17]), 0);
  });
});

test("a4-cat-v1 accepts heavy red, black, and green artwork over most of the guide", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "heavy-guide-overwrite.png");
    const scan = await addArtwork(await createBlankTemplate(), [
      await outlineStroke("#F21B2B", 28),
      rectangle(570, 760, 80, 30, "#000000"),
      rectangle(560, 940, 130, 35, "#B4EE08"),
      rectangle(250, 880, 100, 35, "#F21B2B"),
    ]);
    await writeFile(scanPath, scan);

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [242, 27, 43]) > 500, true);
    assert.equal(countOpaqueColor(pixels.data, [0, 0, 0]) > 100, true);
    assert.equal(countOpaqueColor(pixels.data, [180, 238, 8]) > 100, true);
  });
});

test("a4-cat-v1 aligns from markers when the guide is completely painted over", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "fully-covered-guide.png");
    await writeFile(scanPath, await addArtwork(await createBlankTemplate(), [await outlineStroke("#F21B2B", 36)]));

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [242, 27, 43]) > 1_000, true);
  });
});

test("a4-cat-v1 clips a stroke that crosses the allowed shape boundary", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const boundary = await findLeftBoundaryPoint();
    const scanPath = path.join(workspace, "cross-boundary.png");
    const rectangleWidth = 70;
    const rectangleHeight = 40;
    await writeFile(
      scanPath,
      await addArtwork(await createBlankTemplate(), [
        rectangle(boundary.x - rectangleWidth / 2, boundary.y - rectangleHeight / 2, rectangleWidth, rectangleHeight, "#236EEA"),
      ]),
    );

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));
    const bluePixels = countOpaqueColor(pixels.data, [35, 110, 234]);

    assert.equal(bluePixels > 30, true);
    assert.equal(bluePixels < rectangleWidth * rectangleHeight, true);
  });
});

test("a4-cat-v1 preserves black guest drawing without including corner markers", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "black-artwork.png");
    await writeFile(scanPath, await addArtwork(await createBlankTemplate(), [rectangle(620, 860, 45, 45, "#000000")]));

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [0, 0, 0]) > 500, true);
    assert.equal(countOpaquePixels(pixels.data) < 2_500, true);
  });
});

test("a4-cat-v1 normalizes a slightly rotated A4 page from its markers", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "rotated.png");
    const original = await addArtwork(await createBlankTemplate(), [rectangle(600, 760, 42, 42, "#E65064")]);
    const rotated = await sharp(original).rotate(2, { background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer();
    await writeFile(scanPath, rotated);

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColorNear(pixels.data, [230, 80, 100], 12) > 500, true);
  });
});

test("a4-cat-v1 normalizes a page shifted inside a larger scanner canvas", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "shifted.png");
    const original = await addArtwork(await createBlankTemplate(), [rectangle(600, 760, 42, 42, "#E65064")]);
    const shifted = await sharp(original)
      .extend({ top: 35, bottom: 25, left: 45, right: 30, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
    await writeFile(scanPath, shifted);

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [230, 80, 100]) > 500, true);
  });
});

test("a4-cat-v1 corrects a mild projective page skew from the four markers", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "perspective.png");
    const original = await addArtwork(await createBlankTemplate(), [rectangle(600, 760, 42, 42, "#E65064")]);
    await writeFile(scanPath, await applyMildPerspectiveSkew(original));

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColorNear(pixels.data, [230, 80, 100], 16) > 450, true);
  });
});

async function withTemplateWorkspace(run: (workspace: string) => Promise<void>) {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "flash-template-test-"));
  try {
    await run(workspace);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function createBlankTemplate(): Promise<Buffer> {
  return sharp(printableTemplatePath, { density: 150 }).png().toBuffer();
}

function rectangle(x: number, y: number, width: number, height: number, fill: string): Buffer {
  return Buffer.from(
    `<svg width="${canonicalWidth}" height="${canonicalHeight}" viewBox="0 0 ${canonicalWidth} ${canonicalHeight}" xmlns="http://www.w3.org/2000/svg"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/></svg>`,
  );
}

async function outlineStroke(stroke: string, strokeWidth: number): Promise<Buffer> {
  const geometry = await getTemplateGeometry();
  return Buffer.from(
    `<svg width="${canonicalWidth}" height="${canonicalHeight}" viewBox="0 0 ${canonicalWidth} ${canonicalHeight}" xmlns="http://www.w3.org/2000/svg"><path d="${geometry.shape.path}" transform="${geometry.shape.transform}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/></svg>`,
  );
}

async function getTemplateGeometry(): Promise<TemplateGeometry> {
  templateGeometry ??= readFile(path.join(templateDirectory, "template.config.json"), "utf8")
    .then((contents) => JSON.parse(contents) as TemplateGeometry);
  return templateGeometry;
}

async function addArtwork(blankTemplate: Buffer, overlays: Buffer[]): Promise<Buffer> {
  return sharp(blankTemplate).composite(overlays.map((input) => ({ input }))).png().toBuffer();
}

async function findLeftBoundaryPoint(): Promise<{ x: number; y: number }> {
  const allowedMask = await readTemplatePixels(allowedRegionMaskPath);
  for (let y = 0; y < allowedMask.height; y += 1) {
    for (let x = 1; x < allowedMask.width; x += 1) {
      const offset = (y * allowedMask.width + x) * 4;
      const leftOffset = (y * allowedMask.width + x - 1) * 4;
      if (allowedMask.data[offset]! > 128 && allowedMask.data[leftOffset]! <= 128) return { x, y };
    }
  }
  throw new Error("The template does not have a left allowed-region boundary");
}

async function readTemplatePixels(filePath: string): Promise<{ data: Buffer; width: number; height: number }> {
  return readPixels(await sharp(filePath, { density: 150 }).png().toBuffer());
}

async function applyMildPerspectiveSkew(image: Buffer): Promise<Buffer> {
  const source = await readPixels(image);
  const transform = solveHomography(
    [
      { x: 28, y: 22 },
      { x: 1210, y: 44 },
      { x: 48, y: 1725 },
      { x: 1192, y: 1704 },
    ],
    [
      { x: 0, y: 0 },
      { x: source.width - 1, y: 0 },
      { x: 0, y: source.height - 1 },
      { x: source.width - 1, y: source.height - 1 },
    ],
  );
  const output = Buffer.alloc(source.data.length, 255);
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const denominator = transform[6]! * x + transform[7]! * y + transform[8]!;
      const sourceX = (transform[0]! * x + transform[1]! * y + transform[2]!) / denominator;
      const sourceY = (transform[3]! * x + transform[4]! * y + transform[5]!) / denominator;
      copyBilinearSample(output, (y * source.width + x) * 4, source, sourceX, sourceY);
    }
  }
  return sharp(output, { raw: { width: source.width, height: source.height, channels: 4 } }).png().toBuffer();
}

function solveHomography(from: Array<{ x: number; y: number }>, to: Array<{ x: number; y: number }>): number[] {
  const matrix: number[][] = [];
  for (let index = 0; index < 4; index += 1) {
    const source = from[index]!;
    const destination = to[index]!;
    matrix.push([source.x, source.y, 1, 0, 0, 0, -destination.x * source.x, -destination.x * source.y, destination.x]);
    matrix.push([0, 0, 0, source.x, source.y, 1, -destination.y * source.x, -destination.y * source.y, destination.y]);
  }
  for (let column = 0; column < 8; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 8; row += 1) {
      if (Math.abs(matrix[row]![column]!) > Math.abs(matrix[pivot]![column]!)) pivot = row;
    }
    [matrix[column], matrix[pivot]] = [matrix[pivot]!, matrix[column]!];
    const pivotValue = matrix[column]![column]!;
    for (let current = column; current <= 8; current += 1) matrix[column]![current] = matrix[column]![current]! / pivotValue;
    for (let row = 0; row < 8; row += 1) {
      if (row === column) continue;
      const factor = matrix[row]![column]!;
      for (let current = column; current <= 8; current += 1) {
        matrix[row]![current] = matrix[row]![current]! - factor * matrix[column]![current]!;
      }
    }
  }
  return matrix.map((row) => row[8]!).concat(1);
}

function copyBilinearSample(
  target: Buffer,
  targetOffset: number,
  source: { data: Buffer; width: number; height: number },
  x: number,
  y: number,
) {
  if (x < 0 || y < 0 || x > source.width - 1 || y > source.height - 1) return;
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

async function readPixels(image: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function countOpaquePixels(pixels: Buffer): number {
  let count = 0;
  for (let offset = 3; offset < pixels.length; offset += 4) {
    if (pixels[offset]! > 0) count += 1;
  }
  return count;
}

function countOpaqueColor(pixels: Buffer, expected: [number, number, number]): number {
  return countOpaqueColorNear(pixels, expected, 0);
}

function countOpaqueColorNear(pixels: Buffer, expected: [number, number, number], tolerance: number): number {
  let count = 0;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3]! === 0) continue;
    if (Math.abs(pixels[offset]! - expected[0]) <= tolerance
      && Math.abs(pixels[offset + 1]! - expected[1]) <= tolerance
      && Math.abs(pixels[offset + 2]! - expected[2]) <= tolerance) {
      count += 1;
    }
  }
  return count;
}
