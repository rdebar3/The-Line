import { GuardianCharacter } from "@/components/guardian/guardian-character";

type GuardianFigureProps = {
  mood?: "neutral" | "positive" | "negative" | "thinking" | "success" | "warning";
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  floating?: boolean;
  showLabel?: boolean;
  priority?: boolean;
};

export function GuardianFigure({
  mood = "neutral",
  className,
  size = "md",
  floating,
  showLabel,
  priority,
}: GuardianFigureProps) {
  const resolvedMood =
    mood === "positive"
      ? "success"
      : mood === "negative"
        ? "warning"
        : mood;

  return (
    <GuardianCharacter
      mood={resolvedMood}
      size={size}
      className={className}
      floating={floating}
      showLabel={showLabel}
      priority={priority}
    />
  );
}