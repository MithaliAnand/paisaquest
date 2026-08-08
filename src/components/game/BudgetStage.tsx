import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, ArrowRight } from "lucide-react";
import { useGame } from "@/lib/game-state";
import { buildNotes, CATEGORIES, formatGroupedNumber, formatINR, type CategoryKey } from "@/lib/finance";
import { AnimatedRupee } from "./AnimatedNumber";
import { GoldSlider } from "./Inputs";

type DragState = {
  noteId: string;
  denom: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
} | null;

function noteStyle(denom: number) {
  if (denom >= 2000) return { bg: "oklch(0.9 0.05 300)", ink: "oklch(0.34 0.08 300)" };
  if (denom >= 500) return { bg: "oklch(0.92 0.05 165)", ink: "oklch(0.35 0.09 160)" };
  if (denom >= 200) return { bg: "oklch(0.93 0.06 60)", ink: "oklch(0.36 0.09 55)" };
  return { bg: "oklch(0.93 0.045 20)", ink: "oklch(0.36 0.1 20)" };
}

function NoteFace({ denom, tilt = 0 }: { denom: number; tilt?: number }) {
  const { bg, ink } = noteStyle(denom);
  return (
    <div
      className="relative flex h-24 w-40 select-none flex-col justify-between overflow-hidden rounded-2xl border-2 px-3 py-2 shadow-lift"
      style={{ background: bg, borderColor: ink, transform: `rotate(${tilt}deg)`, color: ink }}
    >
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
        <span>Rupee note</span>
        <span>₹</span>
      </div>
      <div className="text-3xl font-extrabold leading-none tracking-tight">
        ₹{formatGroupedNumber(denom)}
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold opacity-75">
        <span>Drag me to a jar</span>
        <span>₹{formatGroupedNumber(denom)}</span>
      </div>
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-16 rounded-full opacity-25"
        style={{ background: ink }}
      />
    </div>
  );
}

