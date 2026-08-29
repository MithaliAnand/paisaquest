import { supabase } from "@/integrations/supabase/client";

export type CloudRunRow = {
  id: string;
  run_number: number;
  profile: unknown;
  financial_state: unknown;
  chapters: unknown;
  events: unknown;
  score: number;
  net_worth_projection: number;
  status: string;
  updated_at: string;
};

export type SavePayload = {
  runId: string;
  runNumber: number;
  profile: unknown;
  financialState: unknown;
  chapters: unknown;
  events: unknown;
  score: number;
  netWorth: number;
};

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Saves (or updates) the active run for the signed-in player. Returns false when signed out. */
export async function saveCloudRun(p: SavePayload): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;

  const { data: existing } = await supabase
    .from("game_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("run_number", p.runNumber)
    .maybeSingle();

  const row = {
    user_id: userId,
    run_number: p.runNumber,
    profile: p.profile as never,
    financial_state: p.financialState as never,
    chapters: p.chapters as never,
    events: p.events as never,
    score: p.score,
    net_worth_projection: p.netWorth,
    status: "active",
  };

  const { error } = existing
    ? await supabase.from("game_runs").update(row).eq("id", existing.id)
    : await supabase.from("game_runs").insert(row);

  if (error) throw error;
  return true;
}

/** Most recently updated run for the signed-in player. */
export async function loadCloudRun(): Promise<CloudRunRow | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from("game_runs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as CloudRunRow | null) ?? null;
}

export async function listCloudRuns(): Promise<CloudRunRow[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("game_runs")
    .select("*")
    .eq("user_id", userId)
    .order("run_number", { ascending: true });
  return (data as CloudRunRow[] | null) ?? [];
}
