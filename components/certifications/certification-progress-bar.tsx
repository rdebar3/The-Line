"use client";

import { cn } from "@/lib/utils";

type CertificationProgressBarProps = {
  label: string;
  current: number;
  target: number;
  progress: number;
  met: boolean;
  suffix?: string;
  className?: string;
};

export function CertificationProgressBar({
  label,
  current,
  target,
  progress,
  met,
  suffix = "",
  className,
}: CertificationProgressBarProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", met ? "text-gold" : "text-foreground")}>
          {target > 0 ? (
            <>
              {current}
              {suffix} / {target}
              {suffix}
            </>
          ) : (
            <>{met ? "Complete" : "In progress"}</>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-navy-border/40">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            met ? "bg-gold" : "bg-gold/50"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}