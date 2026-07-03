import { shuffleScenarioChoices } from "@/lib/choice-shuffle";
import type { TopicAssignment } from "@/lib/scenario-curriculum";
import type { QuestionFormat } from "@/lib/question-formats";
import type { ScenarioDifficulty } from "@/lib/scenario-difficulty";

export type ScenarioChoice = {
  id: string;
  label: string;
};

export type Scenario = {
  id: string;
  /** Short source tag — Declaration, Art. I, 4th, Principle, Multi, etc. */
  amendment: string;
  /** Human-readable source label from the assigned topic */
  amendmentLabel: string;
  /** Full document name from curriculum assignment */
  sourceDocument?: string;
  /** How the prompt is framed — passage, teach, apply, or scenario */
  questionFormat?: QuestionFormat;
  title: string;
  situation: string;
  question: string;
  choices: ScenarioChoice[];
  correctChoiceId: string;
  historicalContext: string;
  modernImplication: string;
  guardianPositive: string;
  guardianNegative: string;
  difficulty?: ScenarioDifficulty;
  generated?: boolean;
  passageIds?: string[];
  documentSlug?: "declaration" | "constitution" | "bill-of-rights";
  rememberLine?: string;
};

export const STATIC_SCENARIOS: Scenario[] = [
  {
    id: "declaration-consent",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Consent of the Governed",
    sourceDocument: "Declaration of Independence",
    title: "Permit Fee Without a Vote",
    situation:
      "A county adds a new yearly fee on every household to pay for a regional board. Residents say they never voted on the fee and have no elected member on the board. If they do not pay, the county can place a lien on their homes.",
    question: "Which founding idea best explains why this fee is a problem?",
    choices: [
      {
        id: "a",
        label: "Government power should come from the consent of the governed",
      },
      {
        id: "b",
        label: "The Third Amendment stops the government from housing soldiers in private homes",
      },
      {
        id: "c",
        label: "The Seventh Amendment guarantees a jury in every civil case",
      },
      {
        id: "d",
        label: "Congress can charge any fee it wants under the Necessary and Proper Clause",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The Declaration of Independence says governments are formed to protect rights and get their 'just powers from the consent of the governed.' One of the colonists' main complaints against Britain was being taxed without representation.",
    modernImplication:
      "New fees, mandates, and regional boards still raise the same question: who agreed to this rule, and who represents the people paying for it? Representation is the first check on arbitrary power.",
    guardianPositive:
      "You traced the line to its source: power without consent is the problem the Declaration named first.",
    guardianNegative:
      "Follow the consent thread. When people are bound by rules they did not authorize, the Declaration's standard lights up.",
  },
  {
    id: "declaration-natural-rights",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Natural Rights",
    sourceDocument: "Declaration of Independence",
    title: "License to Speak",
    situation:
      "A town requires bloggers and podcasters to get a 'civic commentary license' before they can publish criticism of local officials. Officials say the rule promotes civility and cuts down on false information.",
    question: "Which Declaration-era idea is most at risk here?",
    choices: [
      {
        id: "a",
        label: "Basic rights exist before government and cannot be licensed away",
      },
      {
        id: "b",
        label: "Only the Second Amendment protects rights that exist before government",
      },
      {
        id: "c",
        label: "The Supremacy Clause requires states to honor federal licenses",
      },
      {
        id: "d",
        label: "Natural rights apply only during declared emergencies",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The Declaration says people are 'endowed by their Creator with certain unalienable Rights,' including Liberty. Rights come before government. They are not privileges that officials hand out.",
    modernImplication:
      "Permit rules for speech, assembly, or conscience still test whether liberty is a right or something the government grants. The Declaration's answer is clear: government protects rights — it does not invent them.",
    guardianPositive:
      "Correct. Liberty is not a license stamped by the town clerk. The creed still governs.",
    guardianNegative:
      "Rights come before government. When officials must approve criticism, you are not looking at liberty — you are looking at permission.",
  },
  {
    id: "constitution-enumerated-powers",
    amendment: "Art. I",
    amendmentLabel: "Article I — Congress",
    sourceDocument: "U.S. Constitution — Article I",
    title: "Agency Rule, No Statute",
    situation:
      "A federal agency bans a type of home appliance nationwide without a vote in Congress. The agency points to a broad 'public welfare' memo, but no law specifically authorizes the ban.",
    question: "What is the main constitutional problem with this rule?",
    choices: [
      {
        id: "a",
        label: "Only Congress can make laws — the agency cannot create binding rules without a law behind them",
      },
      {
        id: "b",
        label: "The Third Amendment limits appliance inspections in homes",
      },
      {
        id: "c",
        label: "The Sixth Amendment requires a jury trial for appliance sellers",
      },
      {
        id: "d",
        label: "The Preamble alone gives agencies unlimited welfare power",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Article I, Section 1 gives 'all legislative Powers' to Congress. Article I, Section 8 lists federal powers. Agencies can carry out the law, but they cannot replace Congress as the lawmaker.",
    modernImplication:
      "Agency rules, emergency orders, and fines constantly test whether Congress still makes law or just signs off on agency decisions. Article I draws the line between republican government and rule by bureaucracy.",
    guardianPositive:
      "You held the structural line: Congress makes law. Agencies execute — they do not replace the legislature.",
    guardianNegative:
      "Look at Article I first. When binding national rules appear with no statute behind them, separation of powers is in play.",
  },
  {
    id: "constitution-separation-powers",
    amendment: "Art. III",
    amendmentLabel: "Article III — Judiciary",
    sourceDocument: "U.S. Constitution — Article III",
    title: "Executive Reversal of Final Judgment",
    situation:
      "A federal court orders a detained journalist released. After the court's final judgment, the executive branch tells field officers to ignore the order and keep the person detained while an internal review runs.",
    question: "Which part of the Constitution is most directly broken?",
    choices: [
      {
        id: "a",
        label: "Courts decide cases, and the executive must obey valid court orders",
      },
      {
        id: "b",
        label: "The Second Amendment protects the right to bear arms in courtrooms",
      },
      {
        id: "c",
        label: "The Tenth Amendment reserves all powers to the states",
      },
      {
        id: "d",
        label: "The Nineteenth Amendment guarantees women's right to vote",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Article III puts judicial power in the courts. Article II requires the President to 'faithfully execute' the laws. Ignoring final court orders breaks the separation between judging a case and enforcing the law.",
    modernImplication:
      "Detention disputes, immigration holds, and emergency orders still raise the same question: does executive power stop at the courthouse door? Courts mean little if enforcement can simply ignore them.",
    guardianPositive:
      "Right. Courts decide cases; the executive must obey lawful judgments. That is the architecture of a republic.",
    guardianNegative:
      "Separation of powers is not decorative. When enforcement ignores final orders, you are outside constitutional government.",
  },
  {
    id: "first-amendment",
    amendment: "1st",
    amendmentLabel: "First Amendment",
    title: "Permit Denied",
    situation:
      "A city grants parade permits to veterans' groups and charity walks, but denies a permit to activists protesting local zoning policy. Officials say the protest would slow traffic, even though similar traffic delays were accepted for other events.",
    question: "What is the main constitutional problem?",
    choices: [
      {
        id: "a",
        label: "The government is treating this protest unfairly because of its message",
      },
      {
        id: "b",
        label: "The Second Amendment protects the right to bear arms in public",
      },
      {
        id: "c",
        label: "The Fifth Amendment protects against double jeopardy",
      },
      {
        id: "d",
        label: "The Fifth Amendment protects against self-incrimination",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The First Amendment was ratified in 1791 to protect political dissent from government control. In cases like Hague v. CIO (1939), courts held that government may set neutral time, place, and manner rules — but cannot block speech because officials dislike the message.",
    modernImplication:
      "Permit systems are common for protests and public events. When enforcement tracks ideology instead of neutral safety rules, courts often strike the policy down. Knowing this line helps citizens challenge selective censorship before it becomes normal.",
    guardianPositive:
      "You saw the core issue: government cannot silence a message it dislikes. That is the line the First Amendment draws.",
    guardianNegative:
      "Look past the traffic excuse. When permits track the message, speech is not free — it is licensed by power.",
  },
  {
    id: "second-amendment",
    amendment: "2nd",
    amendmentLabel: "Second Amendment",
    title: "Total Handgun Ban",
    situation:
      "A state makes it a felony to possess any working handgun inside a private home, with no exception for self-defense. Police begin confiscating registered firearms from homeowners.",
    question: "What is the strongest challenge to this law?",
    choices: [
      {
        id: "a",
        label: "It violates the Sixth Amendment right to a lawyer",
      },
      {
        id: "b",
        label: "It violates the right to keep arms for lawful self-defense in the home",
      },
      {
        id: "c",
        label: "It violates the Eighth Amendment ban on cruel punishment",
      },
      {
        id: "d",
        label: "It violates the Fourth Amendment only if police lack a warrant",
      },
    ],
    correctChoiceId: "b",
    historicalContext:
      "District of Columbia v. Heller (2008) recognized an individual Second Amendment right to possess firearms for lawful purposes such as self-defense in the home. McDonald v. City of Chicago (2010) applied that right against state and local governments through the Fourteenth Amendment.",
    modernImplication:
      "Gun regulation debates still turn on whether rules fit Heller's core holding. Total bans on common self-defense weapons in the home face steep constitutional barriers, while licensing, safety, and carry rules are fought case by case.",
    guardianPositive:
      "Correct. The Second Amendment protects an individual right — especially at home, where defense of life begins.",
    guardianNegative:
      "This is not a warrant question. The law itself crosses the line by banning lawful self-defense in the home.",
  },
  {
    id: "fourth-amendment",
    amendment: "4th",
    amendmentLabel: "Fourth Amendment",
    title: "Phone Search at the Curb",
    situation:
      "During a routine traffic stop, an officer takes a driver's smartphone and scrolls through text messages and photos without the driver's consent. The officer finds evidence of unrelated crimes. No warrant is obtained.",
    question: "Can the officer search the phone without a warrant?",
    choices: [
      {
        id: "a",
        label: "Yes — because the phone was in the car during the stop",
      },
      {
        id: "b",
        label: "Yes — if the officer later writes a report explaining probable cause",
      },
      {
        id: "c",
        label: "No — police usually need a warrant to search a phone",
      },
      {
        id: "d",
        label: "Yes — because traffic stops are always emergencies",
      },
    ],
    correctChoiceId: "c",
    historicalContext:
      "The Fourth Amendment grew from colonial resistance to general warrants. In Riley v. California (2014), the Supreme Court held that searching a cellphone usually requires a warrant because phones hold vast private information unlike a physical pocket or wallet.",
    modernImplication:
      "Your phone holds messages, photos, banking, and location data in one place. Warrant rules for digital searches shape policing, evidence rules, and what citizens can demand when officers go beyond a lawful stop.",
    guardianPositive:
      "Well defended. A traffic stop does not open every door on your phone. Riley drew that line.",
    guardianNegative:
      "A traffic stop does not open every door. Search the phone, get a warrant.",
  },
  {
    id: "fifth-amendment",
    amendment: "5th",
    amendmentLabel: "Fifth Amendment",
    title: "Property Taken, No Hearing",
    situation:
      "A federal agency freezes a small business owner's bank accounts and labels the business a fraud risk based on a confidential informant. The owner gets no hearing and no chance to respond before the accounts are emptied and the business collapses.",
    question: "Which Fifth Amendment right is most clearly violated?",
    choices: [
      {
        id: "a",
        label: "Due process — fair procedures before the government takes property",
      },
      {
        id: "b",
        label: "The right to a jury trial in all civil disputes",
      },
      {
        id: "c",
        label: "Protection against quartering soldiers in peacetime",
      },
      {
        id: "d",
        label: "The right to confront witnesses at trial only",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The Fifth Amendment's Due Process Clause reflects the promise that life, liberty, and property cannot be taken by arbitrary command. Cases like Mathews v. Eldridge (1976) require fair procedures before the government destroys a person's livelihood.",
    modernImplication:
      "Asset forfeiture, account freezes, and administrative penalties can ruin families overnight. Due process is the brake that forces government to prove its case with notice and a real chance to be heard — not a sealed accusation.",
    guardianPositive:
      "You held the line on due process. No hearing, no fairness — that is not constitutional order.",
    guardianNegative:
      "Property can be taken, but not in silence. Due process is the hearing before the hammer falls.",
  },
  {
    id: "sixth-amendment",
    amendment: "6th",
    amendmentLabel: "Sixth Amendment",
    title: "Eighteen Months in Limbo",
    situation:
      "A defendant is arrested on felony charges and cannot afford a lawyer. The defendant asks for a lawyer at arraignment. The court schedules trial eighteen months later. The defendant stays in jail, and no lawyer is ever appointed to investigate the case.",
    question: "Which rights are most clearly violated?",
    choices: [
      {
        id: "a",
        label: "Only the Eighth Amendment ban on excessive fines",
      },
      {
        id: "b",
        label: "The right to a lawyer and the right to a speedy trial",
      },
      {
        id: "c",
        label: "The Third Amendment protection against quartering troops",
      },
      {
        id: "d",
        label: "The Second Amendment right to armed self-representation",
      },
    ],
    correctChoiceId: "b",
    historicalContext:
      "The Sixth Amendment guarantees a lawyer in criminal cases and a speedy public trial. Gideon v. Wainwright (1963) made counsel a constitutional necessity for defendants who cannot afford one. Barker v. Wingo (1972) set standards courts use to judge unreasonable delay.",
    modernImplication:
      "Crowded courts and cash bail still trap people in jail for months or years before trial. The Sixth Amendment is the citizen's demand for a lawyer who fights and a trial that comes — before liberty erodes by default.",
    guardianPositive:
      "Exactly. A lawyer and a timely trial are not luxuries — they are the Sixth Amendment's shield against indefinite state power.",
    guardianNegative:
      "Eighteen months without a lawyer is not justice delayed — it is justice denied. The Sixth Amendment exists to stop that.",
  },
  {
    id: "fourteenth-amendment",
    amendment: "14th",
    amendmentLabel: "Fourteenth Amendment",
    title: "Unequal Burden",
    situation:
      "A state law requires voters in one urban county to show four forms of ID and pay a processing fee. Voters in rural counties need only one free ID. Lawmakers say the rule prevents fraud, but records show no real fraud difference between the regions.",
    question: "Which Fourteenth Amendment idea best describes the problem?",
    choices: [
      {
        id: "a",
        label: "Equal Protection — laws cannot place unfair unequal burdens on similar groups without good reason",
      },
      {
        id: "b",
        label: "Takings Clause — all voting fees are automatically unconstitutional",
      },
      {
        id: "c",
        label: "Commerce Clause — states may never regulate elections",
      },
      {
        id: "d",
        label: "Second Amendment — ID requirements infringe the right to bear arms",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Ratified after the Civil War, the Fourteenth Amendment's Equal Protection Clause forbids states from denying equal treatment under law. Cases like Harper v. Virginia Board of Elections (1966) struck down poll taxes. Courts examine whether voting burdens fall unevenly without a strong justification.",
    modernImplication:
      "Voting rules, school funding, policing, and licensing still raise equal-protection questions. The Fourteenth Amendment is the national standard that state power cannot use geography, race, or class to make rights real for some and theoretical for others.",
    guardianPositive:
      "Strong read. Equal Protection demands more than a slogan — it requires real parity and a justified reason when parity breaks.",
    guardianNegative:
      "Different counties, different burdens, thin justification — that is an Equal Protection problem. Follow the unequal weight.",
  },
];

/** @deprecated Use STATIC_SCENARIOS or dynamic session scenarios */
export const scenarios = STATIC_SCENARIOS;

export const POINTS_PER_CORRECT = 80;

const DIFFICULTY_SCENARIO_MAP: Record<ScenarioDifficulty, string[]> = {
  easy: [
    "declaration-consent",
    "declaration-natural-rights",
    "constitution-enumerated-powers",
    "first-amendment",
    "second-amendment",
    "fourth-amendment",
    "fifth-amendment",
  ],
  medium: [
    "constitution-enumerated-powers",
    "constitution-separation-powers",
    "fourth-amendment",
    "fifth-amendment",
    "sixth-amendment",
    "fourteenth-amendment",
  ],
  hard: [
    "declaration-consent",
    "constitution-separation-powers",
    "first-amendment",
    "fourth-amendment",
    "sixth-amendment",
    "fourteenth-amendment",
  ],
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function findStaticMatchForTopic(assignment: TopicAssignment): Scenario {
  const label = assignment.amendmentLabel.toLowerCase();
  const topicId = assignment.topicId.toLowerCase();

  const match =
    STATIC_SCENARIOS.find((scenario) => {
      const scenarioLabel = scenario.amendmentLabel.toLowerCase();
      const scenarioId = scenario.id.toLowerCase();
      return (
        topicId.includes(scenarioId) ||
        scenarioId.includes(topicId.split("-").slice(0, 2).join("-")) ||
        label.includes(scenarioLabel) ||
        scenarioLabel.includes(label) ||
        assignment.amendment === scenario.amendment
      );
    }) ?? STATIC_SCENARIOS[0];

  return match;
}

export function buildFallbackSession({
  size,
  difficulty,
  weakAreas = [],
  excludeIds = [],
  topicAssignments = [],
}: {
  size: number;
  difficulty: ScenarioDifficulty;
  weakAreas?: string[];
  excludeIds?: string[];
  topicAssignments?: TopicAssignment[];
}): Scenario[] {
  if (topicAssignments.length > 0) {
    return topicAssignments.slice(0, size).map((assignment, index) => {
      const base = findStaticMatchForTopic(assignment);
      const id = `fallback-${assignment.topicId}-${Date.now()}-${index}`;
      return shuffleScenarioChoices({
        ...base,
        id,
        amendment: assignment.amendment,
        amendmentLabel: assignment.amendmentLabel,
        sourceDocument: assignment.sourceDocument,
        questionFormat: assignment.questionFormat,
        title: assignment.label,
        situation: base.situation,
        difficulty,
        generated: false,
      });
    });
  }
  const preferredIds = new Set(DIFFICULTY_SCENARIO_MAP[difficulty]);
  const excluded = new Set(excludeIds);

  const weakMatchers = weakAreas.map((area) => area.toLowerCase());

  const pool = STATIC_SCENARIOS.filter((scenario) => !excluded.has(scenario.id));

  const prioritized = shuffle(
    pool.filter((scenario) => {
      if (!preferredIds.has(scenario.id)) return false;
      return weakMatchers.some(
        (weak) =>
          scenario.amendmentLabel.toLowerCase().includes(weak) ||
          weak.includes(scenario.amendmentLabel.toLowerCase())
      );
    })
  );

  const secondary = shuffle(
    pool.filter(
      (scenario) =>
        preferredIds.has(scenario.id) &&
        !prioritized.some((item) => item.id === scenario.id)
    )
  );

  const remainder = shuffle(
    pool.filter(
      (scenario) =>
        !preferredIds.has(scenario.id) &&
        !prioritized.some((item) => item.id === scenario.id) &&
        !secondary.some((item) => item.id === scenario.id)
    )
  );

  return [...prioritized, ...secondary, ...remainder]
    .slice(0, size)
    .map((scenario) => {
      const id = `fallback-${scenario.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return shuffleScenarioChoices({
        ...scenario,
        id,
        difficulty,
        generated: false,
      });
    });
}