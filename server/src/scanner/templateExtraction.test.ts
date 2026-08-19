import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import type { RawRgbaImage } from "./imageTypes.js";
import { preprocessScan, ScanPreprocessError } from "./preprocessScan.js";
import {
  composeTemplateArtwork,
  createArtworkCaptureMask,
  createGuideCleanupBand,
} from "./templateCompositing.js";
import { getTemplatePreprocessProfile, type TemplatePreprocessProfile } from "./templateProfiles.js";

const templateDirectory = path.resolve(import.meta.dirname, "../../../shared/templates/cat-v1");
const printableTemplatePath = path.join(templateDirectory, "printable-template.svg");
const allowedRegionMaskPath = path.join(templateDirectory, "allowed-region-mask.svg");
const bodyFillMaskPath = path.join(templateDirectory, "body-fill-mask.svg");
const guideStrokeMaskPath = path.join(templateDirectory, "guide-stroke-mask.svg");
const canonicalWidth = 1240;
const canonicalHeight = 1754;

interface TemplateGeometry {
  shape: {
    path: string;
    transform: string;
  };
}

let templateGeometry: Promise<TemplateGeometry> | undefined;
let canonicalFixture: Promise<CanonicalFixture> | undefined;

interface CanonicalFixture {
  blankTemplate: RawRgbaImage;
  allowedRegionMask: RawRgbaImage;
  bodyFillMask: RawRgbaImage;
  guideStrokeMask: RawRgbaImage;
  profile: TemplatePreprocessProfile;
}

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
    assert.equal(countOpaqueColor(pixels.data, [255, 255, 255]) > 100_000, true);
    assert.equal(countOpaqueColor(pixels.data, [184, 184, 184]), 0);
    assert.equal(countOpaqueColor(pixels.data, [17, 17, 17]), 0);
    assert.equal(pixels.data[3], 0);
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

test("a4-cat-v1 preserves an overshoot that crosses the allowed shape boundary", async () => {
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

    assert.equal(bluePixels > 2_000, true);
  });
});

test("a4-cat-v1 makes the untouched printed guide outside the character transparent", async () => {
  const { fixture, composition } = await composeCanonicalTemplate();
  const guidePixels = findPrintedGuidePixels(fixture, false);

  assert.equal(guidePixels.length > 0, true);
  for (const pixelIndex of guidePixels) {
    assert.equal(composition.image.data[pixelIndex * 4 + 3], 0);
  }
});

test("a4-cat-v1 replaces an unchanged guide inside the body core with opaque white", async () => {
  const fixture = await getCanonicalFixture();
  const point = findWhiteInteriorPoint(fixture);
  const { composition } = await composeCanonicalTemplate(
    (scan) => paintSquare(scan, point.x, point.y, 2, [184, 184, 184]),
    (blankTemplate, guideStrokeMask) => {
      paintSquare(blankTemplate, point.x, point.y, 2, [184, 184, 184]);
      paintSquare(guideStrokeMask, point.x, point.y, 2, [255, 255, 255]);
    },
  );

  assertPixel(composition.image, point.pixelIndex, [255, 255, 255], 255);
});

test("a4-cat-v1 preserves red paint over the guide outside the character", async () => {
  const fixture = await getCanonicalFixture();
  const point = findExternalGuidePoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, point.x, point.y, 3, [242, 27, 43]);
  });

  assertPixel(composition.image, point.pixelIndex, [242, 27, 43], 255);
});

test("a4-cat-v1 preserves black paint over the guide outside the character", async () => {
  const fixture = await getCanonicalFixture();
  const point = findExternalGuidePoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, point.x, point.y, 3, [0, 0, 0]);
  });

  assertPixel(composition.image, point.pixelIndex, [0, 0, 0], 255);
});

