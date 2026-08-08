import { useId, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { formatGroupedNumber, parseNumeric } from "@/lib/finance";
import { cn } from "@/lib/utils";

export function RupeeInput({
  label,
  value,
  onChange,
  step = 1000,
  hint,
  tone = "neutral",
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
  tone?: "neutral" | "warn";
  max?: number;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const clamp = (v: number) => Math.max(0, max !== undefined ? Math.min(v, max) : v);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-muted-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-4xl border-2 bg-card/80 px-2 py-1.5 transition-all",
          focused ? "border-gold shadow-gold" : "border-border shadow-soft",
          tone === "warn" && "border-warning",
        )}
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition hover:bg-gold-soft active:scale-95"
        >
          <Minus className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1 px-1">
          <span className="text-lg font-bold text-gold-deep">₹</span>
          <input
            id={id}
            inputMode="numeric"
            value={formatGroupedNumber(value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(clamp(parseNumeric(e.target.value)))}
            className="w-full min-w-0 bg-transparent text-xl font-extrabold tracking-tight text-foreground outline-none"
            placeholder="0"
          />
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="grid size-9 shrink-0 place-items-center rounded-full gold-fill text-primary-foreground transition hover:brightness-105 active:scale-95"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {hint && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-xs", tone === "warn" ? "text-warning" : "text-muted-foreground")}
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}

export function TextCapsule({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-4xl border-2 border-border bg-card/80 px-5 py-3 text-base font-semibold text-foreground shadow-soft outline-none transition focus:border-gold focus:shadow-gold"
      />
    </div>
  );
}

export function GoldSlider({
  value,
  max,
  onChange,
  ticks = 4,
  ariaLabel,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  ticks?: number;
  ariaLabel: string;
}) {
  const safeMax = Math.max(1, Math.round(max));
  const pct = Math.min(100, (value / safeMax) * 100);
  const step = Math.max(1, Math.round(safeMax / 200));

  return (
    <div className="space-y-2">
      <div className="relative h-10">
        <div className="absolute top-1/2 h-4 w-full -translate-y-1/2 rounded-full bg-muted shadow-inner" />
        <motion.div
          className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full gold-fill shadow-gold"
          style={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        />
        <motion.div
          className="pointer-events-none absolute top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full gold-fill ring-4 ring-card shadow-gold"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          aria-label={ariaLabel}
          min={0}
          max={safeMax}
          step={step}
          value={Math.min(value, safeMax)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
        {Array.from({ length: ticks + 1 }).map((_, i) => (
          <span key={i}>₹{formatGroupedNumber(Math.round((safeMax / ticks) * i))}</span>
        ))}
      </div>
    </div>
  );
}
