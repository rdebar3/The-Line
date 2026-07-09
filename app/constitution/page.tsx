import { DocumentPage } from "@/components/documents/document-page";
import { constitutionDocument } from "@/lib/documents/constitution";

export const metadata = {
  title: "The Constitution",
  description:
    "Study the Constitution in The Line archive — original text with historical context, modern relevance, and Save to My Lines.",
};

export default function ConstitutionPage() {
  return <DocumentPage document={constitutionDocument} />;
}
