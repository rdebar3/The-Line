"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DefenderBadgeRecord } from "@/lib/defender-badges";
import { cn } from "@/lib/utils";

type DefenderBadgeShareProps = {
  badge: DefenderBadgeRecord;
  className?: string;
};

function canShareFiles() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
}

export function DefenderBadgeShare({ badge, className }: DefenderBadgeShareProps) {
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const shareText = `${badge.milestoneLabel}\n${badge.displayName} · ${badge.rankTitle} · ${badge.defenderScore.toLocaleString()} Defender Score\n\nEarned on The Line — the-line-eight.vercel.app`;

  const fetchImageFile = useCallback(async () => {
    const response = await fetch(badge.imageUrl);
    if (!response.ok) {
      throw new Error("Could not load badge image.");
    }
    const blob = await response.blob();
    return new File([blob], `theline-defender-badge-${badge.id.replace(":", "-")}.png`, {
      type: "image/png",
    });
  }, [badge.id, badge.imageUrl]);

  async function handleShare() {
    setSharing(true);
    setMessage(null);

    try {
      const file = await fetchImageFile();

      if (canShareFiles() && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Defender Badge — The Line",
          text: shareText,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "My Defender Badge — The Line",
          text: shareText,
          url: badge.imageUrl,
        });
        return;
      }

      await handleDownload();
      setMessage("Share not supported — image downloaded instead.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage("Share failed. Try downloading the image.");
    } finally {
      setSharing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setMessage(null);

    try {
      const file = await fetchImageFile();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  const supportsNativeShare = canShareFiles();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mx-auto max-w-[280px] overflow-hidden rounded-2xl border border-gold/30 bg-navy/40 p-3 shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badge.imageUrl}
          alt={`Defender badge — ${badge.milestoneLabel}`}
          className="aspect-square w-full rounded-xl object-cover"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleShare()}
          disabled={sharing || downloading}
          className="btn-gold min-h-10 px-5"
        >
          {sharing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Share2 className="size-4" />
          )}
          {supportsNativeShare ? "Share badge" : "Share / download"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleDownload()}
          disabled={sharing || downloading}
          className="min-h-10 border-gold/25 text-gold"
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download image
        </Button>
      </div>

      {message && (
        <p className="text-center text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}