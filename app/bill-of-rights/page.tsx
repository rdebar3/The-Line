import { DocumentPage } from "@/components/documents/document-page";
import { billOfRightsDocument } from "@/lib/documents/bill-of-rights";

export const metadata = {
  title: "Bill of Rights | The Line",
  description:
    "Read the Bill of Rights with tap-to-learn explanations, historical context, and modern relevance.",
};

export default function BillOfRightsPage() {
  return <DocumentPage document={billOfRightsDocument} />;
}