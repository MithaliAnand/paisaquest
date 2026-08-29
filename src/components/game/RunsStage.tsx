import { useState } from "react";
import { Share2, Trophy } from "lucide-react";
import { useGame } from "@/lib/game-state";
import { formatCrore } from "@/lib/finance";
import { CHAPTERS } from "@/lib/progression";

export function RunsStage() {
  const { state, derived, finishRun } = useGame();
  const [copied, setCopied] = useState(false);

  const runs = [
    {
      id: state.runId,
      runNumber: state.runNumber,
      name: state.profile?.name ?? "You",
      score: derived.health.score,
      netWorth: Math.round(derived.netWorth60),
      chaptersCleared: derived.chaptersCleared,
      timestamp: Date.now(),
      live: true,
    },
    ...state.runs.map((r) => ({ ...r, live: false })),
  ];

  const best = runs.reduce((m, r) => Math.max(m, r.netWorth), 0);

  const share = async () => {
    const text = `Paisa Quest — ${state.profile?.name ?? "I"} finished with a financial health score of ${derived.health.score}/100 and a projected net worth of ${formatCrore(derived.netWorth60)} at 60. Can you beat it?`;
    try {
      if (navigator.share) await navigator.share({ text, title: "Paisa Quest" });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* sharing cancelled */
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass-card p-5 text-center sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-deep">The challenge</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          Can you reach <span className="gold-text">₹5 Cr</span> by retirement?
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Best projected net worth so far: <span className="gold-text">{formatCrore(best)}</span>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={share}
            className="flex items-center gap-2 rounded-4xl gold-fill px-6 py-3 font-extrabold text-primary-foreground shadow-gold"
          >
            <Share2 className="size-4" /> {copied ? "Copied!" : "Share my result"}
          </button>
          <button
            onClick={finishRun}
            className="rounded-4xl border-2 border-gold bg-card/80 px-6 py-3 font-extrabold shadow-soft transition hover:shadow-gold"
          >
            Bank this run & start a new one
          </button>
        </div>
      </section>

      <section className="glass-card p-5">
        <h3 className="flex items-center gap-2 text-lg font-extrabold">
          <Trophy className="size-5 text-gold-deep" /> Your playthroughs
        </h3>
        <ul className="mt-3 space-y-2">
          {runs.map((r) => (
            <li
              key={r.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                r.netWorth === best ? "bg-gold-soft/70" : "bg-cream/70"
              }`}
            >
              <span className="font-extrabold">
                Run #{r.runNumber} {r.live && <span className="text-xs font-bold">(in progress)</span>}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                {r.chaptersCleared}/{CHAPTERS.length} chapters · health {r.score}/100
              </span>
              <span className="text-lg font-extrabold gold-text">{formatCrore(r.netWorth)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
