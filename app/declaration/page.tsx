import { DocumentPage } from "@/components/documents/document-page";
import { declarationDocument } from "@/lib/documents/declaration";

export const metadata = {
  title: "Declaration of Independence",
  description:
    "Study the Declaration of Independence in The Line archive — original text with historical context, modern relevance, and Save to My Lines.",
};

export default function DeclarationPage() {
  return <DocumentPage document={declarationDocument} />;
}
