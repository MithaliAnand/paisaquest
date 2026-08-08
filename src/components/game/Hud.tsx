import { motion } from "motion/react";
import { Coins, HeartPulse, PiggyBank, Shield, Star, TrendingUp, Trophy } from "lucide-react";
import { useGame } from "@/lib/game-state";
import { formatINR, xpIntoLevel } from "@/lib/finance";
import { AnimatedRupee } from "./AnimatedNumber";

function Stat({
  icon,
  label,
  children,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tint: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-3xl ${tint} px-4 py-3 shadow-soft`}>
      <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-card/70 text-gold-deep">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-lg font-extrabold text-foreground">{children}</p>
      </div>
    </div>
  );
}

export function Hud() {
  const { state, derived } = useGame();
  const health = derived.health.score;

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<HeartPulse className="size-5" />} label="Financial health" tint="bg-blush/60">
          {health}/100
        </Stat>
        <Stat icon={<PiggyBank className="size-5" />} label="Wallet cash" tint="bg-mint/60">
          <AnimatedRupee value={derived.cash} />
        </Stat>
        <Stat icon={<TrendingUp className="size-5" />} label="Invested" tint="bg-lavender/60">
          <AnimatedRupee value={derived.investedTotal} />
        </Stat>
        <Stat icon={<Shield className="size-5" />} label="Emergency fund" tint="bg-sky/60">
          <AnimatedRupee value={derived.emergencyFund} />
        </Stat>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Coins className="size-5" />} label="Coins" tint="bg-peach/60">
          {state.coins}
        </Stat>
        <Stat icon={<Star className="size-5" />} label="XP" tint="bg-cream">
          {state.xp}
        </Stat>
        <Stat icon={<Trophy className="size-5" />} label="Level" tint="bg-gold-soft/70">
          {derived.level}
        </Stat>
        <Stat icon={<Trophy className="size-5" />} label="Achievements" tint="bg-mint/50">
          {state.achievements.length}
        </Stat>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted-foreground">
          <span>Level {derived.level} progress</span>
          <span>{xpIntoLevel(state.xp)}/250 XP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full gold-fill"
            animate={{ width: `${(xpIntoLevel(state.xp) / 250) * 100}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 24 }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {derived.health.parts.map((p) => (
          <div key={p.label} className="rounded-2xl bg-card/60 px-3 py-2">
            <div className="flex justify-between text-xs font-bold">
              <span>{p.label}</span>
              <span className="text-gold-deep">
                {p.score}/{p.max}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gold"
                animate={{ width: `${(p.score / p.max) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{p.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletStrip() {
  const { derived, state } = useGame();
  const rows = [
    { label: "Cash", value: derived.cash },
    { label: "Savings", value: derived.savingsBalance },
    { label: "Emergency fund", value: derived.emergencyFund },
    { label: "Investments", value: derived.investedTotal },
    { label: "Available budget", value: derived.availableBudget },
  ];
  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-deep">
        👛 {state.profile?.name ?? "Your"} wallet
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {rows.map((r) => (
          <div key={r.label} className="rounded-2xl bg-cream/70 px-3 py-2 text-center shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {r.label}
            </p>
            <p className="text-base font-extrabold text-foreground">{formatINR(r.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
