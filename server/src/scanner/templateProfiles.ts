import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RegistrationMarkerConfig } from "./registrationMarkers.js";

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
  guide: {
    extractionMaskWidth: number;
    cleanupBandPaddingPx: number;
  };
  registrationMarkers: RegistrationMarkerConfig;
  differenceThreshold: number;
  guideDifferenceThreshold: number;
  output: {
    preserveCharacterInterior: boolean;
    interiorPaperMode: "normalized-paper";
    preserveOutsideUserStrokes: boolean;
    outsideCaptureRadiusPx: number;
    outsideDifferenceThreshold: number;
    minimumOutsideComponentPixels: number;
    minimumGuestArtworkPixels: number;
    cropPaddingRatio: number;
  };
}

export interface TemplatePreprocessProfile extends TemplateConfiguration {
  printableTemplatePath: string;
  allowedRegionMaskPath: string;
  guideStrokeMaskPath: string;
}

const templateDirectories = new Map([
  ["a4-cat-v1", path.resolve(import.meta.dirname, "../../../shared/templates/cat-v1")],
]);
const templateProfiles = new Map<string, Promise<TemplatePreprocessProfile>>();

export async function getTemplatePreprocessProfile(profileId: string): Promise<TemplatePreprocessProfile> {
  const templateDirectory = templateDirectories.get(profileId);
  if (!templateDirectory) {
    throw new Error(`Unsupported scanner preprocess profile: ${profileId}`);
  }

  let profile = templateProfiles.get(profileId);
  if (!profile) {
    profile = loadTemplateProfile(profileId, templateDirectory);
    templateProfiles.set(profileId, profile);
  }
  return profile;
}

async function loadTemplateProfile(profileId: string, templateDirectory: string): Promise<TemplatePreprocessProfile> {
  const configuration = JSON.parse(
    await readFile(path.join(templateDirectory, "template.config.json"), "utf8"),
  ) as TemplateConfiguration;
  if (configuration.id !== profileId) {
    throw new Error(`The template configuration has an unexpected profile id: ${configuration.id}`);
  }

  return {
    ...configuration,
    printableTemplatePath: path.join(templateDirectory, "printable-template.svg"),
    allowedRegionMaskPath: path.join(templateDirectory, "allowed-region-mask.svg"),
    guideStrokeMaskPath: path.join(templateDirectory, "guide-stroke-mask.svg"),
  };
}
