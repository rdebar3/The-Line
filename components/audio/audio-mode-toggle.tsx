"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useAudioMode } from "@/hooks/use-audio-mode";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AudioModeToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useAudioMode();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      className={cn(
        "border-navy-border/80 text-muted-foreground hover:text-foreground",
        enabled && "border-gold/30 text-gold",
        className
      )}
    >
      {enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      {enabled ? "Audio on" : "Audio off"}
    </Button>
  );
}