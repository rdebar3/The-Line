import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DocumentCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent?: "gold" | "crimson" | "blue";
};

const accentStyles = {
  gold: "hover:border-gold/45 hover:shadow-[0_8px_40px_rgba(201,162,39,0.18)]",
  crimson:
    "hover:border-crimson/45 hover:shadow-[0_8px_40px_rgba(185,28,28,0.18)]",
  blue: "hover:border-constitution-blue/45 hover:shadow-[0_8px_40px_rgba(59,89,152,0.18)]",
};

const iconAccentStyles = {
  gold: "text-gold bg-gold/10 border-gold/25 shadow-[0_0_20px_rgba(201,162,39,0.1)]",
  crimson: "text-crimson bg-crimson/10 border-crimson/25 shadow-[0_0_20px_rgba(185,28,28,0.1)]",
  blue: "text-constitution-blue-light bg-constitution-blue/10 border-constitution-blue/25 shadow-[0_0_20px_rgba(59,89,152,0.1)]",
};

const accentText = {
  gold: "text-gold group-hover:text-gold/90",
  crimson: "text-crimson group-hover:text-crimson/90",
  blue: "text-constitution-blue-light group-hover:text-constitution-blue-light/90",
};

export function DocumentCard({
  title,
  description,
  href,
  icon: Icon,
  accent = "gold",
}: DocumentCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        className={cn(
          "premium-card h-full min-h-[220px] cursor-pointer rounded-2xl py-0 hover:-translate-y-1.5 hover:bg-navy-elevated/90",
          accentStyles[accent]
        )}
      >
        <CardHeader className="gap-4 pb-2">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105",
              iconAccentStyles[accent]
            )}
          >
            <Icon className="size-6" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-xl font-semibold tracking-wide text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-6 pb-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-2 text-sm font-semibold transition-all",
              accentText[accent]
            )}
          >
            Enter
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}