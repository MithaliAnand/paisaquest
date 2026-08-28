import { futureValueLumpsum, futureValueMonthly } from "@/lib/finance";

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export type ChapterId = "firstJob" | "rentEmi" | "marketCrash" | "marriageKids" | "retirement";

export type ChapterScale = {
  salary: number;
  expenses: number;
};

export type ChapterChoice = {
  id: string;
  label: string;
  blurb: string;
  /** monthly expense change in ₹ */
  expenseDelta: number;
  /** monthly salary change in ₹ */
  salaryDelta: number;
  /** one-off cash requirement in ₹ */
  oneTime: number;
};

export type ChapterDef = {
  id: ChapterId;
  title: string;
  emoji: string;
  tagline: string;
  /** years that pass inside this chapter */
  years: number;
  /** minimum financial health needed to move on */
  minHealth: number;
  /** minimum months of emergency cover needed to move on */
  minCoverage: number;
  choices: (s: ChapterScale) => ChapterChoice[];
};

const round = (n: number) => Math.round(n / 100) * 100;

export const CHAPTERS: ChapterDef[] = [
  {
    id: "firstJob",
    title: "First Job",
    emoji: "🧑‍💻",
    tagline: "Your first pay cheque lands. How do you set the tone?",
    years: 2,
    minHealth: 25,
    minCoverage: 0.5,
    choices: (s) => [
      {
        id: "frugal",
        label: "Live lean with flatmates",
        blurb: "Lower monthly costs, more room to save and invest.",
        expenseDelta: -round(s.expenses * 0.1),
        salaryDelta: 0,
        oneTime: 0,
      },
      {
        id: "comfort",
        label: "Upgrade your lifestyle",
        blurb: "More comfort now, less money working for later.",
        expenseDelta: round(s.expenses * 0.12),
        salaryDelta: 0,
        oneTime: 0,
      },
      {
        id: "upskill",
        label: "Pay for a certification",
        blurb: "A one-time cost now, a higher salary afterwards.",
        expenseDelta: 0,
        salaryDelta: round(s.salary * 0.08),
        oneTime: round(s.salary * 0.6),
      },
    ],
  },
  {
    id: "rentEmi",
    title: "Rent & EMI",
    emoji: "🏠",
    tagline: "Time for your own place. Rent, or take on a home loan?",
    years: 5,
    minHealth: 35,
    minCoverage: 1,
    choices: (s) => [
      {
        id: "rentSmall",
        label: "Rent a modest place",
        blurb: "Flexible and cheap, but you build no property equity.",
        expenseDelta: round(s.salary * 0.18),
        salaryDelta: 0,
        oneTime: round(s.salary * 0.4),
      },
      {
        id: "rentBig",
        label: "Rent somewhere lovely",
        blurb: "A nicer life, a heavier monthly bill.",
        expenseDelta: round(s.salary * 0.3),
        salaryDelta: 0,
        oneTime: round(s.salary * 0.8),
      },
      {
        id: "homeLoan",
        label: "Buy with a home loan",
        blurb: "A big down payment and a long EMI, but the asset is yours.",
        expenseDelta: round(s.salary * 0.35),
        salaryDelta: 0,
        oneTime: round(s.salary * 4),
      },
    ],
  },
  {
    id: "marketCrash",
    title: "Market Crash",
    emoji: "📉",
    tagline: "Markets fall sharply. Everyone around you is reacting.",
    years: 2,
    minHealth: 40,
    minCoverage: 1.5,
    choices: (s) => [
      {
        id: "hold",
        label: "Hold and keep investing",
        blurb: "Painful on paper, historically kind over long horizons.",
        expenseDelta: 0,
        salaryDelta: 0,
        oneTime: 0,
      },
      {
        id: "buyDip",
        label: "Invest extra while prices are low",
        blurb: "Needs spare cash today; can lift long-run growth.",
        expenseDelta: 0,
        salaryDelta: 0,
        oneTime: round(s.salary * 1.2),
      },
      {
        id: "exit",
        label: "Move everything to cash",
        blurb: "Sleep better now, lock in the fall and miss the rebound.",
        expenseDelta: 0,
        salaryDelta: 0,
        oneTime: 0,
      },
    ],
  },
  {
    id: "marriageKids",
    title: "Marriage / Kids",
    emoji: "👨‍👩‍👧",
    tagline: "Your household grows, and so do the numbers.",
    years: 10,
    minHealth: 45,
    minCoverage: 3,
    choices: (s) => [
      {
        id: "modest",
        label: "A simple celebration",
        blurb: "Keeps the cushion intact for the family years ahead.",
        expenseDelta: round(s.expenses * 0.35),
        salaryDelta: 0,
        oneTime: round(s.salary * 3),
      },
      {
        id: "grand",
        label: "A grand celebration",
        blurb: "Unforgettable — and a serious dent in the balance sheet.",
        expenseDelta: round(s.expenses * 0.45),
        salaryDelta: 0,
        oneTime: round(s.salary * 8),
      },
      {
        id: "dualIncome",
        label: "Both partners keep earning",
        blurb: "Childcare costs rise, household income rises more.",
        expenseDelta: round(s.expenses * 0.5),
        salaryDelta: round(s.salary * 0.6),
        oneTime: round(s.salary * 3),
      },
    ],
  },
  {
    id: "retirement",
    title: "Retirement",
    emoji: "🌴",
    tagline: "The final stretch. How do you land the plane?",
    years: 15,
    minHealth: 50,
    minCoverage: 6,
    choices: (s) => [
      {
        id: "aggressive",
        label: "Keep growth assets running",
        blurb: "Higher expected end value, bumpier ride near the finish.",
        expenseDelta: 0,
        salaryDelta: 0,
        oneTime: 0,
      },
      {
        id: "glide",
        label: "Glide into safer assets",
        blurb: "Steadier, slightly lower expected outcome.",
        expenseDelta: 0,
        salaryDelta: 0,
        oneTime: 0,
      },
      {
        id: "downshift",
        label: "Cut back to part-time early",
        blurb: "Less income, a gentler life before sixty.",
        expenseDelta: -round(s.expenses * 0.15),
        salaryDelta: -round(s.salary * 0.4),
        oneTime: 0,
      },
    ],
  },
];

