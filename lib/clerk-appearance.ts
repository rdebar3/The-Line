import { shadcn } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: shadcn,
  variables: {
    colorPrimary: "#c9a227",
    colorBackground: "#0a0f1c",
    colorInputBackground: "#121a2e",
    colorInputText: "#f4f4f5",
    borderRadius: "0.75rem",
  },
} as const;