import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  coverageMonths,
  emptyAllocations,
  financialHealth,
  levelFromXp,
  midRate,
  INVESTMENT_TYPES,
  type CategoryKey,
  type HealthBreakdown,
} from "@/lib/finance";
import {
  CHAPTERS,
  projectedNetWorthAt60,
  rollLifeEvent,
  stressTest,
  type ChapterId,
  type LifeEventDef,
  type StressResult,
} from "@/lib/progression";
import { loadCloudRun, saveCloudRun } from "@/lib/cloud-save";

export type Profile = {
  name: string;
  age: number;
  salary: number;
  savings: number;
  expenses: number;
  emergencyFund: number;
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

export type EventRecord = {
  id: string;
  chapter: ChapterId;
  title: string;
  emoji: string;
  kind: LifeEventDef["kind"];
  narrative: string;
  amount: number;
  marketFactor?: number;
  result?: StressResult;
  timestamp: number;
};

export type ChapterProgress = {
  id: ChapterId;
  choiceId: string;
  choiceLabel: string;
  completed: boolean;
  scoreAtCompletion: number;
  netWorthAtCompletion: number;
  timestamp: number;
};

export type RunSummary = {
  id: string;
  runNumber: number;
  name: string;
  score: number;
  netWorth: number;
  chaptersCleared: number;
  timestamp: number;
};

export type Stage = "landing" | "chapters" | "budget" | "invest" | "scenario" | "report" | "runs";

export type GameState = {
  runId: string;
  runNumber: number;
  profile: Profile | null;
  stage: Stage;
  allocations: Record<CategoryKey, number>;
  investments: InvestmentRecord[];
  transactions: Transaction[];
  scenarios: ScenarioResult[];
  chapters: ChapterProgress[];
  currentChapter: number;
  events: EventRecord[];
  pendingEvent: EventRecord | null;
  month: number;
  emergencySpent: number;
  savingsSpent: number;
  investmentsSold: number;
  debt: number;
  salaryDelta: number;
  expenseDelta: number;
  marketFactor: number;
  xp: number;
  coins: number;
  achievements: string[];
  runs: RunSummary[];
};

const STORAGE_KEY = "paisa-quest-state-v2";

const uid = () => Math.random().toString(36).slice(2, 10);

const freshState = (runNumber = 1, runs: RunSummary[] = []): GameState => ({
  runId: uid() + uid(),
  runNumber,
  profile: null,
  stage: "landing",
  allocations: emptyAllocations(),
  investments: [],
  transactions: [],
  scenarios: [],
  chapters: [],
  currentChapter: 0,
  events: [],
  pendingEvent: null,
  month: 0,
  emergencySpent: 0,
  savingsSpent: 0,
  investmentsSold: 0,
  debt: 0,
  salaryDelta: 0,
  expenseDelta: 0,
  marketFactor: 1,
  xp: 0,
  coins: 0,
  achievements: [],
  runs,
});

const initialState = freshState();

type Derived = {
  salary: number;
  expenses: number;
  availableBudget: number;
  allocatedTotal: number;
  unallocated: number;
  cash: number;
  savingsBalance: number;
  emergencyFund: number;
  coverage: number;
  pendingInvestPool: number;
  investedTotal: number;
  monthlyCommitment: number;
  funSpend: number;
  investableNow: number;
  health: HealthBreakdown;
  level: number;
  netWorth60: number;
  bestNetWorth: number;
  chaptersCleared: number;
  canAdvance: boolean;
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
  chooseChapter: (id: ChapterId, choiceId: string, choiceLabel: string, effect: { salaryDelta: number; expenseDelta: number; oneTime: number }) => void;
  completeChapter: (id: ChapterId) => void;
  rollEvent: () => void;
  resolveEvent: () => void;
  dismissEvent: () => void;
  reward: (xp: number, coins: number, achievement?: string) => void;
  finishRun: () => void;
  resetGame: () => void;
  cloud: { status: "idle" | "saving" | "saved" | "error"; restore: () => Promise<boolean> };
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GameState>;
        setState((s) => ({
          ...s,
          ...parsed,
          allocations: { ...emptyAllocations(), ...(parsed.allocations ?? {}) },
        }));
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
      stage: "chapters",
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
        savingsSpent: s.savingsSpent + r.shortfall,
        transactions: pushTx(s, { amount: r.cost, category: "scenario", label: r.title }),
        xp: s.xp + 40,
        achievements,
      };
    });
  }, []);

  const chooseChapter = useCallback(
    (
      id: ChapterId,
      choiceId: string,
      choiceLabel: string,
      effect: { salaryDelta: number; expenseDelta: number; oneTime: number },
    ) => {
      setState((s) => {
        const already = s.chapters.find((c) => c.id === id);
        if (already) return s;
        const chapter: ChapterProgress = {
          id,
          choiceId,
          choiceLabel,
          completed: false,
          scoreAtCompletion: 0,
          netWorthAtCompletion: 0,
          timestamp: Date.now(),
        };
        // A one-off cost is met from savings first, then borrowed.
        const savingsAvailable = Math.max(
          0,
          (s.profile?.savings ?? 0) + s.allocations.savings - s.savingsSpent,
        );
        const fromSavings = Math.min(savingsAvailable, effect.oneTime);
        const borrowed = effect.oneTime - fromSavings;
        return {
          ...s,
          chapters: [...s.chapters, chapter],
          salaryDelta: s.salaryDelta + effect.salaryDelta,
          expenseDelta: s.expenseDelta + effect.expenseDelta,
          savingsSpent: s.savingsSpent + fromSavings,
          debt: s.debt + borrowed,
          month: s.month + 1,
          transactions:
            effect.oneTime > 0
              ? pushTx(s, {
                  amount: effect.oneTime,
                  category: "chapter",
                  label: `${choiceLabel} (one-off cost)`,
                })
              : s.transactions,
          xp: s.xp + 50,
        };
      });
    },
    [],
  );

  const completeChapter = useCallback((id: ChapterId) => {
    setState((s) => {
      const idx = CHAPTERS.findIndex((c) => c.id === id);
      const chapters = s.chapters.map((c) =>
        c.id === id ? { ...c, completed: true, timestamp: Date.now() } : c,
      );
      const achievements = [...s.achievements];
      const title = CHAPTERS[idx]?.title ?? "Chapter";
      if (!achievements.includes(`${title} cleared`)) achievements.push(`${title} cleared`);
      return {
        ...s,
        chapters,
        currentChapter: Math.min(CHAPTERS.length - 1, Math.max(s.currentChapter, idx + 1)),
        month: s.month + (CHAPTERS[idx]?.years ?? 1) * 12,
        xp: s.xp + 120,
        coins: s.coins + 40,
        achievements,
      };
    });
  }, []);

  const rollEvent = useCallback(() => {
    setState((s) => {
      if (!s.profile || s.pendingEvent) return s;
      const scale = {
        salary: s.profile.salary + s.salaryDelta,
        expenses: s.profile.expenses + s.expenseDelta,
      };
      const def = rollLifeEvent(scale, Math.random);
      const chapterId = CHAPTERS[Math.min(s.currentChapter, CHAPTERS.length - 1)]!.id;
      const event: EventRecord = {
        id: def.id,
        chapter: chapterId,
        title: def.title,
        emoji: def.emoji,
        kind: def.kind,
        narrative: def.narrative,
        amount: def.amount,
        ...(def.marketFactor !== undefined ? { marketFactor: def.marketFactor } : {}),
        timestamp: Date.now(),
      };
      return { ...s, pendingEvent: event, month: s.month + 1 };
    });
  }, []);

  const resolveEvent = useCallback(() => {
    setState((s) => {
      const e = s.pendingEvent;
      if (!e || !s.profile) return s;
      const achievements = [...s.achievements];
      let next: GameState = { ...s, pendingEvent: null };

      if (e.kind === "cost") {
        const emergencyFund = Math.max(
          0,
          s.profile.emergencyFund + s.allocations.emergencyFund - s.emergencySpent,
        );
        const savings = Math.max(0, s.profile.savings + s.allocations.savings - s.savingsSpent);
        const investedOnce =
          s.investments.filter((i) => i.mode === "once").reduce((x, i) => x + i.amount, 0) -
          s.investmentsSold;
        const res = stressTest(e.amount, {
          emergencyFund,
          savings,
          investments: Math.max(0, investedOnce),
        });
        if (res.absorbed && !achievements.includes("Shock Absorbed"))
          achievements.push("Shock Absorbed");
        next = {
          ...next,
          emergencySpent: s.emergencySpent + res.fromEmergencyFund,
          savingsSpent: s.savingsSpent + res.fromSavings,
          investmentsSold: s.investmentsSold + res.fromInvestments,
          debt: s.debt + res.fromDebt,
          events: [{ ...e, result: res }, ...s.events],
          transactions: pushTx(s, { amount: e.amount, category: "life_event", label: e.title }),
        };
      } else if (e.kind === "gain") {
        next = {
          ...next,
          savingsSpent: s.savingsSpent - e.amount,
          events: [{ ...e }, ...s.events],
          transactions: pushTx(s, { amount: e.amount, category: "life_event", label: e.title }),
        };
      } else {
        next = {
          ...next,
          marketFactor: Number((s.marketFactor * (e.marketFactor ?? 1)).toFixed(4)),
          events: [{ ...e }, ...s.events],
          transactions: pushTx(s, { amount: 0, category: "life_event", label: e.title }),
        };
      }

      return { ...next, xp: s.xp + 40, coins: s.coins + 10, achievements };
    });
  }, []);

  const dismissEvent = useCallback(() => setState((s) => ({ ...s, pendingEvent: null })), []);

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

  const derived = useMemo<Derived>(() => {
    const p = state.profile;
    const salary = Math.max(0, (p?.salary ?? 0) + state.salaryDelta);
    const expenses = Math.max(0, (p?.expenses ?? 0) + state.expenseDelta);
    const availableBudget = Math.max(0, salary - expenses);
    const a = state.allocations;
    const allocatedTotal = Object.values(a).reduce((x, y) => x + y, 0);
    const unallocated = Math.max(0, availableBudget - allocatedTotal);

    const onceInvested = Math.max(
      0,
      state.investments.filter((i) => i.mode === "once").reduce((x, i) => x + i.amount, 0) -
        state.investmentsSold,
    );
    const monthlyCommitment = state.investments
      .filter((i) => i.mode === "monthly")
      .reduce((x, i) => x + i.amount, 0);

    const pendingInvestPool = Math.max(0, a.investments - onceInvested);
    const investableNow = Math.max(0, pendingInvestPool + unallocated - monthlyCommitment);
    const emergencyFund = Math.max(
      0,
      (p?.emergencyFund ?? 0) + a.emergencyFund - state.emergencySpent,
    );
    const savingsBalance = Math.max(0, (p?.savings ?? 0) + a.savings - state.savingsSpent);
    const cash = Math.max(0, unallocated - monthlyCommitment);
    const funSpend = a.food + a.entertainment + a.travel + a.shopping;
    const coverage = coverageMonths(emergencyFund, expenses);

    const health = financialHealth({
      salary,
      expenses,
      savingsBalance,
      emergencyFund,
      invested: onceInvested,
      monthlyInvestment: monthlyCommitment,
      allocatedTotal,
      availableBudget,
      funSpend,
      shortfallHits: state.events.filter((e) => (e.result?.fromDebt ?? 0) > 0).length,
      debt: state.debt,
      eventsAbsorbed: state.events.filter((e) => e.result?.absorbed).length,
    });

    const defaultRate = midRate(INVESTMENT_TYPES[0]!);
    const netWorth60 = p
      ? projectedNetWorthAt60({
          age: p.age,
          savingsBalance,
          emergencyFund,
          debt: state.debt,
          lumpsums: state.investments
            .filter((i) => i.mode === "once")
            .map((i) => ({ amount: i.amount, ratePct: i.ratePct })),
          monthly: state.investments
            .filter((i) => i.mode === "monthly")
            .map((i) => ({ amount: i.amount, ratePct: i.ratePct })),
          marketFactor: state.marketFactor,
        })
      : 0;

    const chaptersCleared = state.chapters.filter((c) => c.completed).length;
    const current = CHAPTERS[Math.min(state.currentChapter, CHAPTERS.length - 1)]!;
    const chosen = state.chapters.find((c) => c.id === current.id);
    const canAdvance =
      !!chosen && health.score >= current.minHealth && coverage >= current.minCoverage;

    return {
      salary,
      expenses,
      availableBudget,
      allocatedTotal,
      unallocated,
      cash,
      savingsBalance,
      emergencyFund,
      coverage,
      pendingInvestPool,
      investedTotal: onceInvested,
      monthlyCommitment,
      funSpend,
      investableNow,
      health,
      level: levelFromXp(state.xp),
      netWorth60,
      bestNetWorth: state.runs.reduce((m, r) => Math.max(m, r.netWorth), netWorth60),
      chaptersCleared,
      canAdvance,
      defaultRate,
    } as Derived;
  }, [state]);

  const finishRun = useCallback(() => {
    setState((s) => {
      const summary: RunSummary = {
        id: s.runId,
        runNumber: s.runNumber,
        name: s.profile?.name ?? "Player",
        score: derived.health.score,
        netWorth: Math.round(derived.netWorth60),
        chaptersCleared: derived.chaptersCleared,
        timestamp: Date.now(),
      };
      const runs = [summary, ...s.runs.filter((r) => r.id !== s.runId)].slice(0, 12);
      return { ...freshState(s.runNumber + 1, runs) };
    });
  }, [derived]);

  const resetGame = useCallback(() => {
    setState((s) => freshState(s.runNumber + 1, s.runs));
  }, []);

  /* -------- cloud auto-save -------- */
  useEffect(() => {
    if (!hydrated || !state.profile) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setCloudStatus("saving");
      saveCloudRun({
        runId: state.runId,
        runNumber: state.runNumber,
        profile: state.profile,
        financialState: state,
        chapters: state.chapters,
        events: state.events,
        score: derived.health.score,
        netWorth: Math.round(derived.netWorth60),
      })
        .then((ok) => setCloudStatus(ok ? "saved" : "idle"))
        .catch(() => setCloudStatus("error"));
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, derived, hydrated]);

  const restore = useCallback(async () => {
    const run = await loadCloudRun();
    if (!run) return false;
    setState((s) => ({
      ...s,
      ...(run.financial_state as unknown as GameState),
      allocations: {
        ...emptyAllocations(),
        ...((run.financial_state as unknown as GameState).allocations ?? {}),
      },
    }));
    return true;
  }, []);

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
    chooseChapter,
    completeChapter,
    rollEvent,
    resolveEvent,
    dismissEvent,
    reward,
    finishRun,
    resetGame,
    cloud: { status: cloudStatus, restore },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
