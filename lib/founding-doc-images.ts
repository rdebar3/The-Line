export const NATIONAL_ARCHIVES_CREDIT = "Image: National Archives";

export const FOUNDING_DOC_CARD_IMAGES = {
  declaration: {
    src: "/founding-docs/declaration-card.jpg",
    alt: "The Declaration of Independence parchment at the National Archives",
    objectPosition: "center 32%",
  },
  constitution: {
    src: "/founding-docs/constitution-card.jpg",
    alt: "Page 1 of the U.S. Constitution manuscript at the National Archives",
    objectPosition: "center 22%",
  },
  "bill-of-rights": {
    src: "/founding-docs/bill-of-rights-card.jpg",
    alt: "The Bill of Rights manuscript at the National Archives",
    objectPosition: "center 28%",
  },
} as const;

export type FoundingDocImageId = keyof typeof FOUNDING_DOC_CARD_IMAGES;