import {
  pickQuestionFormat,
  type QuestionFormat,
} from "@/lib/question-formats";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";

export type CurriculumTopic = {
  id: string;
  label: string;
  sourceDocument: string;
  amendment: string;
  amendmentLabel: string;
  principles: string[];
  difficultyFloor: ScenarioDifficulty;
  isMultiDocument?: boolean;
  passageIds?: string[];
};

export const CURRICULUM_TOPICS: CurriculumTopic[] = [
  // —— Declaration of Independence ——
  {
    id: "declaration-natural-rights",
    label: "Natural Rights & Self-Evident Truths",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Natural Rights",
    principles: ["natural rights", "unalienable rights", "life liberty and happiness"],
    difficultyFloor: "easy",
    passageIds: ["self-evident-truths"],
  },
  {
    id: "declaration-consent-alter",
    label: "Consent of the Governed & Right to Alter Government",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Consent of the Governed",
    principles: ["consent of the governed", "alter or abolish government", "just powers"],
    difficultyFloor: "easy",
    passageIds: ["consent-and-just-government"],
  },
  {
    id: "declaration-limited-government",
    label: "Limits on Government Power",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Limited Government",
    principles: ["just powers from consent", "right of revolution", "abuses and usurpations"],
    difficultyFloor: "easy",
    passageIds: ["prudence-and-abuses"],
  },
  {
    id: "declaration-representation",
    label: "Taxation & Representation",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Representation",
    principles: ["no taxation without consent", "representation", "local self-government"],
    difficultyFloor: "easy",
    passageIds: ["grievance-taxation"],
  },
  {
    id: "declaration-trial-jury",
    label: "Trial by Jury & Local Justice",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Trial by Jury",
    principles: ["trial by jury", "due process", "local charters and law"],
    difficultyFloor: "easy",
    passageIds: ["grievance-jury"],
  },
  {
    id: "declaration-separation",
    label: "Right to Separation & Self-Government",
    sourceDocument: "Declaration of Independence",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Independence",
    principles: ["political separation", "sovereignty", "self-government"],
    difficultyFloor: "medium",
    passageIds: ["declaration-of-independence"],
  },

  // —— U.S. Constitution (structure) ——
  {
    id: "preamble-union",
    label: "Preamble & National Purpose",
    sourceDocument: "U.S. Constitution — Preamble",
    amendment: "Preamble",
    amendmentLabel: "Constitution — Preamble",
    principles: ["more perfect union", "general welfare", "blessings of liberty", "posterity"],
    difficultyFloor: "easy",
    passageIds: ["preamble"],
  },
  {
    id: "article-i-legislative",
    label: "Legislative Power & Limits",
    sourceDocument: "U.S. Constitution — Article I",
    amendment: "Art. I",
    amendmentLabel: "Article I — Congress",
    principles: ["enumerated powers", "separation of powers", "vested in Congress"],
    difficultyFloor: "easy",
    passageIds: ["article-i-section-1", "article-i-section-8"],
  },
  {
    id: "article-i-commerce-necessary",
    label: "Commerce & Necessary and Proper Clause",
    sourceDocument: "U.S. Constitution — Article I",
    amendment: "Art. I",
    amendmentLabel: "Article I — Commerce Clause",
    principles: ["interstate commerce", "necessary and proper", "federal power limits"],
    difficultyFloor: "medium",
    passageIds: ["article-i-section-8"],
  },
  {
    id: "article-i-section-9",
    label: "Congressional Limits — Habeas & Attainder",
    sourceDocument: "U.S. Constitution — Article I",
    amendment: "Art. I",
    amendmentLabel: "Article I — Limits on Congress",
    principles: ["habeas corpus", "bill of attainder", "ex post facto"],
    difficultyFloor: "medium",
    passageIds: ["article-i-section-9"],
  },
  {
    id: "article-ii-executive",
    label: "Executive Power & Accountability",
    sourceDocument: "U.S. Constitution — Article II",
    amendment: "Art. II",
    amendmentLabel: "Article II — Executive",
    principles: ["executive duty", "faithfully execute", "presidential oath"],
    difficultyFloor: "medium",
    passageIds: ["article-ii-section-1"],
  },
  {
    id: "article-iii-judicial",
    label: "Judicial Power & Independence",
    sourceDocument: "U.S. Constitution — Article III",
    amendment: "Art. III",
    amendmentLabel: "Article III — Judiciary",
    principles: ["judicial review", "judicial independence", "cases and controversies"],
    difficultyFloor: "medium",
    passageIds: ["article-iii-section-1"],
  },
  {
    id: "article-iv-federalism",
    label: "Federalism & State Relations",
    sourceDocument: "U.S. Constitution — Article IV",
    amendment: "Art. IV",
    amendmentLabel: "Article IV — Federalism",
    principles: ["privileges and immunities", "extradition", "republican government"],
    difficultyFloor: "medium",
    passageIds: ["article-iv-section-2"],
  },
  {
    id: "article-v-amendment",
    label: "Amendment Process",
    sourceDocument: "U.S. Constitution — Article V",
    amendment: "Art. V",
    amendmentLabel: "Article V — Amendments",
    principles: ["constitutional amendment", "supermajority", "popular revision"],
    difficultyFloor: "medium",
    passageIds: ["article-v"],
  },
  {
    id: "article-vi-supremacy",
    label: "Supremacy & Oaths",
    sourceDocument: "U.S. Constitution — Article VI",
    amendment: "Art. VI",
    amendmentLabel: "Article VI — Supremacy Clause",
    principles: ["supreme law of the land", "oath to Constitution", "no religious test"],
    difficultyFloor: "medium",
    passageIds: ["article-vi"],
  },

  // —— Bill of Rights ——
  {
    id: "1st-speech-assembly",
    label: "Speech, Press & Assembly",
    sourceDocument: "Bill of Rights — First Amendment",
    amendment: "1st",
    amendmentLabel: "First Amendment",
    principles: ["free speech", "free press", "peaceable assembly", "petition"],
    difficultyFloor: "easy",
    passageIds: ["amendment-i"],
  },
  {
    id: "1st-religion",
    label: "Religious Liberty",
    sourceDocument: "Bill of Rights — First Amendment",
    amendment: "1st",
    amendmentLabel: "First Amendment — Religion",
    principles: ["establishment clause", "free exercise", "conscience"],
    difficultyFloor: "easy",
    passageIds: ["amendment-i"],
  },
  {
    id: "2nd-arms",
    label: "Right to Keep and Bear Arms",
    sourceDocument: "Bill of Rights — Second Amendment",
    amendment: "2nd",
    amendmentLabel: "Second Amendment",
    principles: ["individual right", "militia context", "self-defense"],
    difficultyFloor: "easy",
    passageIds: ["amendment-ii"],
  },
  {
    id: "3rd-quartering",
    label: "Quartering of Soldiers",
    sourceDocument: "Bill of Rights — Third Amendment",
    amendment: "3rd",
    amendmentLabel: "Third Amendment",
    principles: ["home sanctity", "peacetime limits", "property privacy"],
    difficultyFloor: "easy",
    passageIds: ["amendment-iii"],
  },
  {
    id: "4th-search",
    label: "Search, Seizure & Warrants",
    sourceDocument: "Bill of Rights — Fourth Amendment",
    amendment: "4th",
    amendmentLabel: "Fourth Amendment",
    principles: ["probable cause", "warrant requirement", "reasonable expectation of privacy"],
    difficultyFloor: "easy",
    passageIds: ["amendment-iv"],
  },
  {
    id: "5th-due-process",
    label: "Due Process & Self-Incrimination",
    sourceDocument: "Bill of Rights — Fifth Amendment",
    amendment: "5th",
    amendmentLabel: "Fifth Amendment",
    principles: ["due process", "self-incrimination", "double jeopardy", "takings"],
    difficultyFloor: "easy",
    passageIds: ["amendment-v"],
  },
  {
    id: "6th-counsel",
    label: "Counsel & Fair Trial",
    sourceDocument: "Bill of Rights — Sixth Amendment",
    amendment: "6th",
    amendmentLabel: "Sixth Amendment",
    principles: ["right to counsel", "speedy trial", "confront witnesses", "impartial jury"],
    difficultyFloor: "easy",
    passageIds: ["amendment-vi"],
  },
  {
    id: "7th-civil-jury",
    label: "Civil Jury & Common Law",
    sourceDocument: "Bill of Rights — Seventh Amendment",
    amendment: "7th",
    amendmentLabel: "Seventh Amendment",
    principles: ["civil jury", "common law", "re-examination limits"],
    difficultyFloor: "medium",
    passageIds: ["amendment-vii"],
  },
  {
    id: "8th-punishment",
    label: "Bail, Fines & Punishment",
    sourceDocument: "Bill of Rights — Eighth Amendment",
    amendment: "8th",
    amendmentLabel: "Eighth Amendment",
    principles: ["excessive bail", "cruel and unusual punishment", "proportionality"],
    difficultyFloor: "medium",
    passageIds: ["amendment-viii"],
  },
  {
    id: "9th-unenumerated",
    label: "Unenumerated Rights",
    sourceDocument: "Bill of Rights — Ninth Amendment",
    amendment: "9th",
    amendmentLabel: "Ninth Amendment",
    principles: ["retained by the people", "rights not listed", "popular sovereignty"],
    difficultyFloor: "medium",
    passageIds: ["amendment-ix"],
  },
  {
    id: "10th-federalism",
    label: "Reserved Powers",
    sourceDocument: "Bill of Rights — Tenth Amendment",
    amendment: "10th",
    amendmentLabel: "Tenth Amendment",
    principles: ["reserved powers", "federalism", "state sovereignty limits"],
    difficultyFloor: "medium",
    passageIds: ["amendment-x"],
  },

  // —— Later key amendments ——
  {
    id: "13th-abolition",
    label: "Abolition & Involuntary Servitude",
    sourceDocument: "Thirteenth Amendment",
    amendment: "13th",
    amendmentLabel: "Thirteenth Amendment",
    principles: ["abolition", "involuntary servitude", "badges of slavery"],
    difficultyFloor: "medium",
  },
  {
    id: "14th-due-process",
    label: "Due Process & Incorporation",
    sourceDocument: "Fourteenth Amendment",
    amendment: "14th",
    amendmentLabel: "Fourteenth Amendment — Due Process",
    principles: ["procedural due process", "substantive due process", "incorporation"],
    difficultyFloor: "medium",
  },
  {
    id: "14th-equal-protection",
    label: "Equal Protection",
    sourceDocument: "Fourteenth Amendment",
    amendment: "14th",
    amendmentLabel: "Fourteenth Amendment — Equal Protection",
    principles: ["equal protection", "suspect classifications", "fundamental rights"],
    difficultyFloor: "medium",
  },
  {
    id: "14th-privileges",
    label: "Privileges or Immunities",
    sourceDocument: "Fourteenth Amendment",
    amendment: "14th",
    amendmentLabel: "Fourteenth Amendment — Privileges",
    principles: ["privileges or immunities", "national citizenship", "state limits"],
    difficultyFloor: "hard",
  },
  {
    id: "15th-voting",
    label: "Voting Rights — Race",
    sourceDocument: "Fifteenth Amendment",
    amendment: "15th",
    amendmentLabel: "Fifteenth Amendment",
    principles: ["voting rights", "race-neutral suffrage", "enforcement"],
    difficultyFloor: "medium",
  },
  {
    id: "19th-suffrage",
    label: "Women's Suffrage",
    sourceDocument: "Nineteenth Amendment",
    amendment: "19th",
    amendmentLabel: "Nineteenth Amendment",
    principles: ["sex-neutral suffrage", "political equality", "voting access"],
    difficultyFloor: "easy",
  },

  // —— Core principles (cross-document) ——
  {
    id: "principle-limited-government",
    label: "Limited Government",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Limited Government",
    principles: ["delegated powers", "rights precede government", "constitutional limits"],
    difficultyFloor: "easy",
  },
  {
    id: "principle-federalism",
    label: "Federalism",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Federalism",
    principles: ["reserved powers", "state and national authority", "dual sovereignty"],
    difficultyFloor: "medium",
  },
  {
    id: "principle-republicanism",
    label: "Republican Government",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Republicanism",
    principles: ["representation", "elections", "accountable institutions"],
    difficultyFloor: "easy",
  },
  {
    id: "principle-individual-liberty",
    label: "Individual Liberty",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Individual Liberty",
    principles: ["personal freedom", "justified restrictions", "due process"],
    difficultyFloor: "easy",
  },
  {
    id: "principle-separation-powers",
    label: "Separation of Powers",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Separation of Powers",
    principles: ["legislative executive judicial", "checks and balances", "non-delegation"],
    difficultyFloor: "medium",
  },
  {
    id: "principle-rule-of-law",
    label: "Rule of Law",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Rule of Law",
    principles: ["written law", "fair procedure", "judicial review"],
    difficultyFloor: "medium",
  },
  {
    id: "principle-popular-sovereignty",
    label: "Popular Sovereignty",
    sourceDocument: "Core Principles",
    amendment: "Principle",
    amendmentLabel: "Popular Sovereignty",
    principles: ["consent of the governed", "we the people", "amendment by the people"],
    difficultyFloor: "easy",
  },

  // —— Multi-document synthesis (command level) ——
  {
    id: "multi-declaration-constitution-rights",
    label: "Declaration Natural Rights Meets Constitutional Structure",
    sourceDocument: "Declaration + U.S. Constitution",
    amendment: "Multi",
    amendmentLabel: "Declaration & Constitution",
    principles: ["natural rights", "enumerated powers", "consent", "limited government"],
    difficultyFloor: "hard",
    isMultiDocument: true,
  },
  {
    id: "multi-structure-bill-of-rights",
    label: "Constitutional Structure & Bill of Rights Limits",
    sourceDocument: "U.S. Constitution + Bill of Rights",
    amendment: "Multi",
    amendmentLabel: "Constitution & Bill of Rights",
    principles: ["separation of powers", "individual rights", "federal limits on liberty"],
    difficultyFloor: "hard",
    isMultiDocument: true,
  },
  {
    id: "multi-federalism-liberty",
    label: "Federalism vs Individual Liberty",
    sourceDocument: "Tenth Amendment + Fourteenth Amendment",
    amendment: "Multi",
    amendmentLabel: "Federalism & Liberty",
    principles: ["reserved powers", "due process", "state vs federal authority"],
    difficultyFloor: "hard",
    isMultiDocument: true,
  },
  {
    id: "multi-declaration-amendments",
    label: "Founding Creed & Reconstruction Amendments",
    sourceDocument: "Declaration + Fourteenth & Fifteenth Amendments",
    amendment: "Multi",
    amendmentLabel: "Declaration & Later Amendments",
    principles: ["equal protection", "voting rights", "unalienable rights in practice"],
    difficultyFloor: "hard",
    isMultiDocument: true,
  },
];

