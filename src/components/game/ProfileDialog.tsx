import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { RupeeInput, TextCapsule } from "./Inputs";
import { AnimatedRupee } from "./AnimatedNumber";
import { useGame, type Profile } from "@/lib/game-state";

const GOALS = [
  "Build a safety net 🛡️",
  "Buy a home 🏡",
  "Travel the world ✈️",
  "Early retirement 🌴",
  "Fund my studies 🎓",
  "Grow long-term wealth 🌱",
];

export function ProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setProfile, state } = useGame();
  const [name, setName] = useState(state.profile?.name ?? "");
  const [age, setAge] = useState(state.profile?.age ?? 24);
  const [salary, setSalary] = useState(state.profile?.salary ?? 0);
  const [savings, setSavings] = useState(state.profile?.savings ?? 0);
  const [expenses, setExpenses] = useState(state.profile?.expenses ?? 0);
  const [emergencyFund, setEmergencyFund] = useState(state.profile?.emergencyFund ?? 0);
  const [goal, setGoal] = useState(state.profile?.goal ?? GOALS[0]!);

  const available = salary - expenses;
  const overspending = expenses > salary;
  const months = coverageMonths(emergencyFund, expenses);
  const band = coverageBand(months);
  const canStart = name.trim().length > 1 && salary > 0 && !overspending;

  const message = useMemo(() => {
    if (overspending) return "Your expenses are higher than your salary right now 🌱 Try adjusting the numbers.";
    if (salary === 0) return "Add your monthly salary to begin your adventure ✨";
    if (available === 0) return "Every rupee is spoken for 🌱 Free up a little to play with.";
    return "Lovely — this is the money your adventure will work with.";
  }, [overspending, salary, available]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/25 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-label="Create your financial profile"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="glass-card my-8 w-full max-w-xl p-6 sm:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-deep">
                  <Sparkles className="size-4" /> Your financial profile
                </p>
                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                  Tell us about <span className="gold-text">your money</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-blush"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextCapsule label="Full name" value={name} onChange={setName} placeholder="Ananya Sharma" />
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-muted-foreground">Age</p>
                <div className="flex items-center gap-2 rounded-4xl border-2 border-border bg-card/80 px-2 py-1.5 shadow-soft">
                  <button
                    type="button"
                    aria-label="Decrease age"
                    onClick={() => setAge((a) => Math.max(15, a - 1))}
                    className="size-9 rounded-full bg-muted font-bold transition hover:bg-gold-soft active:scale-95"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-xl font-extrabold">{age}</span>
                  <button
                    type="button"
                    aria-label="Increase age"
                    onClick={() => setAge((a) => Math.min(90, a + 1))}
                    className="size-9 rounded-full gold-fill font-bold text-primary-foreground transition hover:brightness-105 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <RupeeInput label="Monthly salary" value={salary} onChange={setSalary} step={5000} />
              <RupeeInput label="Current savings" value={savings} onChange={setSavings} step={5000} />
              <RupeeInput
                label="Monthly expenses"
                value={expenses}
                onChange={setExpenses}
                step={2500}
                tone={overspending ? "warn" : "neutral"}
              />

              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-sm font-semibold text-muted-foreground">Financial goal</p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                        goal === g
                          ? "border-gold gold-fill text-primary-foreground shadow-gold"
                          : "border-border bg-card/70 text-muted-foreground hover:border-gold"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.div layout className="mt-6 rounded-3xl border border-gold/30 bg-cream/70 p-5 text-center shadow-soft">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Available after expenses
              </p>
              <AnimatedRupee
                value={Math.max(0, available)}
                className="mt-1 block text-4xl font-extrabold gold-text"
              />
              <p className={`mt-2 text-sm font-semibold ${overspending ? "text-warning" : "text-muted-foreground"}`}>
                {message}
              </p>
            </motion.div>

            <button
              disabled={!canStart}
              onClick={() =>
                setProfile({ name: name.trim(), age, salary, savings, expenses, goal } as Profile)
              }
              className="mt-5 w-full rounded-4xl gold-fill py-4 text-lg font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Begin my adventure ✨
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
