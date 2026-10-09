ALTER TABLE public.game_state ADD COLUMN IF NOT EXISTS preview boolean NOT NULL DEFAULT false;
GRANT SELECT ON public.game_state TO anon, authenticated;
GRANT ALL ON public.game_state TO service_role;