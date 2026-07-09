"use client";

/**
 * DocumentReader — thin adapter over the immersive archive reader.
 * Existing call sites keep importing DocumentReader; they receive the
 * museum archive experience.
 */

import { ArchiveDocumentReader } from "@/components/documents/archive-document-reader";
import type { FoundingDocument } from "@/lib/documents/types";

export function DocumentReader({ document }: { document: FoundingDocument }) {
  return <ArchiveDocumentReader document={document} />;
}