test("a4-cat-v1 preserves a guest-added gray whisker outside the character", async () => {
  const fixture = await getCanonicalFixture();
  const point = findOutsideArtworkPoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, point.x, point.y, 4, [90, 90, 90]);
  });

  assertPixel(composition.image, point.pixelIndex, [90, 90, 90], 255);
});

test("a4-cat-v1 removes a gray anti-alias fringe in the widened guide cleanup band", async () => {
  const fixture = await getCanonicalFixture();
  const point = findGuideFringePoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, point.x, point.y, 2, [192, 192, 192]);
  });

  assert.equal(composition.image.data[point.pixelIndex * 4 + 3], 0);
});

test("a4-cat-v1 keeps an untouched white character interior opaque", async () => {
  const fixture = await getCanonicalFixture();
  const point = findWhiteInteriorPoint(fixture);
  const { composition } = await composeCanonicalTemplate();

  assertPixel(composition.image, point.pixelIndex, [255, 255, 255], 255);
});

test("a4-cat-v1 keeps the unused allowed-region boundary band transparent", async () => {
  const { fixture, composition } = await composeCanonicalTemplate();
  let boundaryPixelCount = 0;

  for (let pixelIndex = 0; pixelIndex < fixture.allowedRegionMask.width * fixture.allowedRegionMask.height; pixelIndex += 1) {
    if (!isInsideCharacter(fixture, pixelIndex) || isInsideBodyFill(fixture, pixelIndex)) continue;
    boundaryPixelCount += 1;
    assert.equal(composition.image.data[pixelIndex * 4 + 3], 0);
  }

  assert.equal(boundaryPixelCount > 1_000, true);
});

test("a4-cat-v1 preserves red, black, and green guest paint in the boundary band", async () => {
  const fixture = await getCanonicalFixture();
  const point = findBoundaryBandPoint(fixture);
  const colors: Array<[number, number, number]> = [[242, 27, 43], [0, 0, 0], [180, 238, 8]];

  for (const color of colors) {
    const { composition } = await composeCanonicalTemplate((scan) => {
      paintSquare(scan, point.x, point.y, 3, color);
    });
    assertPixel(composition.image, point.pixelIndex, color, 255);
  }
});

test("a4-cat-v1 excludes title, footer, and registration markers from the sprite", async () => {
  const { fixture, composition } = await composeCanonicalTemplate();
  const captureMask = createArtworkCaptureMask(
    fixture.allowedRegionMask,
    fixture.profile.output.outsideCaptureRadiusPx,
  );
  let templatePagePixelCount = 0;

  for (let pixelIndex = 0; pixelIndex < captureMask.length; pixelIndex += 1) {
    if (captureMask[pixelIndex]) continue;
    if (!isTemplateInk(fixture.blankTemplate, pixelIndex)) continue;
    templatePagePixelCount += 1;
    assert.equal(composition.image.data[pixelIndex * 4 + 3], 0);
  }

  assert.equal(templatePagePixelCount > 1_000, true);
});

test("a4-cat-v1 keeps blank A4 paper transparent outside the body and artwork", async () => {
  const fixture = await getCanonicalFixture();
  const captureMask = createArtworkCaptureMask(
    fixture.allowedRegionMask,
    fixture.profile.output.outsideCaptureRadiusPx,
  );
  const { composition } = await composeCanonicalTemplate();
  const blankPaperPoint = findPoint(fixture, (pixelIndex) => (
    captureMask[pixelIndex] === 0 && isWhitePixel(fixture.blankTemplate, pixelIndex)
  ));

  assert.equal(composition.image.data[blankPaperPoint.pixelIndex * 4 + 3], 0);
});

test("a4-cat-v1 preserves an external blue accessory inside the artwork capture region", async () => {
  const fixture = await getCanonicalFixture();
  const point = findOutsideArtworkPoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, point.x, point.y, 4, [35, 110, 234]);
  });

  assertPixel(composition.image, point.pixelIndex, [35, 110, 234], 255);
});

