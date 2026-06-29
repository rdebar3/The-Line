import type { FoundingDocument } from "@/lib/documents/types";

export const constitutionDocument: FoundingDocument = {
  slug: "constitution",
  title: "The Constitution",
  subtitle: "The framework of limited government, separated powers, and ordered liberty.",
  year: "1787",
  accent: "blue",
  passages: [
    {
      id: "preamble",
      section: "Preamble",
      text: "We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.",
      explanation:
        "The Preamble states who acts (the people), why they act (six purposes), and what they create (the Constitution). It is not a grant of power to government but a statement of popular authorship and national aims.",
      historicalContext:
        "Drafted in Philadelphia during the summer of 1787 and ratified by state conventions through 1788, the Constitution replaced the weaker Articles of Confederation. 'We the People' asserted national legitimacy flowing from citizens rather than sovereign states alone.",
      modernRelevance:
        "Courts and lawmakers invoke the Preamble's purposes when debating federal authority, national security, and individual liberty. It reminds Americans that the system's end is ordered freedom — not power for its own sake.",
    },
    {
      id: "article-i-section-1",
      section: "Article I, Section 1",
      text: "All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.",
      explanation:
        "Lawmaking power is assigned to one institution and one institution only at the federal level. Congress cannot delegate its core legislative authority away without constitutional limits.",
      historicalContext:
        "The Framers separated legislative power from executive and judicial power after seeing colonial governors and British ministries blur those lines. Article I opens the longest article because Congress was viewed as the primary threat to liberty if unchecked.",
      modernRelevance:
        "Debates over executive orders, agency rulemaking, and emergency decrees often ask whether Congress still makes law or merely ratifies decisions made elsewhere. This sentence is the starting point for every separation-of-powers fight.",
    },
    {
      id: "article-i-section-8",
      section: "Article I, Section 8",
      text: "The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States… To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes… To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers.",
      explanation:
        "Congress receives enumerated powers — taxation, defense, commerce, and more — plus the Necessary and Proper Clause to execute them. Federal authority is broad in scope but still bounded by enumeration and later by the Bill of Rights.",
      historicalContext:
        "Section 8 was the practical engine of the new government: revenue, armies, postal roads, patents, courts, and interstate commerce. The Commerce and Necessary and Proper Clauses became the main axes of expansion in federal power over the next two centuries.",
      modernRelevance:
        "Healthcare regulation, internet commerce, environmental rules, and federal spending all trace back to how far these clauses stretch. Nearly every modern power dispute runs through Article I, Section 8.",
    },
    {
      id: "article-i-section-9",
      section: "Article I, Section 9",
      text: "The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it. No Bill of Attainder or ex post facto Law shall be passed.",
      explanation:
        "Even Congress faces hard limits: courts must be able to test detention, legislatures cannot convict named individuals by statute, and criminal law cannot be applied retroactively.",
      historicalContext:
        "These clauses responded to British practices that allowed detention without charge, legislative punishment of enemies, and retroactive crimes. They embed due-process instincts directly into the legislative article.",
      modernRelevance:
        "Wartime detention, immigration holds, sanctions lists, and punitive legislation still raise habeas corpus, bill of attainder, and ex post facto questions. They are early warning lines against panic-driven law.",
    },
    {
      id: "article-ii-section-1",
      section: "Article II, Section 1",
      text: "The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years… Before he enter on the Execution of his Office, he shall take the following Oath or Affirmation:—'I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States.'",
      explanation:
        "Executive power is unified in one elected officer serving a fixed term and bound by oath to the Constitution — not to Congress, not to a party, and not to personal will.",
      historicalContext:
        "The Framers debated a powerful single executive to ensure energy and accountability in foreign affairs and enforcement. The four-year term and oath were compromises between monarchy and weak committees.",
      modernRelevance:
        "Executive orders, military action, pardons, and agency control all test what 'faithfully execute' means today. The presidential oath is the line between constitutional office and personal rule.",
    },
    {
      id: "article-iii-section-1",
      section: "Article III, Section 1",
      text: "The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour, and shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office.",
      explanation:
        "Federal judges are insulated from political pressure through life tenure and protected pay so they may decide cases by law rather than by fear of removal or salary cuts.",
      historicalContext:
        "Judicial independence was a deliberate answer to colonial experience with removable, politically obedient judges. Article III is short because the Framers expected much of the judicial role to develop through case law and congressional structure.",
      modernRelevance:
        "Court packing proposals, funding fights, and attacks on judicial legitimacy all strike at this design. Independent courts are the institutional line between constitutional text and political majorities.",
    },
    {
      id: "article-iv-section-2",
      section: "Article IV, Section 2",
      text: "The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States. A Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, and be found in another State, shall on Demand of the executive Authority of the State from which he fled, be delivered up, to be removed to the State having Jurisdiction of the Crime.",
      explanation:
        "The Constitution builds one nation from many states: citizens receive basic interstate protections, and fugitives cannot escape justice by crossing a border.",
      historicalContext:
        "The Articles of Confederation left states treating each other's citizens as strangers. Article IV created practical national unity — travel, commerce, and law enforcement across state lines.",
      modernRelevance:
        "Licensing, travel rights, extradition, and discrimination by state still invoke privileges and immunities. It is the constitutional glue of a mobile, federal republic.",
    },
    {
      id: "article-v",
      section: "Article V",
      text: "The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution, or, on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments, which, in either Case, shall be valid to all Intents and Purposes, as Part of this Constitution, when ratified by the Legislatures of three fourths of the several States, or by Conventions in three fourths thereof, as the one or the other Mode of Ratification may be proposed by the Congress.",
      explanation:
        "The Constitution can be amended, but only through demanding supermajorities. The people retain the ultimate power to revise the framework without making it fragile to temporary majorities.",
      historicalContext:
        "Article V was a sales pitch to skeptics: the system could evolve without revolution. Every amendment since — including the Bill of Rights — traveled this road of proposal and ratification.",
      modernRelevance:
        "Modern amendment campaigns, convention calls, and court-driven constitutional change all raise the question of who may alter the charter. Article V is the lawful line for formal revision.",
    },
    {
      id: "article-vi",
      section: "Article VI — Supremacy Clause",
      text: "This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding.",
      explanation:
        "When state law conflicts with valid federal law under the Constitution, federal law wins. Judges in every state are bound to enforce that hierarchy.",
      historicalContext:
        "The Supremacy Clause answered the fatal weakness of the Confederation period, when states ignored national obligations. It made the Constitution operable as law rather than mere advice.",
      modernRelevance:
        "Immigration, marijuana policy, election law, and civil rights enforcement repeatedly test federal supremacy against state sovereignty. This clause defines which line prevails when governments disagree.",
    },
  ],
};