import Image from "next/image";

import {
  guardianImages,
  guardianLabels,
  type GuardianMood,
} from "@/lib/guardian";
import { cn } from "@/lib/utils";

type GuardianCharacterProps = {
  mood?: GuardianMood;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  priority?: boolean;
  floating?: boolean;
  showLabel?: boolean;
};

const sizeClasses = {
  sm: "h-28 w-24 sm:h-32 sm:w-28",
  md: "h-44 w-36 sm:h-52 sm:w-40",
  lg: "h-60 w-48 sm:h-72 sm:w-56",
  hero: "h-64 w-52 sm:h-80 sm:w-64 md:h-96 md:w-72",
};

const glowClasses: Record<GuardianMood, string> = {
  neutral:
    "bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.18)_0%,transparent_70%)]",
  success:
    "bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.35)_0%,transparent_72%)]",
  warning:
    "bg-[radial-gradient(ellipse_at_center,rgba(185,28,28,0.28)_0%,transparent_72%)]",
  thinking:
    "bg-[radial-gradient(ellipse_at_center,rgba(59,89,152,0.28)_0%,transparent_72%)]",
};

export function GuardianCharacter({
  mood = "neutral",
  size = "md",
  className,
  priority = false,
  floating = false,
  showLabel = false,
}: GuardianCharacterProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative",
          sizeClasses[size],
          floating && "animate-guardian-float"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 scale-110 rounded-full blur-2xl transition-all duration-700",
            glowClasses[mood],
            mood === "success" && "animate-glow-pulse"
          )}
        />
        <Image
          src={guardianImages[mood]}
          alt={guardianLabels[mood]}
          fill
          priority={priority}
          sizes="(max-width: 640px) 200px, 320px"
          className="object-contain object-bottom transition-all duration-700 ease-out"
        />
      </div>
      {showLabel && (
        <p className="mt-3 font-heading text-[0.6rem] font-semibold tracking-[0.3em] text-gold uppercase sm:text-xs">
          {guardianLabels[mood]}
        </p>
      )}
    </div>
  );
}