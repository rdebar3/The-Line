import { EDUCATIONAL_DISCLAIMER } from "@/lib/legal-disclaimers";
import { cn } from "@/lib/utils";

export function EducationalDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground/80", className)}>
      {EDUCATIONAL_DISCLAIMER}
    </p>
  );
}