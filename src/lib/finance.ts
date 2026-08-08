export type CategoryKey =
  | "savings"
  | "emergencyFund"
  | "investments"
  | "food"
  | "entertainment"
  | "travel"
  | "shopping";

export const CATEGORIES: {
  key: CategoryKey;
  label: string;
  emoji: string;
  tint: string;
  blurb: string;
}[] = [
  {
    key: "savings",
    label: "Savings",
    emoji: "🏦",
    tint: "bg-mint",
    blurb: "Money you keep for later",
  },
  {
    key: "emergencyFund",
    label: "Emergency Fund",
    emoji: "🛡️",
    tint: "bg-sky",
    blurb: "For unexpected moments",
  },
  {
    key: "investments",
    label: "Investments",
    emoji: "📈",
    tint: "bg-lavender",
    blurb: "Money set aside to grow",
  },
  { key: "food", label: "Food", emoji: "🍔", tint: "bg-peach", blurb: "Groceries & eating out" },
  {
    key: "entertainment",
    label: "Entertainment",
    emoji: "🎮",
    tint: "bg-blush",
    blurb: "Fun, games, streaming",
  },
  { key: "travel", label: "Travel", emoji: "✈️", tint: "bg-sky", blurb: "Trips and getaways" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", tint: "bg-lavender", blurb: "Wants & extras" },
];

export const emptyAllocations = (): Record<CategoryKey, number> => ({
  savings: 0,
  emergencyFund: 0,
  investments: 0,
  food: 0,
  entertainment: 0,
  travel: 0,
  shopping: 0,
});

/* ---------- formatting ---------- */

export function formatINR(value: number, withDecimals = false): string {
  const rounded = withDecimals ? value : Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: withDecimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(abs);
  return `${sign}₹${formatted}`;
}

export function formatGroupedNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function parseNumeric(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, "");
  if (!cleaned) return 0;
  return Math.min(Number(cleaned), 1_00_00_00_000);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/* ---------- currency notes ---------- */

export type NoteDenom = number;
const STANDARD = [500, 200, 100];

/** Break an amount into a playable set of notes (max ~16 pieces). */
export function buildNotes(amount: number): NoteDenom[] {
  const total = Math.max(0, Math.round(amount));
  if (total <= 0) return [];
  const ladder = [100, 200, 500, 2000, 5000, 10000, 20000, 50000, 100000, 500000];
  const target = 12;
  let base = ladder[0];
  for (const d of ladder) {
    base = d;
    if (Math.floor(total / d) <= target) break;
  }
  const notes: NoteDenom[] = [];
  let left = total;
  const count = Math.floor(left / base);
  for (let i = 0; i < count; i++) notes.push(base);
  left -= count * base;
  for (const d of STANDARD) {
    while (left >= d && notes.length < 18) {
      notes.push(d);
      left -= d;
    }
  }
  if (left > 0) notes.push(left);
  return notes;
}

/* ---------- investment maths ---------- */

export type InvestmentType = {
  id: string;
  name: string;
  emoji: string;
  risk: "Very Low" | "Low" | "Medium" | "High";
  rateLow: number;
  rateHigh: number;
  horizon: string;
  tint: string;
  what: string;
  how: string;
  considerations: string;
};

export const INVESTMENT_TYPES: InvestmentType[] = [
  {
    id: "mutualFund",
    name: "Mutual Funds",
    emoji: "📈",
    risk: "Medium",
    rateLow: 8,
    rateHigh: 12,
    horizon: "5+ years",
    tint: "bg-lavender",
    what: "A mutual fund pools money from many investors and invests it across assets such as stocks or bonds.",
    how: "A professional fund manager buys a basket of securities. Your money grows or falls with that basket's value.",
    considerations:
      "Returns are not guaranteed and can be negative in short periods. Best for medium-to-long goals.",
  },
  {
    id: "savingsAccount",
    name: "Savings Account",
    emoji: "🏦",
    risk: "Very Low",
    rateLow: 3,
    rateHigh: 4,
    horizon: "Anytime",
    tint: "bg-mint",
    what: "A bank account that pays a small amount of interest while keeping your money instantly available.",
    how: "The bank pays interest on your daily balance and credits it every quarter.",
    considerations: "Very safe and liquid, but returns often trail inflation over long periods.",
  },
  {
    id: "stocks",
    name: "Stocks",
    emoji: "📊",
    risk: "High",
    rateLow: 10,
    rateHigh: 16,
    horizon: "7+ years",
    tint: "bg-blush",
    what: "Buying a stock means buying a tiny ownership share of a company.",
    how: "Your value moves with the company's price on the exchange, plus any dividends it pays.",
    considerations: "Prices can swing sharply. Only invest money you will not need soon.",
  },
  {
    id: "bonds",
    name: "Bonds",
    emoji: "🪙",
    risk: "Low",
    rateLow: 6,
    rateHigh: 8,
    horizon: "3+ years",
    tint: "bg-sky",
    what: "A bond is a loan you give to a government or company in return for regular interest.",
    how: "You receive fixed interest payments and your principal back at maturity.",
    considerations: "Steadier than stocks, but the issuer's credit quality and interest rates matter.",
  },
  {
    id: "goldFund",
    name: "Gold Fund",
    emoji: "🥇",
    risk: "Medium",
    rateLow: 6,
    rateHigh: 10,
    horizon: "5+ years",
    tint: "bg-peach",
    what: "A fund that tracks the price of gold without you storing physical metal.",
    how: "Units rise and fall with gold prices; you can buy or sell them like a fund.",
    considerations: "Gold can stay flat for years; useful as a diversifier, not a whole plan.",
  },
  {
    id: "fixedDeposit",
    name: "Fixed Deposit",
    emoji: "🔒",
    risk: "Very Low",
    rateLow: 6,
    rateHigh: 7,
    horizon: "1–5 years",
    tint: "bg-mint",
    what: "You lock a sum with a bank for a fixed period at a pre-agreed interest rate.",
    how: "Interest accrues over the term and is paid on maturity (or periodically).",
    considerations: "Breaking early usually reduces the interest you earn.",
  },
];

export const midRate = (t: InvestmentType) => (t.rateLow + t.rateHigh) / 2;

export function futureValueLumpsum(amount: number, ratePct: number, years: number): number {
  return amount * Math.pow(1 + ratePct / 100, years);
}

export function futureValueMonthly(monthly: number, ratePct: number, years: number): number {
  const i = ratePct / 100 / 12;
  const n = Math.round(years * 12);
  if (monthly <= 0 || n <= 0) return 0;
  if (i === 0) return monthly * n;
  return monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

export function projectedReturnPct(invested: number, future: number): number {
  if (invested <= 0) return 0;
  return ((future - invested) / invested) * 100;
}

/* ---------- health / progression ---------- */

export type HealthInput = {
  salary: number;
  expenses: number;
  savingsBalance: number;
  emergencyFund: number;
  invested: number;
  monthlyInvestment: number;
  allocatedTotal: number;
  availableBudget: number;
  funSpend: number;
  shortfallHits: number;
};

export type HealthBreakdown = {
  score: number;
  parts: { label: string; score: number; max: number; hint: string }[];
};

export function financialHealth(i: HealthInput): HealthBreakdown {
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));

  const savingsRate = i.salary > 0 ? (i.savingsBalance + i.invested) / i.salary : 0;
  const savingsScore = clamp((savingsRate / 0.3) * 25, 25);

  const monthsCovered = i.expenses > 0 ? i.emergencyFund / i.expenses : 0;
  const efScore = clamp((monthsCovered / 3) * 30, 30);

  const investRate = i.availableBudget > 0 ? (i.invested + i.monthlyInvestment) / i.availableBudget : 0;
  const investScore = clamp((investRate / 0.4) * 20, 20);

  const adherence = i.availableBudget > 0 ? i.allocatedTotal / i.availableBudget : 0;
  const adherenceScore = clamp(adherence * 15, 15);

  const funRate = i.availableBudget > 0 ? i.funSpend / i.availableBudget : 0;
  const spendScore = clamp((1 - funRate / 0.5) * 10, 10);

  const penalty = i.shortfallHits * 6;

  const total = clamp(
    savingsScore + efScore + investScore + adherenceScore + spendScore - penalty,
    100,
  );

  return {
    score: Math.round(total),
    parts: [
      {
        label: "Savings rate",
        score: Math.round(savingsScore),
        max: 25,
        hint: `${Math.round(savingsRate * 100)}% of salary kept or grown`,
      },
      {
        label: "Emergency cover",
        score: Math.round(efScore),
        max: 30,
        hint: `${monthsCovered.toFixed(1)} months of expenses covered`,
      },
      {
        label: "Investing",
        score: Math.round(investScore),
        max: 20,
        hint: `${Math.round(investRate * 100)}% of free budget invested`,
      },
      {
        label: "Budget adherence",
        score: Math.round(adherenceScore),
        max: 15,
        hint: `${Math.round(adherence * 100)}% of budget consciously assigned`,
      },
      {
        label: "Spending balance",
        score: Math.round(spendScore),
        max: 10,
        hint: `${Math.round(funRate * 100)}% going to lifestyle categories`,
      },
    ],
  };
}

export const levelFromXp = (xp: number) => Math.floor(xp / 250) + 1;
export const xpIntoLevel = (xp: number) => xp % 250;
