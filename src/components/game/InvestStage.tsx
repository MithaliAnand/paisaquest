import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Info, RotateCcw } from "lucide-react";
import { useGame } from "@/lib/game-state";
import {
  formatINR,
  futureValueLumpsum,
  futureValueMonthly,
  INVESTMENT_TYPES,
  midRate,
  projectedReturnPct,
  type InvestmentType,
} from "@/lib/finance";
import { AnimatedPercent, AnimatedRupee } from "./AnimatedNumber";
import { GoldSlider } from "./Inputs";

const DURATIONS = [1, 3, 5, 10];

function CardBack({ t, onClose }: { t: InvestmentType; onClose: () => void }) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-3xl bg-card/90 p-4 text-left">
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-extrabold">{t.name}</h4>
        <button
          onClick={onClose}
          className="rounded-full bg-muted px-3 py-1 text-xs font-bold transition hover:bg-gold-soft"
        >
          Back
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
        <div className="rounded-2xl bg-mint/60 p-2">
          Risk<br />
          <span className="text-sm">{t.risk}</span>
        </div>
        <div className="rounded-2xl bg-peach/60 p-2">
          Return<br />
          <span className="text-sm">
            {t.rateLow}–{t.rateHigh}%
          </span>
        </div>
        <div className="rounded-2xl bg-sky/60 p-2">
          Horizon<br />
          <span className="text-sm">{t.horizon}</span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-bold text-foreground">What is it? </span>
        {t.what}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-bold text-foreground">How it works: </span>
        {t.how}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-bold text-foreground">Keep in mind: </span>
        {t.considerations}
      </p>
    </div>
  );
}

