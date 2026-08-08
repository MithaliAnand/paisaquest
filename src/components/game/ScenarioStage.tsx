import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useGame } from "@/lib/game-state";
import { formatINR } from "@/lib/finance";
import { AnimatedRupee } from "./AnimatedNumber";

type Scenario = {
  id: string;
  title: string;
  intro: string;
  emoji: string;
  cost: number;
};

export function ScenarioStage() {
  const { state, derived, recordScenario, setStage } = useGame();
  const [revealed, setRevealed] = useState<string | null>(null);

  const scenarios = useMemo<Scenario[]>(() => {
    const expenses = state.profile?.expenses ?? 0;
    const salary = state.profile?.salary ?? 0;
    // Costs are derived from the player's own financial scale, never hardcoded.
    const seed = ((salary % 7) + 3) / 10; // 0.3 – 0.9 variability from the profile
    return [
      {
        id: "medical",
        title: "Unexpected medical emergency",
        intro: "Two months later…",
        emoji: "🏥",
        cost: Math.round(((expenses * 0.5 + salary * 0.2) * (0.8 + seed)) / 100) * 100,
      },
      {
        id: "device",
        title: "Your laptop gives up",
        intro: "A few weeks after that…",
        emoji: "💻",
        cost: Math.round((salary * 0.35 * (0.7 + seed)) / 100) * 100,
      },
      {
        id: "bonus",
        title: "Surprise festive bonus",
        intro: "Then something lovely happens…",
        emoji: "🎁",
        cost: 0,
      },
    ];
  }, [state.profile]);

  const done = new Set(state.scenarios.map((s) => s.title));

  return (
    <div className="space-y-6">
      <section className="glass-card p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Life happens</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Your choices meet the real world 🌦️</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These events check the emergency fund you actually built — {formatINR(derived.emergencyFund)} right now.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {scenarios.map((sc) => {
          const covered = Math.min(derived.emergencyFund, sc.cost);
          const shortfall = Math.max(0, sc.cost - derived.emergencyFund);
          const isDone = done.has(sc.title);
          const isOpen = revealed === sc.id;

          return (
            <motion.div key={sc.id} layout className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{sc.intro}</p>
              <h3 className="mt-1 text-xl font-extrabold">
                {sc.emoji} {sc.title}
              </h3>
              {sc.cost > 0 ? (
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  Required: <span className="text-2xl font-extrabold gold-text">{formatINR(sc.cost)}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  A bonus of <span className="font-extrabold text-success">{formatINR(Math.round((state.profile?.salary ?? 0) * 0.25))}</span> lands in your account.
                </p>
              )}

              {!isDone && (
                <button
                  onClick={() => {
                    setRevealed(sc.id);
                    recordScenario({
                      title: sc.title,
                      cost: sc.cost,
                      coveredByFund: covered,
                      shortfall,
                    });
                  }}
                  className="mt-4 w-full rounded-3xl gold-fill py-3 font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105"
                >
                  Face this moment
                </button>
              )}

              <AnimatePresence>
                {(isDone || isOpen) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-2 overflow-hidden"
                  >
                    {sc.cost > 0 ? (
                      <>
                        <Row label="Emergency fund before" value={derived.emergencyFund + covered} />
                        <Row label="Cost of the event" value={sc.cost} />
                        {shortfall === 0 ? (
                          <>
                            <Row label="Remaining emergency fund" value={derived.emergencyFund} />
                            <p className="rounded-2xl bg-mint/60 p-3 text-sm font-semibold">
                              Your emergency fund absorbed the whole shock — no borrowing, no stress. This is
                              exactly what that money was for. 🌿
                            </p>
                          </>
                        ) : (
                          <>
                            <Row label="Shortfall" value={shortfall} tone="warn" />
                            <p className="rounded-2xl bg-blush/60 p-3 text-sm font-semibold">
                              Your fund covered {formatINR(covered)}. The remaining {formatINR(shortfall)} had to
                              come out of savings, which slows your goal down. A bigger cushion would have
                              softened this.
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="rounded-2xl bg-gold-soft/70 p-3 text-sm font-semibold">
                        Windfalls are a chance to top up the cushion or invest — you decide where it goes back on
                        the budgeting screen.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setStage("report")}
        className="flex w-full items-center justify-center gap-2 rounded-4xl gold-fill py-4 text-lg font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105"
      >
        See my adventure report <ArrowRight className="size-5" />
      </button>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-cream/70 px-4 py-2">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <AnimatedRupee
        value={value}
        className={`text-lg font-extrabold ${tone === "warn" ? "text-warning" : "text-foreground"}`}
      />
    </div>
  );
}
