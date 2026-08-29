import { AnimatePresence, motion } from "motion/react";
import { Check, Dices, Lock, Unlock } from "lucide-react";
import { useGame } from "@/lib/game-state";
import { CHAPTERS } from "@/lib/progression";
import { coverageBand, formatCrore, formatINR } from "@/lib/finance";

export function ChapterTrack() {
  const { state, derived } = useGame();
  return (
    <section className="glass-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Chapter progress</p>
        <p className="text-xs font-bold text-muted-foreground">
          Projected net worth at 60:{" "}
          <span className="gold-text text-sm">{formatCrore(derived.netWorth60)}</span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {CHAPTERS.map((c, i) => {
          const prog = state.chapters.find((x) => x.id === c.id);
          const unlocked = i <= state.currentChapter;
          return (
            <div key={c.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold ${
                  prog?.completed
                    ? "border-success bg-mint/60"
                    : unlocked
                      ? "border-gold gold-fill text-primary-foreground shadow-gold"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.title}</span>
                {prog?.completed ? (
                  <Check className="size-4" />
                ) : unlocked ? (
                  <Unlock className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
              </div>
              {i < CHAPTERS.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ChapterStage() {
  const { state, derived, chooseChapter, completeChapter, rollEvent, resolveEvent } = useGame();
  const p = state.profile;
  if (!p) return null;

  const chapter = CHAPTERS[Math.min(state.currentChapter, CHAPTERS.length - 1)]!;
  const progress = state.chapters.find((c) => c.id === chapter.id);
  const choices = chapter.choices({ salary: derived.salary, expenses: derived.expenses });
  const band = coverageBand(derived.coverage);
  const pending = state.pendingEvent;

  return (
    <div className="space-y-6">
      <ChapterTrack />

      <section className="glass-card p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">
          Chapter {state.currentChapter + 1} of {CHAPTERS.length}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          {chapter.emoji} {chapter.title}
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{chapter.tagline}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Fact label="Monthly income now" value={formatINR(derived.salary)} />
          <Fact label="Monthly expenses now" value={formatINR(derived.expenses)} />
          <Fact label="Emergency cover" value={`${derived.coverage.toFixed(1)} months · ${band.label}`} />
        </div>

        {!progress ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {choices.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ y: -4 }}
                onClick={() =>
                  chooseChapter(chapter.id, c.id, c.label, {
                    salaryDelta: c.salaryDelta,
                    expenseDelta: c.expenseDelta,
                    oneTime: c.oneTime,
                  })
                }
                className="rounded-3xl border-2 border-border bg-card/80 p-4 text-left shadow-soft transition hover:border-gold hover:shadow-gold"
              >
                <p className="text-base font-extrabold">{c.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <div className="mt-3 space-y-1 text-xs font-bold">
                  {c.oneTime > 0 && <p>One-off cost: {formatINR(c.oneTime)}</p>}
                  {c.expenseDelta !== 0 && (
                    <p>
                      Monthly expenses {c.expenseDelta > 0 ? "+" : "−"}
                      {formatINR(Math.abs(c.expenseDelta))}
                    </p>
                  )}
                  {c.salaryDelta !== 0 && (
                    <p>
                      Monthly income {c.salaryDelta > 0 ? "+" : "−"}
                      {formatINR(Math.abs(c.salaryDelta))}
                    </p>
                  )}
                  {c.oneTime === 0 && c.expenseDelta === 0 && c.salaryDelta === 0 && (
                    <p>No direct change to your monthly numbers.</p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="rounded-3xl bg-cream/70 px-5 py-4 text-sm font-semibold shadow-soft">
              You chose: <span className="font-extrabold">{progress.choiceLabel}</span>. Your budget,
              investments and cushion now have to carry that decision.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Gate
                ok={derived.health.score >= chapter.minHealth}
                label={`Financial health ${derived.health.score} / needs ${chapter.minHealth}`}
              />
              <Gate
                ok={derived.coverage >= chapter.minCoverage}
                label={`Emergency cover ${derived.coverage.toFixed(1)} mo / needs ${chapter.minCoverage} mo`}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={rollEvent}
                disabled={!!pending}
                className="flex items-center gap-2 rounded-4xl border-2 border-gold bg-card/80 px-6 py-3 font-extrabold shadow-soft transition hover:shadow-gold disabled:opacity-50"
              >
                <Dices className="size-4" /> Let life happen
              </button>
              {!progress.completed && (
                <button
                  onClick={() => completeChapter(chapter.id)}
                  disabled={!derived.canAdvance}
                  className="flex-1 rounded-4xl gold-fill py-3 font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {derived.canAdvance
                    ? "Complete chapter & unlock the next one"
                    : "Strengthen your finances to unlock the next chapter"}
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {pending && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card border-2 border-gold p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">
              Unplanned moment
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">
              {pending.emoji} {pending.title}
            </h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{pending.narrative}</p>
            <p className="mt-3 text-lg font-extrabold">
              {pending.kind === "cost" && `Amount needed: ${formatINR(pending.amount)}`}
              {pending.kind === "gain" && `Amount received: ${formatINR(pending.amount)}`}
              {pending.kind === "market" &&
                `Your invested money is re-priced by ${(((pending.marketFactor ?? 1) - 1) * 100).toFixed(1)}%`}
            </p>
            <button
              onClick={resolveEvent}
              className="mt-4 w-full rounded-4xl gold-fill py-3 font-extrabold text-primary-foreground shadow-gold"
            >
              Face it with what you actually have
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {state.events.length > 0 && (
        <section className="glass-card p-5">
          <h3 className="text-lg font-extrabold">Event history</h3>
          <ul className="mt-3 space-y-2">
            {state.events.map((e) => (
              <li key={e.id} className="rounded-2xl bg-cream/70 px-4 py-3 text-sm font-semibold">
                <span className="font-extrabold">
                  {e.emoji} {e.title}
                </span>
                {e.result ? (
                  <span>
                    {" "}
                    — {formatINR(e.result.cost)} met with{" "}
                    {formatINR(e.result.fromEmergencyFund)} from your emergency fund
                    {e.result.fromSavings > 0 && `, ${formatINR(e.result.fromSavings)} from savings`}
                    {e.result.fromInvestments > 0 &&
                      `, ${formatINR(e.result.fromInvestments)} by selling investments`}
                    {e.result.fromDebt > 0 && `, ${formatINR(e.result.fromDebt)} borrowed`}.
                  </span>
                ) : e.kind === "gain" ? (
                  <span> — {formatINR(e.amount)} added to your savings.</span>
                ) : (
                  <span>
                    {" "}
                    — invested value re-priced by {(((e.marketFactor ?? 1) - 1) * 100).toFixed(1)}%.
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream/70 px-4 py-3 shadow-soft">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}

function Gate({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm font-extrabold shadow-soft ${
        ok ? "bg-mint/60" : "bg-blush/60"
      }`}
    >
      {ok ? "✅ " : "⏳ "}
      {label}
    </div>
  );
}