export const chapterIndex = (id: ChapterId) => CHAPTERS.findIndex((c) => c.id === id);

/* ------------------------------------------------------------------ */
/* Random life events                                                  */
/* ------------------------------------------------------------------ */

export type LifeEventKind = "cost" | "gain" | "market";

export type LifeEventDef = {
  id: string;
  title: string;
  emoji: string;
  kind: LifeEventKind;
  narrative: string;
  /** ₹ amount, always derived from the player's own numbers */
  amount: number;
  /** for market events: multiplier applied to projected investment value */
  marketFactor?: number;
};

type EventTemplate = {
  id: string;
  title: string;
  emoji: string;
  kind: LifeEventKind;
  narrative: string;
  weight: number;
  amount: (s: ChapterScale, r: number) => number;
  marketFactor?: (r: number) => number;
};

const TEMPLATES: EventTemplate[] = [
  {
    id: "medical",
    title: "Medical emergency",
    emoji: "🏥",
    kind: "cost",
    narrative: "A hospital visit nobody planned for.",
    weight: 3,
    amount: (s, r) => round((s.salary * 0.2 + s.expenses * 0.5) * (0.7 + r)),
  },
  {
    id: "jobLoss",
    title: "Job loss",
    emoji: "📦",
    kind: "cost",
    narrative: "Your role is cut. You need to cover living costs while you search.",
    weight: 2,
    amount: (s, r) => round(s.expenses * (1.5 + r * 2)),
  },
  {
    id: "repair",
    title: "Urgent home repair",
    emoji: "🔧",
    kind: "cost",
    narrative: "Something important broke and cannot wait.",
    weight: 2,
    amount: (s, r) => round(s.salary * (0.25 + r * 0.5)),
  },
  {
    id: "raise",
    title: "Salary raise",
    emoji: "🌟",
    kind: "gain",
    narrative: "Your work paid off — your monthly income steps up.",
    weight: 2,
    amount: (s, r) => round(s.salary * (0.05 + r * 0.1)),
  },
  {
    id: "bonus",
    title: "Annual bonus",
    emoji: "🎁",
    kind: "gain",
    narrative: "A lump sum lands in your account.",
    weight: 3,
    amount: (s, r) => round(s.salary * (0.5 + r)),
  },
  {
    id: "crash",
    title: "Market crash",
    emoji: "📉",
    kind: "market",
    narrative: "Markets slide. Your invested money is worth less on paper.",
    weight: 2,
    amount: () => 0,
    marketFactor: (r) => 1 - (0.12 + r * 0.2),
  },
  {
    id: "boom",
    title: "Investment boom",
    emoji: "🚀",
    kind: "market",
    narrative: "A strong run lifts the value of what you already hold.",
    weight: 2,
    amount: () => 0,
    marketFactor: (r) => 1 + (0.1 + r * 0.25),
  },
];

