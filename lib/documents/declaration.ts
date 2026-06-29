import type { FoundingDocument } from "@/lib/documents/types";

export const declarationDocument: FoundingDocument = {
  slug: "declaration",
  title: "Declaration of Independence",
  subtitle: "The moral case for separation and the American creed of natural rights.",
  year: "1776",
  accent: "gold",
  passages: [
    {
      id: "preamble",
      section: "Preamble",
      text: "When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.",
      explanation:
        "The opening announces that independence is not a rash revolt but a reasoned act requiring public justification. The signers claim a rightful place among nations grounded in natural law, not mere force.",
      historicalContext:
        "Drafted primarily by Thomas Jefferson in June 1776 and adopted by the Continental Congress on July 4, the Declaration was addressed to both Americans and a watching world. Its preamble drew on Enlightenment political thought and colonial pamphlets arguing that legitimate government rests on consent.",
      modernRelevance:
        "Every major political break — secession movements, revolutions, or declarations of sovereignty — still faces the same question: what principled reasons justify separation? The preamble sets the standard that power must be explained, not merely seized.",
    },
    {
      id: "self-evident-truths",
      section: "Self-Evident Truths",
      text: "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.",
      explanation:
        "This is the American creed: equality at creation, rights that precede government, and a limited list of examples rather than an exhaustive catalog. Rights are 'unalienable' because no ruler can morally revoke what human nature grants.",
      historicalContext:
        "Jefferson's draft built on Locke's life, liberty, and property, changing 'property' to 'pursuit of Happiness' to broaden the moral appeal. The phrase became the philosophical backbone of abolition, suffrage, and civil rights movements that demanded the nation's practice match its promise.",
      modernRelevance:
        "Courts, activists, and citizens still argue over what 'equal' and 'unalienable' require in practice — from due process to economic liberty to equal treatment under law. This sentence is the benchmark against which American law is judged.",
    },
    {
      id: "consent-and-just-government",
      section: "Consent & Just Government",
      text: "That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed, — That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing its powers in such form, as to them shall seem most likely to effect their Safety and Happiness.",
      explanation:
        "Government exists to protect rights, not to grant them. Its powers are legitimate only by consent, and the people retain a final remedy when rulers destroy the very rights government was formed to secure.",
      historicalContext:
        "This passage translated revolutionary resistance into constitutional theory. It justified the break with Britain while warning future American governments that tyranny forfeits legitimacy. The same logic echoed in state constitutions written during and after the Revolution.",
      modernRelevance:
        "Debates over voter access, executive emergency powers, and police authority often turn on whether government still operates by consent and still secures rights. This passage is the people's standard for when reform is duty and when resistance is justified.",
    },
    {
      id: "prudence-and-abuses",
      section: "Prudence & Long Abuses",
      text: "Prudence, indeed, will dictate that Governments long established should not be changed for light and transient causes; and accordingly all experience hath shewn, that mankind are more disposed to suffer, while evils are sufferable, than to right themselves by abolishing the forms to which they are accustomed. But when a long train of abuses and usurpations, pursuing invariably the same Object evinces a design to reduce them under absolute Despotism, it is their right, it is their duty, to throw off such Government, and to provide new Guards for their future security.",
      explanation:
        "Revolution is a last resort, not a first impulse. The colonists argue they endured until a pattern of abuses revealed a deliberate plan of despotism — only then does resistance become duty.",
      historicalContext:
        "The Congress needed to show Britain and wary colonists that independence was measured, not anarchic. The grievances that follow were assembled to prove a 'long train of abuses' rather than isolated disputes over taxes or trade.",
      modernRelevance:
        "Reform versus rupture remains the central question in political crises. This passage demands evidence of systemic abuse before radical change — a standard that shapes how citizens evaluate protest, impeachment, and institutional overhaul.",
    },
    {
      id: "grievance-taxation",
      section: "Grievance — Taxation & Representation",
      text: "For imposing Taxes on us without our Consent… He has refused to pass other Laws for the accommodation of large districts of people, unless those people would relinquish the right of Representation in the Legislature, a right inestimable to them and formidable to tyrants only.",
      explanation:
        "No taxation without representation was more than a slogan — it expressed the core principle that people cannot be bound by laws they have no voice in making. Denying representation while demanding obedience is tyranny.",
      historicalContext:
        "After the Seven Years' War, Parliament sought revenue from the colonies through the Stamp Act and Townshend Acts while denying colonial seats in Parliament. Colonial assemblies insisted that only their own elected legislatures could tax them.",
      modernRelevance:
        "Modern fights over regulatory agencies, federal mandates, and local self-government still ask who must consent to rules that bind citizens. Representation remains the first line against arbitrary power.",
    },
    {
      id: "grievance-jury",
      section: "Grievance — Trial by Jury",
      text: "For depriving us in many cases, of the benefits of Trial by Jury: For transporting us beyond Seas to be tried for pretended offences… For taking away our Charters, abolishing our most valuable Laws, and altering fundamentally the Forms of our Governments.",
      explanation:
        "The colonists accused the Crown of stripping local legal protections — jury trials, local charters, and accustomed institutions — and substituting distant, politicized justice. Law became an instrument of control.",
      historicalContext:
        "Coercive Acts and other imperial measures placed accused colonists before admiralty courts or British tribunals seen as biased. Colonial leaders treated independent local juries and charters as essential barriers between citizen and crown.",
      modernRelevance:
        "Fair procedure before punishment is still the line between justice and power. Questions about forum, due process, military tribunals, and federal overreach echo the same fear of justice rigged by distance and authority.",
    },
    {
      id: "declaration-of-independence",
      section: "Declaration of Independence",
      text: "We, therefore, the Representatives of the united States of America, in General Congress, Assembled, appealing to the Supreme Judge of the world for the rectitude of our intentions, do, in the Name, and by Authority of the good People of these Colonies, solemnly publish and declare, That these United Colonies are, and of Right ought to be Free and Independent States…",
      explanation:
        "Here the Congress crosses the point of no return: the colonies are declared free states with full sovereign powers. The appeal to divine judgment underscores that the signers believed they acted under moral obligation, not mere interest.",
      historicalContext:
        "On July 2, 1776, Congress voted for independence; the Declaration's text was adopted July 4. The act was treason under British law and required extraordinary collective courage from delegates who knew war would follow.",
      modernRelevance:
        "Sovereignty decisions — national independence, federal authority, state autonomy — still turn on who has the legitimate voice to declare political status. This clause is the birth certificate of American self-government.",
    },
    {
      id: "pledge-of-lives",
      section: "Pledge",
      text: "And for the support of this Declaration, with a firm reliance on the protection of divine Providence, we mutually pledge to each other our Lives, our Fortunes and our sacred Honor.",
      explanation:
        "The closing is a personal covenant. The signers stake their property, reputation, and survival on the cause, binding each other to see the revolution through.",
      historicalContext:
        "Many signers suffered confiscation, imprisonment, or ruin. The pledge transformed a philosophical document into a shared oath that made retreat costly and unity morally binding.",
      modernRelevance:
        "Every generation that claims the Declaration's principles must also accept its cost. Civic courage — willingness to stand on principle when comfort and popularity fade — is what turns words on parchment into a living republic.",
    },
  ],
};