export function BudgetStage() {
  const { state, derived, allocate, setAllocation, resetAllocations, setStage } = useGame();
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverZone, setHoverZone] = useState<CategoryKey | null>(null);
  const [flash, setFlash] = useState<{ key: CategoryKey; amount: number } | null>(null);
  const zoneRefs = useRef(new Map<CategoryKey, HTMLElement>());
  const dragRef = useRef<DragState>(null);
  dragRef.current = drag;

  const remaining = derived.unallocated;
  const notes = useMemo(() => {
    const list = buildNotes(remaining);
    return list.map((denom, i) => ({ id: `${remaining}-${i}`, denom, tilt: ((i % 5) - 2) * 2.5 }));
  }, [remaining]);

  const zoneAt = useCallback((x: number, y: number): CategoryKey | null => {
    let found: CategoryKey | null = null;
    zoneRefs.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) found = key;
    });
    return found;
  }, []);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      setHoverZone(zoneAt(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      const current = dragRef.current;
      const zone = zoneAt(e.clientX, e.clientY);
      if (current && zone) {
        allocate(zone, current.denom);
        setFlash({ key: zone, amount: current.denom });
        window.setTimeout(() => setFlash(null), 900);
      }
      setDrag(null);
      setHoverZone(null);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, zoneAt, allocate]);

  const efMax = derived.unallocated + state.allocations.emergencyFund;

  return (
    <div className="space-y-6" style={{ touchAction: drag ? "none" : undefined }}>
      <section className="glass-card p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">Monthly adventure</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          Where should {state.profile?.name?.split(" ")[0] ?? "your"}&rsquo;s money go?
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Your salary", value: state.profile?.salary ?? 0, tint: "bg-mint/60" },
            { label: "Your expenses", value: state.profile?.expenses ?? 0, tint: "bg-blush/60" },
            { label: "Available to allocate", value: derived.availableBudget, tint: "bg-gold-soft/70" },
          ].map((s) => (
            <div key={s.label} className={`rounded-3xl ${s.tint} px-4 py-3 shadow-soft`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="text-2xl font-extrabold">{formatINR(s.value)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency fund allocator */}
      <section className="glass-card p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-extrabold">🛡️ Build your emergency fund</h3>
          <p className="text-sm font-semibold text-muted-foreground">
            Available budget: {formatINR(derived.availableBudget)}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          How much would you like to keep aside for unexpected moments? It starts at ₹0 — the choice is yours.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() =>
              setAllocation("emergencyFund", Math.max(0, state.allocations.emergencyFund - 500))
            }
            className="size-11 rounded-full bg-muted text-xl font-bold transition hover:bg-gold-soft active:scale-95"
            aria-label="Decrease emergency fund"
          >
            −
          </button>
          <div className="rounded-3xl bg-cream/80 px-6 py-3 shadow-soft">
            <AnimatedRupee value={state.allocations.emergencyFund} className="text-3xl font-extrabold gold-text" />
          </div>
          <button
            onClick={() =>
              setAllocation("emergencyFund", Math.min(efMax, state.allocations.emergencyFund + 500))
            }
            className="size-11 rounded-full gold-fill text-xl font-bold text-primary-foreground shadow-gold transition hover:brightness-105 active:scale-95"
            aria-label="Increase emergency fund"
          >
            +
          </button>
          <div className="ml-auto rounded-2xl bg-sky/60 px-4 py-2 text-sm font-bold">
            Remaining to allocate: {formatINR(derived.unallocated)}
          </div>
        </div>

        <div className="mt-4">
          <GoldSlider
            ariaLabel="Emergency fund allocation"
            value={state.allocations.emergencyFund}
            max={efMax}
            onChange={(v) => setAllocation("emergencyFund", v)}
          />
        </div>
      </section>

      {/* Notes + drop zones */}
      <section className="glass-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold">💸 Drag your notes into a jar</h3>
            <p className="text-sm text-muted-foreground">
              Money lands only where you release it. Drop outside a jar and the note flies home.
            </p>
          </div>
          <button
            onClick={resetAllocations}
            className="flex items-center gap-2 rounded-full border-2 border-border bg-card/70 px-4 py-2 text-sm font-bold transition hover:border-gold"
          >
            <RotateCcw className="size-4" /> Reset allocations
          </button>
        </div>

        <div className="mt-4 rounded-3xl border-2 border-dashed border-gold/40 bg-cream/50 p-4">
          <p className="mb-3 text-sm font-bold text-muted-foreground">
            Unallocated: <span className="gold-text text-lg">{formatINR(remaining)}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {notes.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: drag?.noteId === n.id ? 0.25 : 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
                  onPointerDown={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setDrag({
                      noteId: n.id,
                      denom: n.denom,
                      x: e.clientX,
                      y: e.clientY,
                      offsetX: e.clientX - rect.left,
                      offsetY: e.clientY - rect.top,
                    });
                  }}
                  className="cursor-grab touch-none active:cursor-grabbing"
                >
                  <NoteFace denom={n.denom} tilt={n.tilt} />
                </motion.div>
              ))}
            </AnimatePresence>
            {notes.length === 0 && (
              <p className="py-6 text-sm font-semibold text-muted-foreground">
                Every rupee is allocated 🎉 Reset if you want to plan again.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const active = hoverZone === c.key;
            return (
              <motion.div
                key={c.key}
                ref={(el) => {
                  if (el) zoneRefs.current.set(c.key, el);
                  else zoneRefs.current.delete(c.key);
                }}
                animate={{ scale: active ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative min-h-40 rounded-3xl border-2 p-4 transition-colors ${c.tint} ${
                  active ? "border-gold shadow-gold" : "border-transparent shadow-soft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold uppercase tracking-wide">
                    {c.emoji} {c.label}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">{c.blurb}</p>
                <AnimatedRupee
                  value={state.allocations[c.key]}
                  className="mt-3 block text-3xl font-extrabold text-foreground"
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from({
                    length: Math.min(10, Math.ceil(state.allocations[c.key] / Math.max(1, derived.availableBudget / 20))),
                  }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-3 w-6 rounded-sm gold-fill"
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl bg-card/55"
                    >
                      <span className="rounded-full gold-fill px-4 py-1.5 text-sm font-extrabold text-primary-foreground shadow-gold">
                        Drop here
                      </span>
                    </motion.div>
                  )}
                  {flash?.key === c.key && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: -18 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute right-4 top-4 text-sm font-extrabold text-gold-deep"
                    >
                      +{formatINR(flash.amount)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => setStage("invest")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-4xl gold-fill py-4 text-lg font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105 active:scale-[0.99]"
        >
          Continue to smart investing <ArrowRight className="size-5" />
        </button>
      </section>

      {drag && (
        <div
          className="pointer-events-none fixed z-[60]"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
        >
          <motion.div animate={{ scale: 1.12 }} className="drop-shadow-2xl">
            <NoteFace denom={drag.denom} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
