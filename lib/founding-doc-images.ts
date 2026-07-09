export const NATIONAL_ARCHIVES_CREDIT = "Image: National Archives";

/** Subtle warm parchment treatment shared across all founding document heroes. */
export const FOUNDING_DOC_IMAGE_FILTER =
  "sepia(0.22) contrast(1.12) brightness(0.94) saturate(1.06)";

export const FOUNDING_DOC_CARD_IMAGES = {
  declaration: {
    src: "/founding-docs/declaration-card.jpg",
    alt: "The Declaration of Independence parchment at the National Archives",
    objectPosition: "center 18%",
  },
  constitution: {
    src: "/founding-docs/constitution-card.jpg",
    alt: "Page 1 of the U.S. Constitution manuscript at the National Archives",
    objectPosition: "center 16%",
  },
  "bill-of-rights": {
    src: "/founding-docs/bill-of-rights-card.jpg",
    alt: "The Bill of Rights manuscript at the National Archives",
    objectPosition: "center 10%",
  },
} as const;

export type FoundingDocImageId = keyof typeof FOUNDING_DOC_CARD_IMAGES;