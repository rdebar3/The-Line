import { DocumentPage } from "@/components/documents/document-page";
import { billOfRightsDocument } from "@/lib/documents/bill-of-rights";

export const metadata = {
  title: "Bill of Rights",
  description:
    "Study the Bill of Rights in The Line archive — original text with historical context, modern relevance, and Save to My Lines.",
};

export default function BillOfRightsPage() {
  return <DocumentPage document={billOfRightsDocument} />;
}