const SETTING_POOL = [
  "a county courthouse",
  "a public university campus",
  "a small business facing agency enforcement",
  "a hospital or medical setting",
  "a protest at a government building",
  "a traffic stop on a state highway",
  "a homeowner association dispute with city code enforcement",
  "a school board meeting",
  "a social media platform moderation dispute (generic company)",
  "a federal workplace",
  "a border checkpoint (generic, no real policy names)",
  "a zoning hearing",
  "a veterans' benefits office",
  "a public library",
  "a state election office",
  "a private residence during a police visit",
  "a congressional oversight hearing (generic)",
  "a tribal-adjacent jurisdiction dispute (generic)",
  "an airport security screening",
  "a juvenile detention intake",
  "a public housing authority",
  "a licensed professional disciplinary board",
  "a data broker selling location records (generic tech)",
  "a municipal permit office",
  "a military installation gate (civilian visitor)",
] as const;

const DIFFICULTY_RANK: Record<ScenarioDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export type DocumentFamily =
  | "declaration"
  | "constitution"
  | "bill-of-rights"
  | "later-amendments"
  | "principles"
  | "multi-document";

export const DOCUMENT_FAMILY_LABELS: Record<DocumentFamily, string> = {
  declaration: "Declaration of Independence",
  constitution: "U.S. Constitution",
  "bill-of-rights": "Bill of Rights",
  "later-amendments": "Later Amendments",
  principles: "Core Principles",
  "multi-document": "Cross-Document",
};

