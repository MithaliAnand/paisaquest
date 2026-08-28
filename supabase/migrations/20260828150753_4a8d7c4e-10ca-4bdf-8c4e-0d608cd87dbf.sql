CREATE TABLE public.game_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  run_number INTEGER NOT NULL DEFAULT 1,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  financial_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  net_worth_projection NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_runs TO authenticated;
GRANT ALL ON public.game_runs TO service_role;

ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players manage their own runs"
  ON public.game_runs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX game_runs_user_idx ON public.game_runs (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER game_runs_set_updated_at
  BEFORE UPDATE ON public.game_runs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();