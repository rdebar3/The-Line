export const REPUBLIC_SIMULATOR_SCENARIO_ID = "national-bank-debate";

export type RepublicSimulatorRole = {
  id: string;
  name: string;
  title: string;
  description: string;
  perspective: string;
};

export type RepublicSimulatorChoice = {
  id: string;
  label: string;
  summary: string;
  fidelityScore: number;
  madisonAlignment: "strong" | "moderate" | "weak" | "opposed";
};

export type RepublicSimulatorDecision = {
  id: string;
  title: string;
  situation: string;
  choices: RepublicSimulatorChoice[];
  historicalContext: string;
};

export type RepublicSimulatorScenario = {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  summary: string;
  decisions: RepublicSimulatorDecision[];
};

export type RepublicSimulatorChoiceRecord = {
  decisionId: string;
  decisionTitle: string;
  choiceId: string;
  choiceLabel: string;
  fidelityScore: number;
};

export type RepublicSimulatorKeyMoment = {
  id: string;
  title: string;
  passageText: string;
  subtitle: string;
};

export type RepublicSimulatorCompletionRecord = {
  scenarioId: string;
  roleId: string;
  fidelityScore: number;
  pointsEarned: number;
  completedAt: string;
};

export const REPUBLIC_SIMULATOR_ROLES: RepublicSimulatorRole[] = [
  {
    id: "madison",
    name: "James Madison",
    title: "Member of the House of Representatives",
    description:
      "You serve in the First Congress as the Constitution's principal architect — now forced to decide whether Hamilton's financial system fits the republic you helped design.",
    perspective: "Virginia · strict construction · republican government",
  },
  {
    id: "virginia-delegate",
    name: "Virginia Delegate",
    title: "Congressional Delegate from Virginia",
    description:
      "You represent agrarian constituents wary of consolidated federal power. Madison's arguments echo in your caucus, but Hamilton's allies control the Treasury.",
    perspective: "State interests · anti-consolidation · commercial skepticism",
  },
];