export function InvestStage() {
  const { state, derived, addInvestment, setStage } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [mode, setMode] = useState<"once" | "monthly">("once");
  const [amount, setAmount] = useState(0);
  const [years, setYears] = useState(5);

  const type = INVESTMENT_TYPES.find((t) => t.id === selected) ?? null;
  const rate = type ? midRate(type) : 0;

  const maxOnce = Math.round(derived.investableNow);
  const maxMonthly = Math.round(Math.max(0, derived.availableBudget - derived.monthlyCommitment));
  const max = mode === "once" ? maxOnce : maxMonthly;

  const projection = useMemo(() => {
    if (!type || amount <= 0) return { invested: 0, future: 0, gain: 0, pct: 0 };
    const invested = mode === "once" ? amount : amount * years * 12;
    const future =
      mode === "once" ? futureValueLumpsum(amount, rate, years) : futureValueMonthly(amount, rate, years);
    return { invested, future, gain: future - invested, pct: projectedReturnPct(invested, future) };
  }, [type, amount, mode, years, rate]);

  const timeline = useMemo(() => {
    if (!type || amount <= 0) return [];
    const marks = [0, 1, 3, years].filter((v, i, arr) => v <= years && arr.indexOf(v) === i);
    return marks.map((y) => {
      const invested = mode === "once" ? amount : amount * Math.max(1, y) * 12;
      const value =
        y === 0
          ? mode === "once"
            ? amount
            : amount
          : mode === "once"
            ? futureValueLumpsum(amount, rate, y)
            : futureValueMonthly(amount, rate, y);
      return {
        label: y === 0 ? "TODAY" : `${y} YEAR${y > 1 ? "S" : ""}`,
        value,
        pct: projectedReturnPct(y === 0 ? value : invested, value),
      };
    });
  }, [type, amount, mode, years, rate]);

  return (
    <div className="space-y-6">
      <section className="glass-card p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Smart investing</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Pick a path for your money 📈</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap ⓘ on any card to learn how it works. Nothing is invested until you choose an amount and confirm.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTMENT_TYPES.map((t) => {
            const isFlipped = flipped === t.id;
            const isSelected = selected === t.id;
            return (
              <div key={t.id} className="[perspective:1200px]">
                <motion.div
                  className="relative h-56 [transform-style:preserve-3d]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                >
                  <div
                    className={`absolute inset-0 rounded-3xl border-2 p-4 text-left [backface-visibility:hidden] ${t.tint} ${
                      isSelected ? "border-gold shadow-gold" : "border-transparent shadow-soft"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{t.emoji}</span>
                      <button
                        aria-label={`About ${t.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlipped(t.id);
                        }}
                        className="grid size-8 place-items-center rounded-full bg-card/70 text-muted-foreground transition hover:text-gold-deep"
                      >
                        <Info className="size-4" />
                      </button>
                    </div>
                    <h4 className="mt-2 text-lg font-extrabold">{t.name}</h4>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Risk {t.risk} · {t.rateLow}–{t.rateHigh}% · {t.horizon}
                    </p>
                    <button
                      onClick={() => {
                        setSelected(t.id);
                        setAmount(0);
                      }}
                      className={`mt-4 w-full rounded-2xl py-2.5 text-sm font-extrabold transition ${
                        isSelected
                          ? "gold-fill text-primary-foreground shadow-gold"
                          : "bg-card/70 text-foreground hover:bg-card"
                      }`}
                    >
                      {isSelected ? "Selected" : "Choose this"}
                    </button>
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <CardBack t={t} onClose={() => setFlipped(null)} />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {type && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-5 sm:p-7"
          >
            <h3 className="text-xl font-extrabold">How much would you like to invest?</h3>

            <div className="mt-3 flex gap-2">
              {(["once", "monthly"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setAmount(0);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    mode === m ? "gold-fill text-primary-foreground shadow-gold" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m === "once" ? "One-time investment" : "Monthly investment"}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {mode === "once" ? "Investment amount" : "Amount each month"}
            </p>
            <AnimatedRupee value={amount} className="block text-5xl font-extrabold gold-text" />
            <p className="text-xs font-semibold text-muted-foreground">
              Maximum available: {formatINR(max)}
            </p>

            <div className="mt-4">
              <GoldSlider ariaLabel="Investment amount" value={amount} max={max} onChange={setAmount} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Duration:</span>
              {DURATIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`rounded-full px-4 py-1.5 text-sm font-extrabold transition ${
                    years === y ? "gold-fill text-primary-foreground shadow-gold" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {y} yr{y > 1 ? "s" : ""}
                </button>
              ))}
              <button
                onClick={() => setAmount(0)}
                className="ml-auto flex items-center gap-1 rounded-full border-2 border-border px-3 py-1.5 text-xs font-bold transition hover:border-gold"
              >
                <RotateCcw className="size-3" /> Clear
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                {
                  label: mode === "once" ? "Invested" : "Estimated contributions",
                  node: <AnimatedRupee value={projection.invested} />,
                  tint: "bg-mint/60",
                },
                { label: "Projected value", node: <AnimatedRupee value={projection.future} />, tint: "bg-gold-soft/70" },
                { label: "Projected gain", node: <AnimatedRupee value={projection.gain} />, tint: "bg-peach/60" },
                {
                  label: "Projected return",
                  node: <AnimatedPercent value={projection.pct} />,
                  tint: "bg-lavender/60",
                },
              ].map((c) => (
                <div key={c.label} className={`rounded-3xl ${c.tint} px-4 py-3 shadow-soft`}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="text-xl font-extrabold">{c.node}</p>
                </div>
              ))}
            </div>

            {timeline.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-extrabold">🔮 Future mirror</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {timeline.map((t) => (
                    <motion.div
                      key={t.label}
                      layout
                      className="rounded-3xl border-2 border-gold/30 bg-cream/70 p-4 text-center shadow-soft"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t.label}
                      </p>
                      <AnimatedRupee value={t.value} className="block text-2xl font-extrabold" />
                      <AnimatedPercent value={t.pct} className="text-xs font-bold text-gold-deep" />
                    </motion.div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] italic text-muted-foreground">
                  Illustrative projection at {rate}% assumed annual return — actual returns may vary.
                </p>
              </div>
            )}

            <button
              disabled={amount <= 0}
              onClick={() => {
                addInvestment({
                  typeId: type.id,
                  typeName: type.name,
                  mode,
                  amount,
                  years,
                  ratePct: rate,
                  projectedValue: projection.future,
                  totalContributed: projection.invested,
                });
                setAmount(0);
              }}
              className="mt-6 w-full rounded-4xl gold-fill py-4 text-lg font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {amount > 0
                ? `Invest ${formatINR(amount)}${mode === "monthly" ? " / month" : ""}`
                : "Choose an amount to invest"}
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {state.investments.length > 0 && (
        <section className="glass-card p-5">
          <h3 className="text-lg font-extrabold">Your investment history</h3>
          <ul className="mt-3 space-y-2">
            {state.investments.map((i) => (
              <li key={i.id} className="flex flex-wrap justify-between gap-2 rounded-2xl bg-cream/70 px-4 py-2">
                <span className="font-bold">
                  {i.typeName} · {i.mode === "monthly" ? `${formatINR(i.amount)}/month` : formatINR(i.amount)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {i.years} yrs @ {i.ratePct}% → {formatINR(i.projectedValue)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={() => setStage("scenario")}
        className="flex w-full items-center justify-center gap-2 rounded-4xl border-2 border-gold bg-card/80 py-4 text-lg font-extrabold text-foreground shadow-soft transition hover:shadow-gold"
      >
        Continue to life events <ArrowRight className="size-5" />
      </button>
    </div>
  );
}
