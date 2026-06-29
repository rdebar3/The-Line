import type { ArsenalSituationId } from "@/lib/arsenal-situations";
import { ITEM_SITUATIONS } from "@/lib/arsenal-situations";

export type ArsenalItem = {
  id: string;
  category: "script" | "case" | "checklist" | "principle";
  title: string;
  summary: string;
  content: string;
  amendment?: string;
  situations?: ArsenalSituationId[];
};

export const arsenalCategories = [
  { id: "script", label: "Defense Scripts", description: "What to say when your rights are tested." },
  { id: "case", label: "Landmark Cases", description: "Precedent that defines the line." },
  { id: "checklist", label: "Field Checklists", description: "Steps to protect yourself under pressure." },
  { id: "principle", label: "Core Principles", description: "Founding logic you can apply anywhere." },
] as const;

const RAW_ARSENAL_ITEMS: Omit<ArsenalItem, "situations">[] = [
  {
    id: "fourth-search",
    category: "script",
    title: "Traffic Stop — Search Request",
    summary: "When an officer asks to search your vehicle without probable cause.",
    amendment: "4th Amendment",
    content:
      "You may say: \"Officer, I do not consent to any searches of my person, vehicle, or belongings.\" Remain calm and keep your hands visible. Consent eliminates the need for a warrant — withholding it forces the government to meet constitutional standards. If they search anyway, do not physically resist; note officers, time, and details for any later challenge.",
  },
  {
    id: "fifth-silence",
    category: "script",
    title: "Custodial Interrogation — Right to Remain Silent",
    summary: "When questioned after arrest or in a coercive setting.",
    amendment: "5th Amendment",
    content:
      "You may say: \"I am invoking my right to remain silent and I want to speak with an attorney.\" Under Miranda v. Arizona, once you invoke, interrogation must stop. Do not offer partial explanations — they can be used against you. Repeat your invocation if questioning continues.",
  },
  {
    id: "first-assembly",
    category: "script",
    title: "Peaceful Protest — Permit Pushback",
    summary: "When officials deny a permit based on viewpoint.",
    amendment: "1st Amendment",
    content:
      "Document the denial in writing. Ask which neutral criteria were applied and whether similar groups received permits. Content-based restrictions face strict scrutiny; time, place, and manner rules must be viewpoint-neutral and narrowly tailored. Consult counsel before civil disobedience — the Constitution protects speech, not every tactic.",
  },
  {
    id: "mapp-v-ohio",
    category: "case",
    title: "Mapp v. Ohio (1961)",
    summary: "Exclusionary rule applied to states.",
    amendment: "4th Amendment",
    content:
      "Evidence obtained through unconstitutional searches may be excluded from state criminal trials. The Fourth Amendment is not merely symbolic — violations carry consequences. If your rights were violated, preservation of evidence and prompt legal counsel are critical.",
  },
  {
    id: "brandenburg",
    category: "case",
    title: "Brandenburg v. Ohio (1969)",
    summary: "The standard for punishing inflammatory speech.",
    amendment: "1st Amendment",
    content:
      "Speech cannot be punished unless it is directed to inciting imminent lawless action and is likely to produce such action. Mere advocacy of ideas — even radical ones — is protected. The government must meet a demanding threshold before criminalizing expression.",
  },
  {
    id: "gideon",
    category: "case",
    title: "Gideon v. Wainwright (1963)",
    summary: "Right to counsel in felony cases.",
    amendment: "6th Amendment",
    content:
      "The Sixth Amendment guarantees the right to counsel in criminal prosecutions where liberty is at stake. If you cannot afford an attorney, one must be provided. Request counsel explicitly and do not waive this right without understanding the consequences.",
  },
  {
    id: "stop-document",
    category: "checklist",
    title: "After a Rights Encounter",
    summary: "Preserve the record while memory is fresh.",
    content:
      "1. Write down date, time, location, and names/badge numbers.\n2. Note exact words used by all parties.\n3. Identify witnesses and gather contact information.\n4. Photograph or preserve physical evidence lawfully.\n5. Do not post inflammatory accounts on social media.\n6. Contact a qualified attorney before making statements to investigators.",
  },
  {
    id: "home-entry",
    category: "checklist",
    title: "Knock at the Door",
    summary: "Government agents at your residence.",
    amendment: "4th Amendment",
    content:
      "1. Ask for identification and the purpose of the visit.\n2. Do not consent to entry without a valid warrant — read it at the door.\n3. A search warrant authorizes entry and search of listed areas; an arrest warrant does not automatically authorize a home search.\n4. Remain calm; do not obstruct, but clearly state non-consent if applicable.\n5. Record what you lawfully can; consult counsel immediately.",
  },
  {
    id: "limited-government",
    category: "principle",
    title: "Enumerated Powers & Reserved Rights",
    summary: "The default is liberty, not permission.",
    content:
      "The Constitution grants the federal government limited, enumerated powers. The Ninth and Tenth Amendments reinforce that rights exist beyond those listed and that undelegated powers remain with the states and the people. When government acts, the burden is on government to show authority — not on the citizen to prove permission.",
  },
  {
    id: "due-process",
    category: "principle",
    title: "Due Process Before Deprivation",
    summary: "Life, liberty, or property cannot be taken arbitrarily.",
    amendment: "5th & 14th Amendments",
    content:
      "No person shall be deprived of life, liberty, or property without due process of law. Procedural due process requires fair notice and a meaningful opportunity to be heard. Substantive due process guards against arbitrary government action regardless of procedure. Any deprivation demands scrutiny.",
  },
];

export const arsenalItems: ArsenalItem[] = RAW_ARSENAL_ITEMS.map((item) => ({
  ...item,
  situations: ITEM_SITUATIONS[item.id],
}));