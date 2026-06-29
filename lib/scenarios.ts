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
      "A county imposes a new annual fee on every household to fund a regional authority. Residents protest that they never voted on the fee and have no elected representative on the authority board, yet failure to pay triggers liens on homes.",
    question: "Which founding principle most directly challenges this arrangement?",
    choices: [
      {
        id: "a",
        label: "Governments derive just powers from the consent of the governed",
      },
      {
        id: "b",
        label: "The Third Amendment bars quartering soldiers in private homes",
      },
      {
        id: "c",
        label: "The Seventh Amendment guarantees a civil jury in every dispute",
      },
      {
        id: "d",
        label: "The Necessary and Proper Clause authorizes any fee Congress imagines",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The Declaration of Independence holds that governments are instituted to secure rights and derive 'just powers from the consent of the governed.' Colonial grievances over taxation without representation were central to the break with Britain.",
    modernImplication:
      "Fees, mandates, and regional boards still raise the question of who consented to be governed and by what process. Representation remains the first check on arbitrary power.",
    guardianPositive:
      "You traced the line to its source: power without consent is the problem the Declaration named first.",
    guardianNegative:
      "Follow the consent thread. When people are bound by law they did not authorize, the Declaration's standard lights up.",
  },
  {
    id: "declaration-natural-rights",
    amendment: "Declaration",
    amendmentLabel: "Declaration — Natural Rights",
    sourceDocument: "Declaration of Independence",
    title: "License to Speak",
    situation:
      "A town requires bloggers and podcasters to obtain a 'civic commentary license' before publishing criticism of local officials. Officials say the rule promotes civility and reduces misinformation.",
    question: "Which Declaration-era principle is most directly threatened?",
    choices: [
      {
        id: "a",
        label: "Unalienable rights exist before government and cannot be licensed away",
      },
      {
        id: "b",
        label: "Only the Second Amendment protects pre-government rights",
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
      "The Declaration's self-evident truths hold that people are 'endowed by their Creator with certain unalienable Rights' including Liberty. Rights precede government; they are not privileges dispensed by officials.",
    modernImplication:
      "Permit schemes for speech, assembly, or conscience still test whether liberty is a right or a grant from power. The Declaration sets the baseline: government secures rights — it does not invent them.",
    guardianPositive:
      "Correct. Liberty is not a license stamped by the town clerk. The creed still governs.",
    guardianNegative:
      "Rights precede government. When officials must approve criticism, you are not looking at liberty — you are looking at permission.",
  },
  {
    id: "constitution-enumerated-powers",
    amendment: "Art. I",
    amendmentLabel: "Article I — Congress",
    sourceDocument: "U.S. Constitution — Article I",
    title: "Agency Rule, No Statute",
    situation:
      "A federal agency issues a nationwide rule banning a category of home appliances without a vote in Congress. The agency cites a broad 'public welfare' memo, but no statute specifically authorizes the ban.",
    question: "What is the strongest structural constitutional objection?",
    choices: [
      {
        id: "a",
        label: "Legislative power is vested in Congress — the agency cannot make binding law without authorization",
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
        label: "The Preamble alone grants agencies unlimited welfare power",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Article I, Section 1 vests 'all legislative Powers' in Congress. Article I, Section 8 enumerates federal powers; agencies may execute law but cannot replace Congress as lawmaker.",
    modernImplication:
      "Rulemaking, emergency orders, and administrative penalties constantly test whether Congress still makes law or merely ratifies agency will. Article I is the line between republican government and rule by bureaucracy.",
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
      "After a federal court enters a final judgment freeing a detained journalist, the executive branch issues a directive instructing field officers to ignore the order and keep the detention in place pending an internal review.",
    question: "Which constitutional design is most directly violated?",
    choices: [
      {
        id: "a",
        label: "Judicial power and the executive duty to faithfully execute valid court orders",
      },
      {
        id: "b",
        label: "The Second Amendment right to bear arms in courtrooms",
      },
      {
        id: "c",
        label: "The Tenth Amendment reservation of all powers to the states",
      },
      {
        id: "d",
        label: "The Nineteenth Amendment guarantee of women's suffrage",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Article III vests judicial power in the courts; Article II requires the President to 'faithfully execute' the laws. Ignoring final judgments collapses the separation between judging and enforcing.",
    modernImplication:
      "Detention disputes, immigration holds, and emergency decrees still ask whether executive power stops at the courthouse door. Independent judgment means nothing if enforcement can nullify it.",
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
      "A city grants parade permits to veterans' groups and charity walks, but denies a permit to activists protesting local zoning policy. Officials say the protest would cause traffic delays, though similar delays were accepted for other events.",
    question: "Which constitutional principle is most directly at stake?",
    choices: [
      {
        id: "a",
        label: "Viewpoint discrimination in speech and assembly",
      },
      {
        id: "b",
        label: "The right to bear arms in public spaces",
      },
      {
        id: "c",
        label: "Protection against double jeopardy",
      },
      {
        id: "d",
        label: "The privilege against self-incrimination",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "The First Amendment was ratified in 1791 to shield political dissent from government control. In cases like Hague v. CIO (1939) and later forum-access rulings, courts held that government may regulate time, place, and manner — but not suppress speech because officials dislike the message.",
    modernImplication:
      "Permit systems remain common for protests and public events. When enforcement tracks ideology instead of neutral safety rules, courts often strike the policy down. Knowing this line helps citizens challenge selective censorship before it becomes normalized.",
    guardianPositive:
      "You saw the core issue: government cannot silence a message it dislikes. That is the line the First Amendment draws.",
    guardianNegative:
      "Look past the traffic excuse. When permits track viewpoint, speech is not free — it is licensed by power.",
  },
  {
    id: "second-amendment",
    amendment: "2nd",
    amendmentLabel: "Second Amendment",
    title: "Total Handgun Ban",
    situation:
      "A state passes a law making it a felony to possess any functional handgun inside a private residence, with no exception for self-defense. Police begin confiscating registered firearms from homeowners.",
    question: "What is the strongest constitutional challenge to this law?",
    choices: [
      {
        id: "a",
        label: "It violates the Sixth Amendment right to counsel",
      },
      {
        id: "b",
        label: "It violates the individual right to keep arms for lawful self-defense in the home",
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
      "Gun regulation debates still turn on whether rules are consistent with Heller's core holding. Total bans on common self-defense weapons in the home face steep constitutional barriers, while licensing, safety, and carry restrictions are fought case by case.",
    guardianPositive:
      "Correct. The Second Amendment protects an individual right — especially at the hearth, where defense of life begins.",
    guardianNegative:
      "This is not a warrant question. The law itself crosses the line by banning lawful self-defense in the home.",
  },
  {
    id: "fourth-amendment",
    amendment: "4th",
    amendmentLabel: "Fourth Amendment",
    title: "Phone Search at the Curb",
    situation:
      "After a routine traffic stop, an officer seizes a driver's smartphone, scrolls through text messages and photos without consent, and finds evidence of unrelated crimes. No warrant is obtained.",
    question: "Under modern Fourth Amendment doctrine, this search is most likely:",
    choices: [
      {
        id: "a",
        label: "Valid because the phone was in the car during the stop",
      },
      {
        id: "b",
        label: "Valid if the officer later writes a report explaining probable cause",
      },
      {
        id: "c",
        label: "Invalid — digital devices generally require a warrant absent urgent exigency",
      },
      {
        id: "d",
        label: "Valid because traffic stops are automatically exigent circumstances",
      },
    ],
    correctChoiceId: "c",
    historicalContext:
      "The Fourth Amendment grew from colonial resistance to general warrants. In Riley v. California (2014), the Supreme Court held that searching a cellphone incident to arrest usually requires a warrant because phones hold vast private archives unlike physical pockets.",
    modernImplication:
      "Your phone is a diary, bank, and location tracker in one device. Warrant requirements for digital searches shape policing, evidence rules, and what citizens can demand when officers push beyond a lawful stop.",
    guardianPositive:
      "Well defended. A pocket is not a portal. Digital life demands a warrant before the state walks through it.",
    guardianNegative:
      "A traffic stop does not open every door. Riley drew the line: search the phone, get a warrant.",
  },
  {
    id: "fifth-amendment",
    amendment: "5th",
    amendmentLabel: "Fifth Amendment",
    title: "Property Taken, No Hearing",
    situation:
      "A federal agency freezes a small business owner's bank accounts and labels the business a fraud risk based on a confidential informant. The owner receives no hearing and no chance to respond before the accounts are emptied and the business collapses.",
    question: "Which Fifth Amendment principle is most directly violated?",
    choices: [
      {
        id: "a",
        label: "Due process before depriving a person of property",
      },
      {
        id: "b",
        label: "The right to a public trial by jury in all civil disputes",
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
      "The Fifth Amendment's Due Process Clause reflects Magna Carta's promise that life, liberty, and property cannot be taken by arbitrary command. Mathews v. Eldridge (1976) and related cases require fair procedures tailored to what is at stake before the government destroys a person's livelihood.",
    modernImplication:
      "Asset forfeiture, account freezes, and administrative penalties can ruin families overnight. Due process is the brake that forces government to prove its case through notice and a meaningful chance to be heard — not a sealed accusation.",
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
      "A defendant is arrested on felony charges, cannot afford counsel, and requests a lawyer at arraignment. The court schedules trial eighteen months later. The defendant remains jailed without counsel ever being appointed to investigate the case.",
    question: "Which rights are most clearly implicated?",
    choices: [
      {
        id: "a",
        label: "Only the Eighth Amendment ban on excessive fines",
      },
      {
        id: "b",
        label: "The right to counsel and the right to a speedy trial",
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
      "The Sixth Amendment guarantees counsel in criminal prosecutions and a speedy public trial. Gideon v. Wainwright (1963) made counsel a constitutional necessity for indigent defendants, while Barker v. Wingo (1972) set factors courts use to judge unreasonable delay.",
    modernImplication:
      "Backlogged courts and cash bail systems still trap people in pre-trial detention for months or years. The Sixth Amendment is the citizen's demand for a lawyer who fights and a trial that comes — before liberty erodes by default.",
    guardianPositive:
      "Exactly. Counsel and speed are not luxuries — they are the Sixth Amendment's shield against indefinite state power.",
    guardianNegative:
      "Eighteen months without a lawyer is not justice delayed — it is justice denied. The Sixth Amendment exists to stop that.",
  },
  {
    id: "fourteenth-amendment",
    amendment: "14th",
    amendmentLabel: "Fourteenth Amendment",
    title: "Unequal Burden",
    situation:
      "A state law requires voters in one urban county to present four forms of identification and pay a processing fee, while voters in rural counties need only one free ID. Lawmakers say the rule prevents fraud, but evidence shows no meaningful fraud difference between regions.",
    question: "Which Fourteenth Amendment doctrine best frames the challenge?",
    choices: [
      {
        id: "a",
        label: "Equal Protection — laws must not impose unjustified unequal burdens on similarly situated people",
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
        label: "Second Amendment — ID requirements infringe bearing arms",
      },
    ],
    correctChoiceId: "a",
    historicalContext:
      "Ratified after the Civil War, the Fourteenth Amendment's Equal Protection Clause forbids states from denying equal treatment under law. Voting cases such as Harper v. Virginia Board of Elections (1966) struck poll taxes, and modern equal-protection analysis examines whether burdens fall unevenly without sufficient justification.",
    modernImplication:
      "Voting rules, school funding, policing, and licensing still raise equal-protection questions. The Fourteenth Amendment is the national standard that state power cannot weaponize geography, race, or class to make rights real for some and theoretical for others.",
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
      return {
        ...base,
        id: `fallback-${assignment.topicId}-${Date.now()}-${index}`,
        amendment: assignment.amendment,
        amendmentLabel: assignment.amendmentLabel,
        sourceDocument: assignment.sourceDocument,
        questionFormat: assignment.questionFormat,
        title: `${assignment.label}`,
        situation: `At ${assignment.settingHint}, a new situation tests ${assignment.principles.join(", ")}. ${base.situation}`,
        difficulty,
        generated: false,
      };
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
    .map((scenario) => ({
      ...scenario,
      id: `fallback-${scenario.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      difficulty,
      generated: false,
    }));
}