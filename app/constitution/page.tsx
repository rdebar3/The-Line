import { DocumentPage } from "@/components/documents/document-page";
import { constitutionDocument } from "@/lib/documents/constitution";

export const metadata = {
  title: "The Constitution | The Line",
  description:
    "Read the Constitution with tap-to-learn explanations, historical context, and modern relevance.",
};

export default function ConstitutionPage() {
  return <DocumentPage document={constitutionDocument} />;
}