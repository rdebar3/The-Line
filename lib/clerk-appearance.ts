import { shadcn } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: shadcn,
  variables: {
    colorPrimary: "#c9a227",
    colorBackground: "#121a2e",
    colorInputBackground: "#0a0f1c",
    colorInputText: "#f4f4f5",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    borderRadius: "0.75rem",
  },
} as const;