test("a4-cat-v1 preserves a thick guest stroke crossing the character boundary", async () => {
  const fixture = await getCanonicalFixture();
  const boundary = findCrossingBoundaryPoint(fixture);
  const { composition } = await composeCanonicalTemplate((scan) => {
    paintSquare(scan, boundary.x, boundary.y, 14, [35, 110, 234]);
  });

  assertPixel(composition.image, boundary.insidePixelIndex, [35, 110, 234], 255);
  assertPixel(composition.image, boundary.outsidePixelIndex, [35, 110, 234], 255);
});

test("a4-cat-v1 preserves gray whiskers outside the cat and expands the crop", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const boundary = await findLeftBoundaryPoint();
    const scanPath = path.join(workspace, "whiskers.png");
    const whisker = rectangle(boundary.x - 150, boundary.y - 6, 165, 12, "#5A5A5A");
    await writeFile(scanPath, await addArtwork(await createBlankTemplate(), [whisker, rectangle(600, 760, 25, 25, "#E65064")]));

    const output = await preprocessScan(scanPath, "a4-cat-v1");
    const pixels = await readPixels(output);
    const metadata = await sharp(output).metadata();

    assert.equal(countOpaqueColor(pixels.data, [90, 90, 90]) > 1_000, true);
    assert.equal((metadata.width ?? 0) > 800, true);
    assert.equal((metadata.width ?? 0) < canonicalWidth, true);
    assert.equal((metadata.height ?? 0) < canonicalHeight, true);
  });
});

test("a4-cat-v1 preserves black guest drawing without including corner markers", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "black-artwork.png");
    await writeFile(scanPath, await addArtwork(await createBlankTemplate(), [rectangle(620, 860, 45, 45, "#000000")]));

    const pixels = await readPixels(await preprocessScan(scanPath, "a4-cat-v1"));

    assert.equal(countOpaqueColor(pixels.data, [0, 0, 0]) > 500, true);
    assert.equal(countOpaqueColor(pixels.data, [0, 0, 0]) < 2_500, true);
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

async function getCanonicalFixture(): Promise<CanonicalFixture> {
  canonicalFixture ??= (async () => {
    const profile = await getTemplatePreprocessProfile("a4-cat-v1");
    const [blankTemplate, allowedRegionMask, bodyFillMask, guideStrokeMask] = await Promise.all([
      readTemplatePixels(printableTemplatePath),
      readTemplatePixels(allowedRegionMaskPath),
      readTemplatePixels(bodyFillMaskPath),
      readTemplatePixels(guideStrokeMaskPath),
    ]);
    return { blankTemplate, allowedRegionMask, bodyFillMask, guideStrokeMask, profile };
  })();
  return canonicalFixture;
}

async function composeCanonicalTemplate(
  mutateScan?: (scan: RawRgbaImage) => void,
  mutateReference?: (blankTemplate: RawRgbaImage, guideStrokeMask: RawRgbaImage) => void,
): Promise<{ fixture: CanonicalFixture; composition: ReturnType<typeof composeTemplateArtwork> }> {
  const fixture = await getCanonicalFixture();
  const blankTemplate = cloneImage(fixture.blankTemplate);
  const guideStrokeMask = cloneImage(fixture.guideStrokeMask);
  const scan: RawRgbaImage = {
    data: Buffer.from(fixture.blankTemplate.data),
    width: fixture.blankTemplate.width,
    height: fixture.blankTemplate.height,
  };
  mutateScan?.(scan);
  mutateReference?.(blankTemplate, guideStrokeMask);
  return {
    fixture,
    composition: composeTemplateArtwork({
      scan,
      blankTemplate,
      allowedRegionMask: fixture.allowedRegionMask,
      bodyFillMask: fixture.bodyFillMask,
      guideStrokeMask,
      paperColor: { red: 255, green: 255, blue: 255 },
      profile: fixture.profile,
    }),
  };
}

