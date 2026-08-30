import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { useGame } from "@/lib/game-state";
import {
  CATEGORIES,
  coverageBand,
  formatCrore,
  formatINR,
  formatPercent,
  projectedReturnPct,
} from "@/lib/finance";
import { CHAPTERS } from "@/lib/progression";

export function ReportStage() {
  const { state, derived, resetGame, setStage } = useGame();
  const p = state.profile;
  if (!p) return null;

  const totalContrib = state.investments.reduce((x, i) => x + i.totalContributed, 0);
  const projected = state.investments.reduce((x, i) => x + i.projectedValue, 0);
  const gain = projected - totalContrib;
  const pct = projectedReturnPct(totalContrib, projected);

  const lines: { label: string; value: string }[] = [
    { label: "Starting salary", value: formatINR(p.salary) },
    { label: "Starting savings", value: formatINR(p.savings) },
    { label: "Monthly expenses", value: formatINR(p.expenses) },
    { label: "Available budget", value: formatINR(derived.availableBudget) },
    { label: "Total savings", value: formatINR(derived.savingsBalance) },
    { label: "Emergency fund built", value: formatINR(derived.emergencyFund) },
    { label: "Total invested", value: formatINR(derived.investedTotal) },
    { label: "Monthly investing", value: formatINR(derived.monthlyCommitment) },
    { label: "Total contributions", value: formatINR(totalContrib) },
    { label: "Projected value", value: formatINR(projected) },
    { label: "Projected gain", value: formatINR(gain) },
    { label: "Projected return", value: totalContrib > 0 ? formatPercent(pct) : "—" },
    { label: "Debt taken on", value: formatINR(state.debt) },
    { label: "Emergency coverage", value: `${derived.coverage.toFixed(1)} months` },
    { label: "Emergency strength", value: coverageBand(derived.coverage).label },
    { label: "Projected net worth at 60", value: formatCrore(derived.netWorth60) },
  ];

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 text-center sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Final report</p>
        <h2 className="mt-1 text-3xl font-extrabold">
          {p.name.split(" ")[0]}'s <span className="gold-text">financial adventure</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Goal: {p.goal} · Age {p.age}</p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mt-5 w-fit rounded-4xl bg-cream/80 px-10 py-6 shadow-gold"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Financial health
          </p>
          <p className="text-6xl font-extrabold gold-text">{derived.health.score}</p>
          <p className="text-sm font-semibold text-muted-foreground">out of 100</p>
        </motion.div>
      </section>

      <section className="glass-card p-5 sm:p-7">
        <h3 className="text-xl font-extrabold">Your numbers</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((l) => (
            <div key={l.label} className="rounded-2xl bg-cream/70 px-4 py-3 shadow-soft">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {l.label}
              </p>
              <p className="text-lg font-extrabold">{l.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass-card p-5">
          <h3 className="text-lg font-extrabold">Where your money went</h3>
          <ul className="mt-3 space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.key} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm font-bold">
                  {c.emoji} {c.label}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full gold-fill"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        derived.availableBudget > 0
                          ? (state.allocations[c.key] / derived.availableBudget) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="w-24 text-right text-sm font-extrabold">
                  {formatINR(state.allocations[c.key])}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-5">
          <h3 className="text-lg font-extrabold">Choices & rewards</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>🪙 {state.coins} coins</Chip>
            <Chip>⭐ {state.xp} XP</Chip>
            <Chip>🏆 Level {derived.level}</Chip>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No achievements yet — keep playing!</p>
            ) : (
              state.achievements.map((a) => <Chip key={a}>🎖️ {a}</Chip>)
            )}
          </div>
          <h4 className="mt-4 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Life events faced
          </h4>
          <ul className="mt-2 space-y-2">
            {state.scenarios.length === 0 && (
              <li className="text-sm text-muted-foreground">None yet.</li>
            )}
            {state.scenarios.map((s) => (
              <li key={s.id} className="rounded-2xl bg-cream/70 px-4 py-2 text-sm font-semibold">
                {s.title} — cost {formatINR(s.cost)},{" "}
                {s.shortfall === 0 ? "fully absorbed by your fund ✅" : `shortfall ${formatINR(s.shortfall)} ⚠️`}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-card p-5">
        <h3 className="text-lg font-extrabold">Key decisions timeline</h3>
        <ol className="mt-3 space-y-2">
          {state.chapters.length === 0 && (
            <li className="text-sm text-muted-foreground">No chapters played yet.</li>
          )}
          {state.chapters.map((c) => {
            const def = CHAPTERS.find((x) => x.id === c.id);
            return (
              <li key={c.id} className="rounded-2xl bg-cream/70 px-4 py-2 text-sm font-semibold">
                <span className="font-extrabold">
                  {def?.emoji} {def?.title}
                </span>{" "}
                — {c.choiceLabel} {c.completed ? "✅" : "⏳"}
              </li>
            );
          })}
          {state.events.map((e) => (
            <li key={e.id} className="rounded-2xl bg-blush/40 px-4 py-2 text-sm font-semibold">
              <span className="font-extrabold">
                {e.emoji} {e.title}
              </span>
              {e.result
                ? ` — ${formatINR(e.result.cost)}, ${e.result.absorbed ? "absorbed by your fund" : "needed extra money"}`
                : e.kind === "gain"
                  ? ` — ${formatINR(e.amount)} received`
                  : ` — market moved ${(((e.marketFactor ?? 1) - 1) * 100).toFixed(1)}%`}
            </li>
          ))}
        </ol>
      </section>

      <section className="glass-card p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Projected net worth at 60
        </p>
        <p className="text-5xl font-extrabold gold-text">{formatCrore(derived.netWorth60)}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Can you reach ₹5 Cr by retirement? Start a new run and try a different path.
        </p>
      </section>

      <section className="glass-card p-5">
        <h3 className="text-lg font-extrabold">Transaction history</h3>
        <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto no-scrollbar">
          {state.transactions.map((t) => (
            <li key={t.id} className="flex justify-between rounded-2xl bg-cream/60 px-4 py-2 text-sm">
              <span className="font-semibold">{t.label}</span>
              <span className="font-extrabold">{formatINR(t.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStage("budget")}
          className="flex-1 rounded-4xl border-2 border-gold bg-card/80 py-4 font-extrabold shadow-soft transition hover:shadow-gold"
        >
          Keep playing
        </button>
        <button
          onClick={resetGame}
          className="flex items-center justify-center gap-2 rounded-4xl bg-muted px-6 py-4 font-extrabold text-muted-foreground transition hover:bg-blush"
        >
          <RefreshCw className="size-4" /> Start a new journey
        </button>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gold-soft/70 px-4 py-1.5 text-sm font-extrabold text-foreground shadow-soft">
      {children}
    </span>
  );
}
