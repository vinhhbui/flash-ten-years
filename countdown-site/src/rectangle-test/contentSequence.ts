export const FLASHBACK_CONTENT_COUNT = 10;
export const FLASHBACK_SUBCONTENT_COUNT = 2;
export const FLASHBACK_STEPS_PER_CONTENT = 1 + FLASHBACK_SUBCONTENT_COUNT;
export const FLASHBACK_HERO_SECTION = 1;
export const FLASHBACK_SECTION_COUNT = (
  FLASHBACK_HERO_SECTION
  + FLASHBACK_CONTENT_COUNT * FLASHBACK_STEPS_PER_CONTENT
);

export type ContentSequencePosition = {
  contentNumber: number;
  subContentIndex: number;
};

export function getContentStartSection(contentNumber: number) {
  return FLASHBACK_HERO_SECTION
    + (contentNumber - 1) * FLASHBACK_STEPS_PER_CONTENT
    + 1;
}

export function getContentSequencePosition(
  section: number,
): ContentSequencePosition | null {
  if (section <= FLASHBACK_HERO_SECTION || section > FLASHBACK_SECTION_COUNT) {
    return null;
  }

  const contentStep = section - FLASHBACK_HERO_SECTION - 1;
  return {
    contentNumber: Math.floor(contentStep / FLASHBACK_STEPS_PER_CONTENT) + 1,
    subContentIndex: contentStep % FLASHBACK_STEPS_PER_CONTENT,
  };
}