function findPrintedGuidePixels(fixture: CanonicalFixture, insideBodyFill: boolean): number[] {
  const matches: number[] = [];
  for (let pixelIndex = 0; pixelIndex < fixture.guideStrokeMask.width * fixture.guideStrokeMask.height; pixelIndex += 1) {
    if (isInsideBodyFill(fixture, pixelIndex) !== insideBodyFill) continue;
    if (fixture.guideStrokeMask.data[pixelIndex * 4]! <= 128) continue;
    if (!isTemplateInk(fixture.blankTemplate, pixelIndex)) continue;
    matches.push(pixelIndex);
  }
  return matches;
}

function findExternalGuidePoint(fixture: CanonicalFixture): TemplatePoint {
  const pixelIndex = findPrintedGuidePixels(fixture, false)
    .find((candidate) => !isInsideCharacter(fixture, candidate));
  if (pixelIndex === undefined) throw new Error("The template does not have an external printed guide point");
  return pointAt(fixture.blankTemplate.width, pixelIndex);
}

function findGuideFringePoint(fixture: CanonicalFixture): TemplatePoint {
  const guideCleanupBand = createGuideCleanupBand(
    fixture.guideStrokeMask,
    fixture.profile.guide.cleanupBandPaddingPx,
  );
  const captureMask = createArtworkCaptureMask(
    fixture.allowedRegionMask,
    fixture.profile.output.outsideCaptureRadiusPx,
  );
  return findPoint(fixture, (pixelIndex, x, y) => (
    !isInsideCharacter(fixture, pixelIndex)
    && captureMask[pixelIndex] === 1
    && guideCleanupBand[pixelIndex] === 1
    && fixture.guideStrokeMask.data[pixelIndex * 4]! <= 128
    && isWhitePixel(fixture.blankTemplate, pixelIndex)
    && isMaskSquareFilled(guideCleanupBand, fixture.blankTemplate.width, fixture.blankTemplate.height, x, y, 2)
  ));
}

function findOutsideArtworkPoint(fixture: CanonicalFixture): TemplatePoint {
  const guideCleanupBand = createGuideCleanupBand(
    fixture.guideStrokeMask,
    fixture.profile.guide.cleanupBandPaddingPx,
  );
  const captureMask = createArtworkCaptureMask(
    fixture.allowedRegionMask,
    fixture.profile.output.outsideCaptureRadiusPx,
  );
  return findPoint(fixture, (pixelIndex, x, y) => (
    !isInsideCharacter(fixture, pixelIndex)
    && captureMask[pixelIndex] === 1
    && guideCleanupBand[pixelIndex] === 0
    && isWhitePixel(fixture.blankTemplate, pixelIndex)
    && isMaskSquareFilled(captureMask, fixture.blankTemplate.width, fixture.blankTemplate.height, x, y, 4)
  ));
}

function findWhiteInteriorPoint(fixture: CanonicalFixture): TemplatePoint {
  const guideCleanupBand = createGuideCleanupBand(
    fixture.guideStrokeMask,
    fixture.profile.guide.cleanupBandPaddingPx,
  );
  return findPoint(fixture, (pixelIndex) => (
    isInsideBodyFill(fixture, pixelIndex)
    && guideCleanupBand[pixelIndex] === 0
    && isWhitePixel(fixture.blankTemplate, pixelIndex)
  ));
}

function findBoundaryBandPoint(fixture: CanonicalFixture): TemplatePoint {
  return findPoint(fixture, (pixelIndex) => (
    isInsideCharacter(fixture, pixelIndex)
    && !isInsideBodyFill(fixture, pixelIndex)
  ));
}

