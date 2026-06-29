import type { FoundingDocument } from "@/lib/documents/types";

export const billOfRightsDocument: FoundingDocument = {
  slug: "bill-of-rights",
  title: "Bill of Rights",
  subtitle: "The first ten amendments — explicit limits on federal power over the people.",
  year: "1791",
  accent: "crimson",
  passages: [
    {
      id: "amendment-i",
      section: "First Amendment",
      text: "Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.",
      explanation:
        "Five freedoms in one amendment: no established church, free exercise of religion, speech, press, assembly, and petition. Congress is forbidden from silencing the channels by which citizens judge and correct their government.",
      historicalContext:
        "Ratified in 1791 after fierce Anti-Federalist demand for explicit limits, the First Amendment responded to colonial censorship, religious establishment, and the fear that a distant Congress could crush dissent.",
      modernRelevance:
        "Social media moderation, campus speech, protest permits, and religious conscience claims all run through the First Amendment. It is the primary line between free society and controlled opinion.",
    },
    {
      id: "amendment-ii",
      section: "Second Amendment",
      text: "A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.",
      explanation:
        "The federal government may not disarm the people. The prefatory militia clause describes a purpose — a free state's security — while the operative clause secures an individual right to keep and bear arms.",
      historicalContext:
        "Americans distrusted standing armies and believed armed citizens were a check on tyranny. The amendment codified a tradition of personal arms tied to civic defense and self-protection.",
      modernRelevance:
        "Modern disputes focus on regulation short of total prohibition — background checks, carry laws, and weapon types. The amendment remains the constitutional line against complete civilian disarmament by the federal government.",
    },
    {
      id: "amendment-iii",
      section: "Third Amendment",
      text: "No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.",
      explanation:
        "The government cannot house soldiers in private homes without consent or lawful wartime procedure. Your dwelling is not barracks.",
      historicalContext:
        "British Quartering Acts helped ignite colonial anger by forcing citizens to lodge and supply troops. The Third Amendment made that specific abuse unconstitutional.",
      modernRelevance:
        "Rarely litigated today, it still symbolizes the broader principle that private property and home sanctity cannot be sacrificed casually to military convenience — a line echoed in search, seizure, and privacy law.",
    },
    {
      id: "amendment-iv",
      section: "Fourth Amendment",
      text: "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.",
      explanation:
        "Privacy and security against arbitrary government intrusion require reasonableness, probable cause, and particular warrants — not general fishing expeditions.",
      historicalContext:
        "Colonial writs of assistance allowed broad, renewable searches without specific cause. The Fourth Amendment rejected that model and demanded judicial oversight before invasion of private space.",
      modernRelevance:
        "Digital devices, GPS tracking, airport screening, and mass surveillance constantly test what 'reasonable' means in a connected age. The warrant requirement is the line between investigation and dragnet.",
    },
    {
      id: "amendment-v",
      section: "Fifth Amendment",
      text: "No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury… nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself… nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation.",
      explanation:
        "The Fifth Amendment bundles criminal protections and due process: grand jury indictment, no double jeopardy, no forced self-incrimination, fair procedure before deprivation, and just compensation for takings.",
      historicalContext:
        "Drawn from English common-law protections and colonial experience with arbitrary prosecution, it placed procedural brakes on the state's most dangerous power — the power to punish and confiscate.",
      modernRelevance:
        "Plea bargaining, civil asset forfeiture, regulatory takings, and administrative penalties all invoke Fifth Amendment lines. Due process is the universal brake on government harm to person and property.",
    },
    {
      id: "amendment-vi",
      section: "Sixth Amendment",
      text: "In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury of the State and district wherein the crime shall have been committed… to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence.",
      explanation:
        "A criminal defendant gets a public, timely trial before a local impartial jury, notice of charges, confrontation of accusers, subpoena power for defense witnesses, and a lawyer.",
      historicalContext:
        "The Framers feared secret prosecutions and distant courts. The Sixth Amendment made criminal justice adversarial and visible so the state could not crush defendants in darkness.",
      modernRelevance:
        "Backlogged courts, plea-driven systems, virtual trials, and inadequate defense counsel test whether these guarantees are real or theoretical. The amendment is the line against railroaded justice.",
    },
    {
      id: "amendment-vii",
      section: "Seventh Amendment",
      text: "In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved, and no fact tried by a jury, shall be otherwise re-examined in any Court of the United States, than according to the rules of the common law.",
      explanation:
        "Civil disputes at common law retain jury trial as a safeguard against biased judges and distant authority. Jury findings receive strong protection from re-examination.",
      historicalContext:
        "Anti-Federalists insisted that juries were as vital in civil cases as criminal ones. The Seventh Amendment preserved a tradition central to colonial self-government.",
      modernRelevance:
        "Mandatory arbitration clauses, administrative tribunals, and forum-shifting contracts erode jury access in civil life. The amendment defends the line between popular judgment and institutional convenience.",
    },
    {
      id: "amendment-viii",
      section: "Eighth Amendment",
      text: "Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted.",
      explanation:
        "Punishment and pretrial conditions must stay proportionate. Bail, fines, and sentences cannot be tools of oppression or cruelty.",
      historicalContext:
        "English law already rejected barbaric punishments; the Eighth Amendment constitutionalized proportionality as American standards of decency evolved.",
      modernRelevance:
        "Cash bail reform, forfeiture fines, solitary confinement, and sentencing debates invoke the Eighth Amendment. It is the line against punishment that outruns the crime or the dignity of the person.",
    },
    {
      id: "amendment-ix",
      section: "Ninth Amendment",
      text: "The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people.",
      explanation:
        "Listing some rights does not mean the people lack others. Unenumerated rights still exist and cannot be dismissed merely because they are not named.",
      historicalContext:
        "Federalists feared a Bill of Rights would imply unlimited government power elsewhere. Madison added the Ninth Amendment to prevent that inference and preserve popular sovereignty over rights.",
      modernRelevance:
        "Privacy, travel, family autonomy, and other unlisted liberties often invoke the Ninth Amendment. It is the line against the claim that if a right is not written, it does not exist.",
    },
    {
      id: "amendment-x",
      section: "Tenth Amendment",
      text: "The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.",
      explanation:
        "Federal power is limited to what the Constitution delegates. Everything else belongs to states or the people themselves.",
      historicalContext:
        "The Tenth Amendment reassured ratifiers that the new national government remained confined. It became the textual anchor for federalism and state sovereignty claims.",
      modernRelevance:
        "Healthcare, education, marijuana policy, and emergency mandates still spark Tenth Amendment disputes. It is the line reminding Washington that not every problem is a federal problem.",
    },
  ],
};