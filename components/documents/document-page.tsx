import { PageShell } from "@/components/layout/page-shell";
import { DocumentReader } from "@/components/documents/document-reader";
import type { FoundingDocument } from "@/lib/documents/types";

type DocumentPageProps = {
  document: FoundingDocument;
};

export function DocumentPage({ document }: DocumentPageProps) {
  return (
    <PageShell footerTagline="Read the text. Know the line.">
      <DocumentReader document={document} />
    </PageShell>
  );
}