function findCrossingBoundaryPoint(fixture: CanonicalFixture): CrossingBoundaryPoint {
  const { width, height } = fixture.allowedRegionMask;
  for (let y = 16; y < height - 16; y += 1) {
    for (let x = 16; x < width - 16; x += 1) {
      const centerIndex = y * width + x;
      const insideIndex = y * width + x + 8;
      const outsideIndex = y * width + x - 8;
      if (!isInsideCharacter(fixture, centerIndex)) continue;
      if (!isInsideCharacter(fixture, insideIndex) || isInsideCharacter(fixture, outsideIndex)) continue;
      return { x, y, insidePixelIndex: insideIndex, outsidePixelIndex: outsideIndex };
    }
  }
  throw new Error("The template does not have a boundary suitable for a crossing-stroke test");
}

function findPoint(
  fixture: CanonicalFixture,
  predicate: (pixelIndex: number, x: number, y: number) => boolean,
): TemplatePoint {
  const { width, height } = fixture.blankTemplate;
  for (let y = 8; y < height - 8; y += 1) {
    for (let x = 8; x < width - 8; x += 1) {
      const pixelIndex = y * width + x;
      if (predicate(pixelIndex, x, y)) return { x, y, pixelIndex };
    }
  }
  throw new Error("The template does not have a pixel matching the requested test condition");
}

function isInsideCharacter(fixture: CanonicalFixture, pixelIndex: number): boolean {
  return fixture.allowedRegionMask.data[pixelIndex * 4]! > 128;
}

function isInsideBodyFill(fixture: CanonicalFixture, pixelIndex: number): boolean {
  return fixture.bodyFillMask.data[pixelIndex * 4]! > 128;
}

function isTemplateInk(image: RawRgbaImage, pixelIndex: number): boolean {
  const offset = pixelIndex * 4;
  return image.data[offset]! < 245 || image.data[offset + 1]! < 245 || image.data[offset + 2]! < 245;
}

function isWhitePixel(image: RawRgbaImage, pixelIndex: number): boolean {
  const offset = pixelIndex * 4;
  return image.data[offset]! >= 250 && image.data[offset + 1]! >= 250 && image.data[offset + 2]! >= 250;
}

function isMaskSquareFilled(
  mask: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
): boolean {
  if (x - radius < 0 || y - radius < 0 || x + radius >= width || y + radius >= height) return false;
  for (let targetY = y - radius; targetY <= y + radius; targetY += 1) {
    for (let targetX = x - radius; targetX <= x + radius; targetX += 1) {
      if (!mask[targetY * width + targetX]) return false;
    }
  }
  return true;
}

function paintSquare(
  image: RawRgbaImage,
  centerX: number,
  centerY: number,
  radius: number,
  color: [number, number, number],
) {
  for (let y = Math.max(0, centerY - radius); y <= Math.min(image.height - 1, centerY + radius); y += 1) {
    for (let x = Math.max(0, centerX - radius); x <= Math.min(image.width - 1, centerX + radius); x += 1) {
      const offset = (y * image.width + x) * 4;
      image.data[offset] = color[0];
      image.data[offset + 1] = color[1];
      image.data[offset + 2] = color[2];
      image.data[offset + 3] = 255;
    }
  }
}

function cloneImage(image: RawRgbaImage): RawRgbaImage {
  return { data: Buffer.from(image.data), width: image.width, height: image.height };
}

function assertPixel(image: RawRgbaImage, pixelIndex: number, color: [number, number, number], alpha: number) {
  const offset = pixelIndex * 4;
  assert.deepEqual(
    [image.data[offset], image.data[offset + 1], image.data[offset + 2], image.data[offset + 3]],
    [...color, alpha],
  );
}

function pointAt(width: number, pixelIndex: number): TemplatePoint {
  return { x: pixelIndex % width, y: Math.floor(pixelIndex / width), pixelIndex };
}

interface TemplatePoint {
  x: number;
  y: number;
  pixelIndex: number;
}

interface CrossingBoundaryPoint {
  x: number;
  y: number;
  insidePixelIndex: number;
  outsidePixelIndex: number;
}
