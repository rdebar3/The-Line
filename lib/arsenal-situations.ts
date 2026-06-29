export type ArsenalSituationId =
  | "traffic-stop"
  | "home-entry"
  | "protest"
  | "school"
  | "airport"
  | "custody";

export const ARSENAL_SITUATIONS: {
  id: ArsenalSituationId;
  label: string;
  description: string;
}[] = [
  {
    id: "traffic-stop",
    label: "Traffic stop",
    description: "Stops, searches, and roadside encounters.",
  },
  {
    id: "home-entry",
    label: "Home visit",
    description: "Knocks, warrants, and residential entry.",
  },
  {
    id: "protest",
    label: "Protest & permits",
    description: "Speech, assembly, and public forums.",
  },
  {
    id: "school",
    label: "School & campus",
    description: "Student speech and administrative power.",
  },
  {
    id: "airport",
    label: "Airport & travel",
    description: "Screening, questioning, and border pressure.",
  },
  {
    id: "custody",
    label: "Custody & interrogation",
    description: "Silence, counsel, and Miranda pressure.",
  },
];

export const ITEM_SITUATIONS: Record<string, ArsenalSituationId[]> = {
  "fourth-search": ["traffic-stop", "airport"],
  "fifth-silence": ["custody", "traffic-stop"],
  "first-assembly": ["protest", "school"],
  "mapp-v-ohio": ["traffic-stop", "home-entry"],
  brandenburg: ["protest"],
  gideon: ["custody"],
  "stop-document": ["traffic-stop", "home-entry", "protest", "custody"],
  "home-entry": ["home-entry"],
  "limited-government": ["school", "airport", "protest"],
  "due-process": ["custody", "school"],
};