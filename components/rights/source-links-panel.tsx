import Link from "next/link";
import { BookOpen } from "lucide-react";

import { resolveSourceLinks } from "@/lib/document-links";

export function SourceLinksPanel({
  passageIds,
  sourceDocument,
}: {
  passageIds?: string[];
  sourceDocument?: string;
}) {
  const links = resolveSourceLinks(passageIds, sourceDocument);
  if (links.length === 0) return null;

  return (
    <div className="rounded-xl border border-constitution-blue/25 bg-constitution-blue/5 px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-constitution-blue-light">
        <BookOpen className="size-4" />
        <p className="font-heading text-xs font-semibold tracking-[0.18em] uppercase">
          Founding Source
        </p>
      </div>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.passageId}>
            <Link
              href={link.href}
              className="text-sm font-medium text-gold underline-offset-2 hover:underline"
            >
              Read: {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}