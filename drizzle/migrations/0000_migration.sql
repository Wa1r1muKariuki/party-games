CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.game_state (
  id integer PRIMARY KEY DEFAULT 1,
  unlocked text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.game_state (id, unlocked) VALUES (1, '{}');
CREATE TABLE public.answers (
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  qkey text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, qkey)
);
REVOKE ALL ON public.players FROM anon, authenticated;
GRANT SELECT (id, name, score, created_at) ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
GRANT SELECT ON public.game_state TO anon, authenticated;
GRANT ALL ON public.game_state TO service_role;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read players" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read state" ON public.game_state FOR SELECT TO anon, authenticated USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;