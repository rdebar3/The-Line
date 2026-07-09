export type SiteNavItem = {
  label: string;
  href: string;
  /** Path prefixes that mark this link active */
  match?: string[];
};

export const PRIMARY_NAV: SiteNavItem[] = [
  {
    label: "Today in History",
    href: "/#today-in-history",
    match: ["/history"],
  },
  {
    label: "Founding Documents",
    href: "/#documents",
    match: ["/declaration", "/constitution", "/bill-of-rights"],
  },
  {
    label: "The Path",
    href: "/path",
    match: ["/path"],
  },
  {
    label: "Defenders",
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
  { label: "Home", href: "/", match: ["/"] },
  ...PRIMARY_NAV,
  ...STUDY_NAV,
  { label: "Privacy", href: "/privacy", match: ["/privacy"] },
];

export function isNavItemActive(pathname: string, item: SiteNavItem) {
  if (item.href === "/" || item.href === "/#today-in-history") {
    if (item.href === "/") return pathname === "/";
  }

  const prefixes = item.match ?? [item.href.split("#")[0] || item.href];
  return prefixes.some(
    (prefix) =>
      prefix !== "/" &&
      (pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}