export const NATIONAL_BANK_DEBATE: RepublicSimulatorScenario = {
  id: REPUBLIC_SIMULATOR_SCENARIO_ID,
  title: "The National Bank Debate",
  subtitle: "Hamilton vs Madison · 1790–1791",
  era: "First Congress",
  summary:
    "Secretary Hamilton proposes a national bank to stabilize credit and fund the new government. Madison must decide whether implied powers justify the charter — or whether the republic's limits are being rewritten in Philadelphia's shadow.",
  decisions: [
    {
      id: "proposal-arrives",
      title: "Hamilton's Proposal Lands",
      situation:
        "December 1790. Hamilton submits his report on a national bank: a chartered corporation with $10 million capital, federal deposits, and notes circulating as currency. Treasury allies call it indispensable. Virginia planters call it a British-style engine of corruption.",
      historicalContext:
        "Hamilton's Report on a National Bank (December 1790) followed his assumption and funding plans. The proposal sparked the first major constitutional clash of the new government.",
      choices: [
        {
          id: "oppose-unenumerated",
          label: "Oppose — no enumerated power to charter corporations",
          summary:
            "Congress may borrow and coin money, but creating a bank exceeds the powers delegated in Article I.",
          fidelityScore: 95,
          madisonAlignment: "strong",
        },
        {
          id: "delay-state-input",
          label: "Delay the vote — seek counsel from state legislatures",
          summary:
            "The Constitution's silence should caution Congress until the states weigh in on this novel power.",
          fidelityScore: 78,
          madisonAlignment: "moderate",
        },
        {
          id: "support-strict-charter",
          label: "Support only with a narrow, time-limited charter",
          summary:
            "A tightly cabined bank might be tolerated if Congress refuses open-ended corporate authority.",
          fidelityScore: 52,
          madisonAlignment: "weak",
        },
        {
          id: "support-hamilton",
          label: "Support Hamilton — national credit requires bold instruments",
          summary:
            "A vigorous federal government needs flexible tools to secure the Union's finances.",
          fidelityScore: 18,
          madisonAlignment: "opposed",
        },
      ],
    },
    {
      id: "necessary-proper",
      title: "The Necessary and Proper Clause",
      situation:
        "Hamilton's allies invoke Article I, Section 8: Congress may make all laws \"necessary and proper\" for executing its powers. They argue a bank is the ordinary means of collecting taxes, paying debts, and regulating commerce.",
      historicalContext:
        "The necessary and proper clause became the central battlefield. Madison would later warn in print that broad construction swallowed enumerated limits.",
      choices: [
        {
          id: "reject-broad-construction",
          label: "Reject broad construction — \"necessary\" means indispensable, not convenient",
          summary:
            "If every convenient means is \"necessary,\" the enumeration of powers becomes a dead letter.",
          fidelityScore: 92,
          madisonAlignment: "strong",
        },
        {
          id: "demand-amendment",
          label: "Propose a constitutional amendment authorizing a bank",
          summary:
            "If the people want a bank, let them amend the Constitution rather than infer new powers.",
          fidelityScore: 85,
          madisonAlignment: "strong",
        },
        {
          id: "accept-incidental",
          label: "Accept incidental powers only for executing listed functions",
          summary:
            "A bank might pass only if each linked power can be named without inventing new ones.",
          fidelityScore: 68,
          madisonAlignment: "moderate",
        },
        {
          id: "accept-hamilton-reading",
          label: "Accept Hamilton's reading — means and ends together",
          summary:
            "National survival requires interpreting powers with the energy the age demands.",
          fidelityScore: 22,
          madisonAlignment: "opposed",
        },
      ],
    },
    {
      id: "commercial-republic",
      title: "Commercial Interest vs Republican Government",
      situation:
        "Philadelphia merchants and New York financiers pack the galleries. Critics warn that a national bank concentrates wealth, rewards speculators who bought discounted war debt, and bends the republic toward a moneyed aristocracy.",
      historicalContext:
        "Madison and Jefferson feared the bank would align federal policy with commercial elites and alienate agrarian states.",
      choices: [
        {
          id: "warn-aristocracy",
          label: "Warn that the bank breeds a monied aristocracy hostile to republican equality",
          summary:
            "Public credit must not become private profit for the few who captured federal favor.",
          fidelityScore: 90,
          madisonAlignment: "strong",
        },
        {
          id: "demand-geographic-balance",
          label: "Insist on branches and terms that protect agrarian states",
          summary:
            "If a bank is inevitable, its charter must not concentrate power solely in northern cities.",
          fidelityScore: 72,
          madisonAlignment: "moderate",
        },
        {
          id: "accept-tradeoffs",
          label: "Accept commercial growth as the price of a stable Union",
          summary:
            "A republic still needs credit markets if it is to survive among European powers.",
          fidelityScore: 38,
          madisonAlignment: "weak",
        },
        {
          id: "embrace-finance",
          label: "Embrace finance as the engine of national greatness",
          summary:
            "Hamilton's system will transform America into a commercial empire.",
          fidelityScore: 12,
          madisonAlignment: "opposed",
        },
      ],
    },
    {
      id: "washington-counsel",
      title: "Washington Requests Your Counsel",
      situation:
        "President Washington asks for your private judgment before he decides whether to sign the bill. Hamilton and Jefferson have each submitted competing constitutional memos. Your words may decide whether the veto pen moves.",
      historicalContext:
        "Washington solicited opinions from both cabinet rivals in February 1791. Madison's counsel reinforced Jefferson's strict-construction argument.",
      choices: [
        {
          id: "urge-veto",
          label: "Urge a veto — the bill exceeds congressional authority",
          summary:
            "A presidential veto would defend the Constitution's limits against legislative overreach.",
          fidelityScore: 94,
          madisonAlignment: "strong",
        },
        {
          id: "sign-with-reservations",
          label: "Advise signing with a written reservation on implied powers",
          summary:
            "If he signs, Washington should warn that this precedent must not expand federal authority further.",
          fidelityScore: 70,
          madisonAlignment: "moderate",
        },
        {
          id: "defer-to-congress",
          label: "Defer to Congress — the legislature judged the matter",
          summary:
            "The first Congress sat near the Convention; its judgment deserves presidential respect.",
          fidelityScore: 45,
          madisonAlignment: "weak",
        },
        {
          id: "support-signature",
          label: "Support signature — unity requires backing Hamilton's system",
          summary:
            "A veto would shatter the administration and invite financial chaos.",
          fidelityScore: 15,
          madisonAlignment: "opposed",
        },
      ],
    },
    {
      id: "final-vote",
      title: "The Final Vote in the House",
      situation:
        "February 1791. The bank bill reaches its decisive vote. Northeastern votes lean yes; Virginia and the South divide. Your speech may be the last chance to frame the Constitution's meaning for this generation.",
      historicalContext:
        "The House passed the bank bill in February 1791; Washington signed it on February 25, 1791, after siding with Hamilton's constitutional view.",
      choices: [
        {
          id: "floor-opposition",
          label: "Lead floor opposition — publish the strict-construction case",
          summary:
            "Future congresses will cite this day; the record must show that limits were defended.",
          fidelityScore: 96,
          madisonAlignment: "strong",
        },
        {
          id: "oppose-then-document",
          label: "Vote no, then publish essays for the public record",
          summary:
            "Congress may prevail, but the people must understand the constitutional danger.",
          fidelityScore: 88,
          madisonAlignment: "strong",
        },
        {
          id: "abstain-protest",
          label: "Abstain in protest — the process was rushed",
          summary:
            "Refuse to legitimize a vote taken without adequate constitutional deliberation.",
          fidelityScore: 55,
          madisonAlignment: "weak",
        },
        {
          id: "vote-yes",
          label: "Vote yes — national stability outweighs abstract fears",
          summary:
            "The republic cannot afford another financial collapse over parchment disputes.",
          fidelityScore: 10,
          madisonAlignment: "opposed",
        },
      ],
    },
  ],
};

