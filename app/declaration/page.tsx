import { DocumentPage } from "@/components/documents/document-page";
import { declarationDocument } from "@/lib/documents/declaration";

export const metadata = {
  title: "Declaration of Independence | The Line",
  description:
    "Read the Declaration of Independence with tap-to-learn explanations, historical context, and modern relevance.",
};

export default function DeclarationPage() {
  return <DocumentPage document={declarationDocument} />;
}