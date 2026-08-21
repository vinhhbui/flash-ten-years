export type SpatialObject = "ten" | "ring" | "disc" | "frame" | "star";

export type SpatialSceneTheme = "paper" | "acid" | "pink" | "blue" | "orange" | "lilac";

export interface SpatialNodeConfig {
  id: string;
  type: "label" | "title" | "content" | "object" | "accent" | "artwork";
  worldX: number;
  worldY: number;
  localZ: number;
  compactWorldX?: number;
  compactWorldY?: number;
  rotation?: number;
  passDepth?: number;
  object?: SpatialObject;
  mediaSrc?: string;
  mediaAlt?: string;
  slotLabel?: string;
  aspectRatio?: string;
}

export interface SpatialSceneConfig {
  id: string;
  title: string;
  label: string;
  body?: string;
  theme: SpatialSceneTheme;
  worldZ: number;
  nodes: SpatialNodeConfig[];
}

interface ContentSceneSeed {
  title: string;
  body: string;
  theme: SpatialSceneTheme;
  layout: "left" | "right";
  primaryArtwork?: ArtworkSeed;
  supportingArtwork?: ArtworkSeed;
}

interface ArtworkSeed {
  src: string;
  alt: string;
  aspectRatio?: string;
}

const contentSceneSeeds: ContentSceneSeed[] = [
  { title: "CONTENT 01", body: "Your first story, image and artwork will live here.", theme: "acid", layout: "left" },
  { title: "CONTENT 02", body: "A flexible chapter ready for a photograph or illustration.", theme: "pink", layout: "right" },
  { title: "CONTENT 03", body: "Use this space for the next moment in the ten-year reel.", theme: "paper", layout: "left" },
  { title: "CONTENT 04", body: "Copy and visual slots are separated so both are easy to replace.", theme: "blue", layout: "right" },
  { title: "CONTENT 05", body: "A new frame arrives while the previous chapter passes the camera.", theme: "orange", layout: "left" },
  { title: "CONTENT 06", body: "This chapter can hold an artwork, photo or transparent cut-out.", theme: "lilac", layout: "right" },
  { title: "CONTENT 07", body: "The shared road keeps every memory inside one continuous journey.", theme: "acid", layout: "left" },
  { title: "CONTENT 08", body: "Add the archive story and supporting visual for this chapter.", theme: "pink", layout: "right" },
  { title: "CONTENT 09", body: "The final story chapter prepares the handoff to the community wall.", theme: "paper", layout: "left" },
  { title: "CONTENT 10", body: "Invite everyone to add one more memory before the Live Wall.", theme: "orange", layout: "right" },
];

const sharedHeroNodes = {
  label: {
    id: "label",
    type: "label",
    worldX: 0,
    worldY: -120,
    compactWorldX: 0,
    compactWorldY: -145,
    localZ: -160,
    passDepth: 1000,
  },
  title: {
    id: "title",
    type: "title",
    worldX: 0,
    worldY: -10,
    compactWorldX: 0,
    compactWorldY: -35,
    localZ: 0,
    passDepth: 1000,
  },
} as const;

function createContentScene(seed: ContentSceneSeed, index: number): SpatialSceneConfig {
  const sectionNumber = String(index + 1).padStart(2, "0");
  const direction = seed.layout === "left" ? 1 : -1;
  const contentX = -65 * direction;
  const primaryArtworkX = 340 * direction;
  const supportingArtworkX = -540 * direction;
  const compactPrimaryArtworkX = 120 * direction;
  const compactSupportingArtworkX = -230 * direction;
  const worldZ = 5700 + index * 2200;
  const nodes: SpatialNodeConfig[] = [
    {
      id: "label",
      type: "label",
      worldX: contentX,
      worldY: -180,
      compactWorldX: 0,
      compactWorldY: -260,
      localZ: -180,
      passDepth: 960,
    },
    {
      id: "content",
      type: "content",
      worldX: contentX,
      worldY: -65,
      compactWorldX: 0,
      compactWorldY: -150,
      localZ: 0,
      passDepth: 900,
    },
    {
      id: "artwork-primary",
      type: "artwork",
      worldX: primaryArtworkX,
      worldY: 190,
      compactWorldX: compactPrimaryArtworkX,
      compactWorldY: 105,
      localZ: 60,
      rotation: 6 * direction,
      passDepth: 780,
      mediaSrc: seed.primaryArtwork?.src,
      mediaAlt: seed.primaryArtwork?.alt,
      slotLabel: `${sectionNumber}.A`,
      aspectRatio: seed.primaryArtwork?.aspectRatio ?? (index % 3 === 0 ? "4 / 5" : "4 / 3"),
    },
  ];

  if (index !== contentSceneSeeds.length - 1) {
    nodes.push({
      id: "artwork-supporting",
      type: "artwork",
      worldX: supportingArtworkX,
      worldY: 350,
      compactWorldX: compactSupportingArtworkX,
      compactWorldY: 340,
      localZ: -700,
      rotation: -10 * direction,
      passDepth: 1100,
      mediaSrc: seed.supportingArtwork?.src,
      mediaAlt: seed.supportingArtwork?.alt,
      slotLabel: `${sectionNumber}.B`,
      aspectRatio: seed.supportingArtwork?.aspectRatio ?? (index % 2 === 0 ? "1 / 1" : "3 / 4"),
    });
  }

  return {
    id: `content-${sectionNumber}`,
    title: seed.title,
    label: `SECTION ${sectionNumber} / 10`,
    body: seed.body,
    theme: seed.theme,
    worldZ,
    nodes,
  };
}

export const spatialScenes: SpatialSceneConfig[] = [
  {
    id: "flash10",
    title: "FLASH 10",
    label: "TEN YEARS / ONE LIVING REEL",
    theme: "paper",
    worldZ: 3500,
    nodes: [
      sharedHeroNodes.label,
      sharedHeroNodes.title,
      {
        id: "object",
        type: "object",
        object: "ten",
        worldX: 300,
        worldY: 150,
        compactWorldX: 100,
        compactWorldY: 125,
        localZ: 160,
        rotation: -10,
        passDepth: 760,
      },
      {
        id: "accent",
        type: "accent",
        object: "disc",
        worldX: -420,
        worldY: 320,
        compactWorldX: -210,
        compactWorldY: 320,
        localZ: -680,
        rotation: 12,
        passDepth: 1080,
      },
    ],
  },
  ...contentSceneSeeds.map(createContentScene),
];
