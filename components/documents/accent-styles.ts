import type { DocumentAccent } from "@/lib/documents/types";

export const accentStyles: Record<
  DocumentAccent,
  {
    badge: string;
    glow: string;
    border: string;
    highlight: string;
    panelBorder: string;
    text: string;
  }
> = {
  gold: {
    badge: "border-gold/30 bg-gold/10 text-gold",
    glow: "bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.14),transparent_60%)]",
    border: "border-gold/25",
    highlight: "border-gold/40 bg-gold/10 shadow-[0_0_30px_rgba(201,162,39,0.12)]",
    panelBorder: "border-gold/30",
    text: "text-gold",
  },
  blue: {
    badge: "border-constitution-blue/30 bg-constitution-blue/10 text-constitution-blue-light",
    glow: "bg-[radial-gradient(ellipse_at_top,rgba(59,89,152,0.18),transparent_60%)]",
    border: "border-constitution-blue/25",
    highlight:
      "border-constitution-blue/40 bg-constitution-blue/10 shadow-[0_0_30px_rgba(59,89,152,0.12)]",
    panelBorder: "border-constitution-blue/30",
    text: "text-constitution-blue-light",
  },
  crimson: {
    badge: "border-crimson/30 bg-crimson/10 text-crimson",
    glow: "bg-[radial-gradient(ellipse_at_top,rgba(185,28,28,0.14),transparent_60%)]",
    border: "border-crimson/25",
    highlight: "border-crimson/40 bg-crimson/10 shadow-[0_0_30px_rgba(185,28,28,0.12)]",
    panelBorder: "border-crimson/30",
    text: "text-crimson",
  },
};