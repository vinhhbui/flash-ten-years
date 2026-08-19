import { readFile } from "node:fs/promises";
import path from "node:path";

interface TemplateConfiguration {
  id: string;
  frameId: string;
  canvas: {
    width: number;
    height: number;
  };
  paper: {
    widthMm: number;
    heightMm: number;
    rasterDensity: number;
  };
  differenceThreshold: number;
  guideDifferenceThreshold: number;
  maximumGuideAlignmentDifference: number;
  cropPaddingRatio: number;
  alignment: {
    radius: number;
    step: number;
  };
  minimumVisiblePixels: number;
}

export interface TemplatePreprocessProfile extends TemplateConfiguration {
  printableTemplatePath: string;
  allowedRegionMaskPath: string;
  guideStrokeMaskPath: string;
}

const templateDirectory = path.resolve(import.meta.dirname, "../../../shared/templates/cat-v1");
let catTemplateProfile: Promise<TemplatePreprocessProfile> | undefined;

export async function getTemplatePreprocessProfile(profileId: string): Promise<TemplatePreprocessProfile> {
  if (profileId !== "a4-cat-v1") {
    throw new Error(`Unsupported scanner preprocess profile: ${profileId}`);
  }

  catTemplateProfile ??= loadCatTemplateProfile();
  return catTemplateProfile;
}

async function loadCatTemplateProfile(): Promise<TemplatePreprocessProfile> {
  const configuration = JSON.parse(
    await readFile(path.join(templateDirectory, "template.config.json"), "utf8"),
  ) as TemplateConfiguration;
  if (configuration.id !== "a4-cat-v1") {
    throw new Error("The cat template configuration has an unexpected profile id");
  }

  return {
    ...configuration,
    printableTemplatePath: path.join(templateDirectory, "printable-template.svg"),
    allowedRegionMaskPath: path.join(templateDirectory, "allowed-region-mask.svg"),
    guideStrokeMaskPath: path.join(templateDirectory, "guide-stroke-mask.svg"),
  };
}