export const REPUBLIC_SIMULATOR_SCENARIOS = [NATIONAL_BANK_DEBATE] as const;

export function getRepublicSimulatorScenario(id: string) {
  return REPUBLIC_SIMULATOR_SCENARIOS.find((scenario) => scenario.id === id);
}

export function getRepublicSimulatorRole(id: string) {
  return REPUBLIC_SIMULATOR_ROLES.find((role) => role.id === id);
}

export function getChoiceById(
  scenario: RepublicSimulatorScenario,
  decisionId: string,
  choiceId: string
): RepublicSimulatorChoice | undefined {
  const decision = scenario.decisions.find((item) => item.id === decisionId);
  return decision?.choices.find((choice) => choice.id === choiceId);
}

export function calculateFidelityScore(records: RepublicSimulatorChoiceRecord[]) {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + record.fidelityScore, 0);
  return Math.round(total / records.length);
}

export function calculateDefenderScoreAward(fidelityScore: number) {
  return Math.round(120 + fidelityScore * 1.8);
}

export function getFidelityGrade(score: number) {
  if (score >= 90) return { label: "Founding Fidelity", tone: "gold" as const };
  if (score >= 75) return { label: "Republican Judgment", tone: "blue" as const };
  if (score >= 55) return { label: "Mixed Record", tone: "muted" as const };
  return { label: "Departed from History", tone: "crimson" as const };
}

export function buildKeyMoments(
  records: RepublicSimulatorChoiceRecord[],
  outcomes: Array<{ constitutionalAnalysis: string }>
): RepublicSimulatorKeyMoment[] {
  return records.map((record, index) => ({
    id: `${record.decisionId}:${record.choiceId}`,
    title: record.decisionTitle,
    passageText: outcomes[index]?.constitutionalAnalysis ?? record.choiceLabel,
    subtitle: `Your choice: ${record.choiceLabel}`,
  }));
}