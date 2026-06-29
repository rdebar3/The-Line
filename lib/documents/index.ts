import { billOfRightsDocument } from "@/lib/documents/bill-of-rights";
import { constitutionDocument } from "@/lib/documents/constitution";
import { declarationDocument } from "@/lib/documents/declaration";
import type { FoundingDocument } from "@/lib/documents/types";

export { billOfRightsDocument } from "@/lib/documents/bill-of-rights";
export { constitutionDocument } from "@/lib/documents/constitution";
export { declarationDocument } from "@/lib/documents/declaration";
export type {
  DocumentAccent,
  DocumentPassage,
  FoundingDocument,
} from "@/lib/documents/types";

export const FOUNDING_DOCUMENTS: FoundingDocument[] = [
  declarationDocument,
  constitutionDocument,
  billOfRightsDocument,
];