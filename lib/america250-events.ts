import type { America250Event, America250Highlight } from "@/lib/this-day-250";
import { getTodayDateString } from "@/lib/this-day-250";

export const AMERICA250_EVENTS: America250Event[] = [
  {
    id: "times-square-ball-drop",
    title: "Times Square Ball Drop — America 250",
    type: "single-day",
    date: "2026-07-03",
    location: "Times Square, New York City",
    description:
      "A commemorative ball drop marking the eve of America's 250th birthday — a national spotlight on the Semiquincentennial.",
    url: "https://america250.org/",
    nearDays: 2,
  },
  {
    id: "salute-to-america-250",
    title: "Salute to America 250",
    type: "single-day",
    date: "2026-07-04",
    location: "National Mall, Washington, D.C.",
    description:
      "The flagship July 4 commemoration on the National Mall — ceremonies, tributes, and a national salute to 250 years of American independence.",
    url: "https://america250.org/",
    nearDays: 2,
  },
  {
    id: "americas-potluck",
    title: "America's Potluck",
    type: "single-day",
    date: "2026-07-05",
    location: "Nationwide",
    description:
      "A nationwide gathering celebrating shared heritage — communities host potlucks and local commemorations as part of the America 250 program.",
    url: "https://america250.org/",
    nearDays: 2,
  },
  {
    id: "americas-invitation",
    title: "America's Invitation",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "An open invitation for every American to participate in the Semiquincentennial — local events, storytelling, and civic engagement across the year.",
    url: "https://america250.org/",
  },
  {
    id: "americas-field-trip",
    title: "America's Field Trip",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "Educational field trips and learning experiences connecting students and families to Revolutionary-era sites and founding history.",
    url: "https://america250.org/",
  },
  {
    id: "america-gives",
    title: "America Gives",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "A national service and giving initiative — citizens contributing time, resources, and civic action in honor of 250 years.",
    url: "https://america250.org/",
  },
  {
    id: "our-american-story",
    title: "Our American Story",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "Collecting and sharing the diverse stories that make up the American experience — from founding-era voices to communities today.",
    url: "https://america250.org/",
  },
  {
    id: "america-waves",
    title: "America Waves",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "A visual commemoration campaign — flags, banners, and displays marking the 250th anniversary in towns and cities nationwide.",
    url: "https://america250.org/",
  },
  {
    id: "america-innovates",
    title: "America Innovates",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "Highlighting American ingenuity from the founding era to today — science, industry, and the spirit of self-governing enterprise.",
    url: "https://america250.org/",
  },
  {
    id: "americas-performance",
    title: "America's Performance",
    type: "ongoing",
    date: "2026-01-01",
    endDate: "2026-12-31",
    description:
      "Arts and performance programs celebrating 250 years — music, theater, and cultural events tied to the Semiquincentennial.",
    url: "https://america250.org/",
  },
];

function daysBetween(a: string, b: string) {
  const msPerDay = 86_400_000;
  const dateA = new Date(`${a}T12:00:00Z`).getTime();
  const dateB = new Date(`${b}T12:00:00Z`).getTime();
  return Math.round(Math.abs(dateA - dateB) / msPerDay);
}

function isWithinRange(date: string, start: string, end?: string) {
  const target = new Date(`${date}T12:00:00Z`).getTime();
  const rangeStart = new Date(`${start}T12:00:00Z`).getTime();
  const rangeEnd = end
    ? new Date(`${end}T12:00:00Z`).getTime()
    : rangeStart;
  return target >= rangeStart && target <= rangeEnd;
}

export function getAmerica250Highlight(
  today = getTodayDateString()
): America250Highlight | null {
  const singleDayMatches = AMERICA250_EVENTS.filter((event) => {
    if (event.type !== "single-day") return false;
    const nearDays = event.nearDays ?? 2;
    return daysBetween(today, event.date) <= nearDays;
  }).sort(
    (a, b) =>
      daysBetween(today, a.date) - daysBetween(today, b.date)
  );

  if (singleDayMatches.length > 0) {
    const event = singleDayMatches[0];
    const isToday = event.date === today;
    return {
      event,
      label: isToday ? "Happening today" : "Happening now",
    };
  }

  const ongoing = AMERICA250_EVENTS.find(
    (event) =>
      event.type === "ongoing" && isWithinRange(today, event.date, event.endDate)
  );

  if (ongoing) {
    return {
      event: ongoing,
      label: "America 250 — ongoing",
    };
  }

  return null;
}