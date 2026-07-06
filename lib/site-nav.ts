export type SiteNavItem = {
  label: string;
  href: string;
  /** Path prefixes that mark this link active */
  match?: string[];
};

export const PRIMARY_NAV: SiteNavItem[] = [
  { label: "Hub", href: "/", match: ["/"] },
  { label: "History", href: "/history", match: ["/history"] },
  { label: "Documents", href: "/#documents", match: ["/declaration", "/constitution", "/bill-of-rights"] },
  {
    label: "Training",
    href: "/rights-under-pressure",
    match: ["/rights-under-pressure"],
  },
  { label: "Drills", href: "/quick-drills", match: ["/quick-drills"] },
  {
    label: "Simulator",
    href: "/republic-simulator",
    match: ["/republic-simulator"],
  },
  { label: "My Lines", href: "/my-lines", match: ["/my-lines"] },
  {
    label: "Certs",
    href: "/certifications",
    match: ["/certifications"],
  },
];

export const STUDY_NAV: SiteNavItem[] = [
  { label: "Declaration", href: "/declaration", match: ["/declaration"] },
  { label: "Constitution", href: "/constitution", match: ["/constitution"] },
  {
    label: "Bill of Rights",
    href: "/bill-of-rights",
    match: ["/bill-of-rights"],
  },
];

export const FOOTER_NAV: SiteNavItem[] = [
  ...PRIMARY_NAV,
  ...STUDY_NAV,
  { label: "Privacy", href: "/privacy", match: ["/privacy"] },
];

export function isNavItemActive(pathname: string, item: SiteNavItem) {
  if (item.href === "/") {
    return pathname === "/";
  }

  const prefixes = item.match ?? [item.href];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}