export type TopicAssignment = {
  topicId: string;
  label: string;
  sourceDocument: string;
  amendment: string;
  amendmentLabel: string;
  principles: string[];
  settingHint: string;
  questionFormat: QuestionFormat;
  isMultiDocument?: boolean;
  passageIds?: string[];
};

function getTopicFamily(topic: CurriculumTopic): DocumentFamily {
  if (topic.isMultiDocument) return "multi-document";
  if (topic.sourceDocument === "Core Principles" || topic.id.startsWith("principle-")) {
    return "principles";
  }
  if (topic.sourceDocument.includes("Declaration")) return "declaration";
  if (topic.sourceDocument.includes("Bill of Rights")) return "bill-of-rights";
  if (
    topic.sourceDocument.includes("Thirteenth") ||
    topic.sourceDocument.includes("Fourteenth") ||
    topic.sourceDocument.includes("Fifteenth") ||
    topic.sourceDocument.includes("Nineteenth")
  ) {
    return "later-amendments";
  }
  return "constitution";
}

function getDiversityTargets(
  sessionSize: number,
  difficulty: ScenarioDifficulty
): DocumentFamily[] {
  if (difficulty === "easy") {
    return sessionSize >= 2
      ? ["declaration", "constitution", "bill-of-rights"]
      : ["declaration", "constitution", "bill-of-rights", "principles"];
  }
  if (difficulty === "medium") {
    return sessionSize >= 4
      ? ["declaration", "constitution", "bill-of-rights", "later-amendments", "principles"]
      : ["declaration", "constitution", "bill-of-rights", "later-amendments"];
  }
  return sessionSize >= 2
    ? ["declaration", "constitution", "bill-of-rights", "multi-document"]
    : ["declaration", "constitution", "multi-document"];
}

