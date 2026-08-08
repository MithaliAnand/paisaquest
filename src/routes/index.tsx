import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { CoinBackground } from "@/components/game/CoinBackground";
import { ProfileDialog } from "@/components/game/ProfileDialog";
import { Hud, WalletStrip } from "@/components/game/Hud";
import { BudgetStage } from "@/components/game/BudgetStage";
import { InvestStage } from "@/components/game/InvestStage";
import { ScenarioStage } from "@/components/game/ScenarioStage";
import { ReportStage } from "@/components/game/ReportStage";
import { GameProvider, useGame, type Stage } from "@/lib/game-state";

const TITLE = "Paisa Quest — Your Personalised Money Adventure";
const DESC =
  "A pastel financial adventure game where your own salary, savings and choices drive every budget, emergency fund and investment projection.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <GameProvider>
      <GameShell />
    </GameProvider>
  ),
});

const NAV: { key: Stage; label: string }[] = [
  { key: "budget", label: "Budget" },
  { key: "invest", label: "Invest" },
  { key: "scenario", label: "Life events" },
  { key: "report", label: "Report" },
];

function GameShell() {
  const { state, setStage } = useGame();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <CoinBackground />
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Paisa <span className="gold-text">Quest</span> 🪙
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Your money. Your choices. Your adventure.
            </p>
          </div>
          {state.profile && (
            <nav className="flex flex-wrap gap-2">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setStage(n.key)}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    state.stage === n.key
                      ? "gold-fill text-primary-foreground shadow-gold"
                      : "bg-card/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          )}
        </header>

        {!state.profile ? (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4 text-6xl"
            >
              🪙
            </motion.div>
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              A financial adventure built from <span className="gold-text">your</span> numbers
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm font-semibold text-muted-foreground">
              Nothing is pre-filled and nothing moves on its own. You decide every rupee that goes to
              savings, your emergency fund, investments and everyday joy — then watch how it plays out.
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-7 rounded-4xl gold-fill px-10 py-4 text-lg font-extrabold text-primary-foreground shadow-gold transition hover:brightness-105 active:scale-[0.98]"
            >
              START ADVENTURE
            </button>
          </motion.section>
        ) : (
          <>
            <Hud />
            <WalletStrip />
            <AnimatePresence mode="wait">
              <motion.div
                key={state.stage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {state.stage === "invest" && <InvestStage />}
                {state.stage === "scenario" && <ScenarioStage />}
                {state.stage === "report" && <ReportStage />}
                {(state.stage === "budget" || state.stage === "landing") && <BudgetStage />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      <ProfileDialog open={dialogOpen && !state.profile} onClose={() => setDialogOpen(false)} />
    </main>
  );
}