/** Weighted random pick, values scaled to the player's own salary/expenses. */
export function rollLifeEvent(scale: ChapterScale, rnd: () => number): LifeEventDef {
  const total = TEMPLATES.reduce((x, t) => x + t.weight, 0);
  let pick = rnd() * total;
  let chosen = TEMPLATES[0]!;
  for (const t of TEMPLATES) {
    pick -= t.weight;
    if (pick <= 0) {
      chosen = t;
      break;
    }
  }
  const r = rnd();
  return {
    id: `${chosen.id}-${Math.round(rnd() * 1e6)}`,
    title: chosen.title,
    emoji: chosen.emoji,
    kind: chosen.kind,
    narrative: chosen.narrative,
    amount: chosen.amount(scale, r),
    ...(chosen.marketFactor ? { marketFactor: Number(chosen.marketFactor(r).toFixed(3)) } : {}),
  };
}

/** Should an event fire this month? Depends on chance, never on a fixed script. */
export function shouldTriggerEvent(month: number, rnd: () => number): boolean {
  if (month <= 0) return false;
  return rnd() > 0.55;
}

/* ------------------------------------------------------------------ */
/* Emergency fund stress test                                          */
/* ------------------------------------------------------------------ */

export type StressResult = {
  cost: number;
  fromEmergencyFund: number;
  fromSavings: number;
  fromInvestments: number;
  fromDebt: number;
  absorbed: boolean;
};

export function stressTest(
  cost: number,
  funds: { emergencyFund: number; savings: number; investments: number },
): StressResult {
  let left = Math.max(0, Math.round(cost));
  const fromEmergencyFund = Math.min(funds.emergencyFund, left);
  left -= fromEmergencyFund;
  const fromSavings = Math.min(funds.savings, left);
  left -= fromSavings;
  const fromInvestments = Math.min(funds.investments, left);
  left -= fromInvestments;
  const fromDebt = left;
  return {
    cost: Math.max(0, Math.round(cost)),
    fromEmergencyFund,
    fromSavings,
    fromInvestments,
    fromDebt,
    absorbed: fromSavings === 0 && fromInvestments === 0 && fromDebt === 0,
  };
}

/* ------------------------------------------------------------------ */
/* Long-term outcome                                                   */
/* ------------------------------------------------------------------ */

export type NetWorthInput = {
  age: number;
  savingsBalance: number;
  emergencyFund: number;
  debt: number;
  lumpsums: { amount: number; ratePct: number }[];
  monthly: { amount: number; ratePct: number }[];
  marketFactor: number;
};

export function projectedNetWorthAt60(i: NetWorthInput): number {
  const years = Math.max(0, 60 - i.age);
  const invested =
    i.lumpsums.reduce((x, l) => x + futureValueLumpsum(l.amount, l.ratePct, years), 0) +
    i.monthly.reduce((x, m) => x + futureValueMonthly(m.amount, m.ratePct, years), 0);
  const cash = futureValueLumpsum(i.savingsBalance + i.emergencyFund, 4, years);
  const debt = i.debt * Math.pow(1.1, Math.min(years, 5));
  return Math.max(0, invested * i.marketFactor + cash - debt);
}