function hashSeed(seed: number, index: number): number {
  return Math.abs((seed * 9301 + index * 49297 + 233280) % 2147483647);
}

function topicMatchesWeakArea(topic: CurriculumTopic, weakArea: string): boolean {
  const needle = weakArea.toLowerCase();
  return (
    topic.amendmentLabel.toLowerCase().includes(needle) ||
    topic.label.toLowerCase().includes(needle) ||
    topic.principles.some((principle) => principle.toLowerCase().includes(needle)) ||
    needle.includes(topic.amendment.toLowerCase())
  );
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = hashSeed(seed, index) % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function ensureDocumentDiversity({
  chosen,
  eligible,
  sessionSize,
  difficulty,
  sessionSeed,
}: {
  chosen: CurriculumTopic[];
  eligible: CurriculumTopic[];
  sessionSize: number;
  difficulty: ScenarioDifficulty;
  sessionSeed: number;
}): CurriculumTopic[] {
  const result = [...chosen];
  const targets = getDiversityTargets(sessionSize, difficulty);
  const usedIds = new Set(result.map((topic) => topic.id));

  for (const family of targets) {
    if (result.length >= sessionSize) break;
    if (result.some((topic) => getTopicFamily(topic) === family)) continue;

    const candidate = shuffleWithSeed(
      eligible.filter(
        (topic) => getTopicFamily(topic) === family && !usedIds.has(topic.id)
      ),
      sessionSeed + family.length * 31
    )[0];

    if (!candidate) continue;

    if (result.length < sessionSize) {
      result.push(candidate);
      usedIds.add(candidate.id);
      continue;
    }

    const replaceIndex = result.findIndex(
      (topic) =>
        !targets.includes(getTopicFamily(topic)) &&
        getTopicFamily(topic) !== family
    );
    if (replaceIndex >= 0) {
      result[replaceIndex] = candidate;
      usedIds.add(candidate.id);
    }
  }

  return result.slice(0, sessionSize);
}

export function pickSessionTopicAssignments({
  sessionSize,
  difficulty,
  weakAreas,
  recentTopicIds,
  sessionSeed,
  preferMultiDocument = false,
}: {
  sessionSize: number;
  difficulty: ScenarioDifficulty;
  weakAreas: string[];
  recentTopicIds: string[];
  sessionSeed: number;
  preferMultiDocument?: boolean;
}): TopicAssignment[] {
  const floor = DIFFICULTY_RANK[difficulty];
  const recent = new Set(recentTopicIds);

  const eligible = CURRICULUM_TOPICS.filter(
    (topic) => DIFFICULTY_RANK[topic.difficultyFloor] <= floor
  );

  const weakMatched = eligible.filter((topic) =>
    weakAreas.some((area) => topicMatchesWeakArea(topic, area))
  );

  const fresh = eligible.filter((topic) => !recent.has(topic.id));
  const pool = fresh.length >= sessionSize ? fresh : eligible;

  const prioritized = [
    ...shuffleWithSeed(weakMatched, sessionSeed),
    ...shuffleWithSeed(
      pool.filter((topic) => !weakMatched.some((weak) => weak.id === topic.id)),
      sessionSeed + 17
    ),
  ];

  const chosen: CurriculumTopic[] = [];
  const usedIds = new Set<string>();

  if (
    difficulty === "hard" &&
    (preferMultiDocument || sessionSize >= 2)
  ) {
    const multiCandidates = shuffleWithSeed(
      eligible.filter((topic) => topic.isMultiDocument && !recent.has(topic.id)),
      sessionSeed + 3
    );
    const multiTopic =
      multiCandidates[0] ??
      eligible.find((topic) => topic.isMultiDocument);
    if (multiTopic && !usedIds.has(multiTopic.id)) {
      chosen.push(multiTopic);
      usedIds.add(multiTopic.id);
    }
  }

  for (const topic of prioritized) {
    if (chosen.length >= sessionSize) break;
    if (usedIds.has(topic.id)) continue;
    chosen.push(topic);
    usedIds.add(topic.id);
  }

  if (chosen.length < sessionSize) {
    for (const topic of shuffleWithSeed(eligible, sessionSeed + 99)) {
      if (chosen.length >= sessionSize) break;
      if (usedIds.has(topic.id)) continue;
      chosen.push(topic);
      usedIds.add(topic.id);
    }
  }

  const diversified = ensureDocumentDiversity({
    chosen,
    eligible,
    sessionSize,
    difficulty,
    sessionSeed,
  });

  return diversified.map((topic, index) => ({
    topicId: topic.id,
    label: topic.label,
    sourceDocument: topic.sourceDocument,
    amendment: topic.amendment,
    amendmentLabel: topic.amendmentLabel,
    principles: topic.principles,
    isMultiDocument: topic.isMultiDocument,
    passageIds: topic.passageIds,
    questionFormat: pickQuestionFormat(difficulty, index, topic.id),
    settingHint:
      SETTING_POOL[hashSeed(sessionSeed, index) % SETTING_POOL.length],
  }));
}

function getSessionFamilyRotation(
  difficulty: ScenarioDifficulty,
  scenarioIndexInSession: number
): DocumentFamily {
  if (
    difficulty === "hard" &&
    scenarioIndexInSession > 0 &&
    scenarioIndexInSession % 3 === 2
  ) {
    return "multi-document";
  }

  const easyRotation: DocumentFamily[] = [
    "declaration",
    "constitution",
    "bill-of-rights",
    "principles",
    "declaration",
    "constitution",
    "bill-of-rights",
  ];
  const mediumRotation: DocumentFamily[] = [
    "declaration",
    "constitution",
    "bill-of-rights",
    "later-amendments",
    "principles",
    "constitution",
    "declaration",
    "bill-of-rights",
  ];
  const hardRotation: DocumentFamily[] = [
    "declaration",
    "constitution",
    "bill-of-rights",
    "later-amendments",
    "principles",
    "constitution",
    "declaration",
    "bill-of-rights",
  ];

  const rotation =
    difficulty === "easy"
      ? easyRotation
      : difficulty === "medium"
        ? mediumRotation
        : hardRotation;

  return rotation[scenarioIndexInSession % rotation.length];
}

function pickTopicForFamily({
  family,
  difficulty,
  weakAreas,
  excludedTopicIds,
  sessionSeed,
}: {
  family: DocumentFamily;
  difficulty: ScenarioDifficulty;
  weakAreas: string[];
  excludedTopicIds: Set<string>;
  sessionSeed: number;
}): CurriculumTopic | undefined {
  const floor = DIFFICULTY_RANK[difficulty];
  const eligible = CURRICULUM_TOPICS.filter(
    (topic) => DIFFICULTY_RANK[topic.difficultyFloor] <= floor
  );

  const familyTopics = eligible.filter(
    (topic) => getTopicFamily(topic) === family && !excludedTopicIds.has(topic.id)
  );
  const pool =
    familyTopics.length > 0
      ? familyTopics
      : eligible.filter((topic) => getTopicFamily(topic) === family);

  if (pool.length === 0) return undefined;

  const weakMatched = pool.filter((topic) =>
    weakAreas.some((area) => topicMatchesWeakArea(topic, area))
  );
  const prioritized = [
    ...shuffleWithSeed(weakMatched, sessionSeed),
    ...shuffleWithSeed(
      pool.filter(
        (topic) => !weakMatched.some((match) => match.id === topic.id)
      ),
      sessionSeed + 13
    ),
  ];

  return prioritized[0];
}

export function pickNextTopicAssignment({
  difficulty,
  weakAreas,
  recentTopicIds,
  sessionTopicIds,
  scenarioIndexInSession,
  sessionSeed,
}: {
  difficulty: ScenarioDifficulty;
  weakAreas: string[];
  recentTopicIds: string[];
  sessionTopicIds: string[];
  scenarioIndexInSession: number;
  sessionSeed: number;
}): TopicAssignment {
  const excludedTopicIds = new Set([...recentTopicIds, ...sessionTopicIds]);
  const targetFamily = getSessionFamilyRotation(
    difficulty,
    scenarioIndexInSession
  );

  let topic = pickTopicForFamily({
    family: targetFamily,
    difficulty,
    weakAreas,
    excludedTopicIds,
    sessionSeed: sessionSeed + scenarioIndexInSession * 7919,
  });

  if (!topic) {
    const fallbackFamilies: DocumentFamily[] = [
      "declaration",
      "constitution",
      "bill-of-rights",
      "principles",
      "later-amendments",
      "multi-document",
    ];
    for (const family of fallbackFamilies) {
      if (family === targetFamily) continue;
      topic = pickTopicForFamily({
        family,
        difficulty,
        weakAreas,
        excludedTopicIds,
        sessionSeed: sessionSeed + scenarioIndexInSession * 7919 + family.length,
      });
      if (topic) break;
    }
  }

  if (!topic) {
    const [assignment] = pickSessionTopicAssignments({
      sessionSize: 1,
      difficulty,
      weakAreas,
      recentTopicIds: [...excludedTopicIds],
      sessionSeed: sessionSeed + scenarioIndexInSession * 7919,
    });
    return assignment;
  }

  const questionFormat = pickQuestionFormat(
    difficulty,
    scenarioIndexInSession,
    topic.id
  );
  const settingHint =
    questionFormat === "passage" || questionFormat === "teach"
      ? "Use founding text and plain explanation — no required fictional setting"
      : SETTING_POOL[
          hashSeed(sessionSeed, scenarioIndexInSession) % SETTING_POOL.length
        ];

  return {
    topicId: topic.id,
    label: topic.label,
    sourceDocument: topic.sourceDocument,
    amendment: topic.amendment,
    amendmentLabel: topic.amendmentLabel,
    principles: topic.principles,
    isMultiDocument: topic.isMultiDocument,
    passageIds: topic.passageIds,
    questionFormat,
    settingHint,
  };
}

export function getDocumentFamilyFromSource(sourceDocument: string): DocumentFamily {
  if (sourceDocument.includes("Declaration")) return "declaration";
  if (sourceDocument.includes("Core Principles")) return "principles";
  if (sourceDocument.includes("+")) return "multi-document";
  if (sourceDocument.includes("Bill of Rights")) return "bill-of-rights";
  if (
    sourceDocument.includes("Thirteenth") ||
    sourceDocument.includes("Fourteenth") ||
    sourceDocument.includes("Fifteenth") ||
    sourceDocument.includes("Nineteenth")
  ) {
    return "later-amendments";
  }
  return "constitution";
}

export function getCurriculumOverview(): string {
  const bySource = CURRICULUM_TOPICS.reduce<Record<string, string[]>>(
    (accumulator, topic) => {
      const bucket = accumulator[topic.sourceDocument] ?? [];
      bucket.push(topic.label);
      accumulator[topic.sourceDocument] = bucket;
      return accumulator;
    },
    {}
  );

  return Object.entries(bySource)
    .map(([source, labels]) => `${source}: ${labels.join("; ")}`)
    .join("\n");
}