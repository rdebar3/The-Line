import { shadcn } from "@clerk/ui/themes";

const clerkAppearanceBase = {
  theme: shadcn,
  options: {
    socialButtonsVariant: "iconButton" as const,
  },
  variables: {
    colorPrimary: "#c9a227",
    colorBackground: "#121a2e",
    colorInputBackground: "#0a0f1c",
    colorInputText: "#f4f4f5",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    borderRadius: "0.75rem",
  },
};

const hiddenSocialElements = {
  socialButtons: "hidden !important",
  socialButtonsBlockButton: "hidden !important",
  socialButtonsIconButton: "hidden !important",
  socialButtonsProviderIcon: "hidden !important",
  dividerRow: "hidden !important",
  dividerText: "hidden !important",
} as const;

export const clerkAppearance = clerkAppearanceBase;

export function getClerkAppearance() {
  return {
    ...clerkAppearanceBase,
    elements: hiddenSocialElements,
  };
}