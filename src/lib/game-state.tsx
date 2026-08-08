import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  emptyAllocations,
  financialHealth,
  levelFromXp,
  type CategoryKey,
  type HealthBreakdown,
} from "@/lib/finance";

export type Profile = {
  name: string;
  age: number;
  salary: number;
  savings: number;
  expenses: number;
  goal: string;
};

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  label: string;
  timestamp: number;
};

export type InvestmentRecord = {
  id: string;
  typeId: string;
  typeName: string;
  mode: "once" | "monthly";
  amount: number;
  years: number;
  ratePct: number;
  projectedValue: number;
  totalContributed: number;
  timestamp: number;
};

export type ScenarioResult = {
  id: string;
  title: string;
  cost: number;
  coveredByFund: number;
  shortfall: number;
  timestamp: number;
};

export type Stage = "landing" | "budget" | "invest" | "scenario" | "report";

export type GameState = {
  profile: Profile | null;
  stage: Stage;
  allocations: Record<CategoryKey, number>;
  investments: InvestmentRecord[];
  transactions: Transaction[];
  scenarios: ScenarioResult[];
  emergencySpent: number;
  cashPenalty: number;
  xp: number;
  coins: number;
  achievements: string[];
};

const STORAGE_KEY = "paisa-quest-state-v1";

const initialState: GameState = {
  profile: null,
  stage: "landing",
  allocations: emptyAllocations(),
  investments: [],
  transactions: [],
  scenarios: [],
  emergencySpent: 0,
  cashPenalty: 0,
  xp: 0,
  coins: 0,
  achievements: [],
};

type Derived = {
  availableBudget: number;
  allocatedTotal: number;
  unallocated: number;
  cash: number;
  savingsBalance: number;
  emergencyFund: number;
  pendingInvestPool: number;
  investedTotal: number;
  monthlyCommitment: number;
  funSpend: number;
  investableNow: number;
  health: HealthBreakdown;
  level: number;
};

type Ctx = {
  state: GameState;
  derived: Derived;
  setProfile: (p: Profile) => void;
  setStage: (s: Stage) => void;
  allocate: (category: CategoryKey, amount: number) => void;
  setAllocation: (category: CategoryKey, amount: number) => void;
  resetAllocations: () => void;
  addInvestment: (r: Omit<InvestmentRecord, "id" | "timestamp">) => void;
  recordScenario: (r: Omit<ScenarioResult, "id" | "timestamp">) => void;
  reward: (xp: number, coins: number, achievement?: string) => void;
  resetGame: () => void;
};

const GameContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        setState({ ...initialState, ...parsed, allocations: { ...emptyAllocations(), ...parsed.allocations } });
      }
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const pushTx = (s: GameState, tx: Omit<Transaction, "id" | "timestamp">): Transaction[] => [
    { ...tx, id: uid(), timestamp: Date.now() },
    ...s.transactions,
  ];

  const setProfile = useCallback((p: Profile) => {
    setState((s) => ({
      ...s,
      profile: p,
      stage: "budget",
      xp: s.xp + 100,
      coins: s.coins + 50,
      achievements: s.achievements.includes("Journey Begun")
        ? s.achievements
        : [...s.achievements, "Journey Begun"],
    }));
  }, []);

  const setStage = useCallback((stage: Stage) => setState((s) => ({ ...s, stage })), []);

  const allocate = useCallback((category: CategoryKey, amount: number) => {
    setState((s) => {
      const label = CATEGORIES.find((c) => c.key === category)?.label ?? category;
      const achievements = [...s.achievements];
      if (category === "emergencyFund" && !achievements.includes("Safety Net Started")) {
        achievements.push("Safety Net Started");
      }
      return {
        ...s,
        allocations: { ...s.allocations, [category]: s.allocations[category] + amount },
        transactions: pushTx(s, { amount, category, label: `Allocated to ${label}` }),
        xp: s.xp + 10,
        coins: s.coins + Math.max(1, Math.round(amount / 500)),
        achievements,
      };
    });
  }, []);

  const setAllocation = useCallback((category: CategoryKey, amount: number) => {
    setState((s) => ({ ...s, allocations: { ...s.allocations, [category]: Math.max(0, amount) } }));
  }, []);

  const resetAllocations = useCallback(() => {
    setState((s) => ({ ...s, allocations: emptyAllocations() }));
  }, []);

  const addInvestment = useCallback((r: Omit<InvestmentRecord, "id" | "timestamp">) => {
    setState((s) => {
      const achievements = [...s.achievements];
      if (!achievements.includes("First Investment")) achievements.push("First Investment");
      if (r.mode === "monthly" && !achievements.includes("Consistent Investor"))
        achievements.push("Consistent Investor");
      return {
        ...s,
        investments: [{ ...r, id: uid(), timestamp: Date.now() }, ...s.investments],
        transactions: pushTx(s, {
          amount: r.amount,
          category: "investment",
          label:
            r.mode === "monthly"
              ? `Started ₹${r.amount}/month in ${r.typeName}`
              : `Invested in ${r.typeName}`,
        }),
        xp: s.xp + 60,
        coins: s.coins + Math.max(5, Math.round(r.amount / 400)),
        achievements,
      };
    });
  }, []);

  const recordScenario = useCallback((r: Omit<ScenarioResult, "id" | "timestamp">) => {
    setState((s) => {
      const achievements = [...s.achievements];
      if (r.shortfall === 0 && r.cost > 0 && !achievements.includes("Shock Absorbed"))
        achievements.push("Shock Absorbed");
      return {
        ...s,
        scenarios: [{ ...r, id: uid(), timestamp: Date.now() }, ...s.scenarios],
        emergencySpent: s.emergencySpent + r.coveredByFund,
        cashPenalty: s.cashPenalty + r.shortfall,
        transactions: pushTx(s, { amount: r.cost, category: "scenario", label: r.title }),
        xp: s.xp + 40,
        achievements,
      };
    });
  }, []);

  const reward = useCallback((xp: number, coins: number, achievement?: string) => {
    setState((s) => ({
      ...s,
      xp: s.xp + xp,
      coins: s.coins + coins,
      achievements:
        achievement && !s.achievements.includes(achievement)
          ? [...s.achievements, achievement]
          : s.achievements,
    }));
  }, []);

  const resetGame = useCallback(() => setState({ ...initialState, allocations: emptyAllocations() }), []);

  const derived = useMemo<Derived>(() => {
    const p = state.profile;
    const salary = p?.salary ?? 0;
    const expenses = p?.expenses ?? 0;
    const availableBudget = Math.max(0, salary - expenses);
    const a = state.allocations;
    const allocatedTotal = Object.values(a).reduce((x, y) => x + y, 0);
    const unallocated = Math.max(0, availableBudget - allocatedTotal);

    const onceInvested = state.investments
      .filter((i) => i.mode === "once")
      .reduce((x, i) => x + i.amount, 0);
    const monthlyCommitment = state.investments
      .filter((i) => i.mode === "monthly")
      .reduce((x, i) => x + i.amount, 0);

    const pendingInvestPool = Math.max(0, a.investments - onceInvested);
    const investableNow = Math.max(0, pendingInvestPool + unallocated - monthlyCommitment);
    const emergencyFund = Math.max(0, a.emergencyFund - state.emergencySpent);
    const savingsBalance = Math.max(0, (p?.savings ?? 0) + a.savings - state.cashPenalty);
    const cash = Math.max(0, unallocated - monthlyCommitment);
    const funSpend = a.food + a.entertainment + a.travel + a.shopping;

    const health = financialHealth({
      salary,
      expenses,
      savingsBalance: a.savings,
      emergencyFund,
      invested: onceInvested,
      monthlyInvestment: monthlyCommitment,
      allocatedTotal,
      availableBudget,
      funSpend,
      shortfallHits: state.scenarios.filter((s) => s.shortfall > 0).length,
    });

    return {
      availableBudget,
      allocatedTotal,
      unallocated,
      cash,
      savingsBalance,
      emergencyFund,
      pendingInvestPool,
      investedTotal: onceInvested,
      monthlyCommitment,
      funSpend,
      investableNow,
      health,
      level: levelFromXp(state.xp),
    };
  }, [state]);

  const value: Ctx = {
    state,
    derived,
    setProfile,
    setStage,
    allocate,
    setAllocation,
    resetAllocations,
    addInvestment,
    recordScenario,
    reward,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
