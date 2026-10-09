import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Player = { id: string; name: string; score: number };

export function useLeaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("players").select("id, name, score").order("score", { ascending: false }).limit(100);
      setPlayers(data ?? []);
    };
    load();
    const ch = supabase
      .channel("lb")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  return players;
}

export function useGameState() {
  const [state, setState] = useState<{ unlocked: string[]; preview: boolean }>({ unlocked: [], preview: false });
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("game_state").select("unlocked, preview").eq("id", 1).single();
      setState({ unlocked: data?.unlocked ?? ["crossword"], preview: data?.preview ?? false });
    };
    load();
    const ch = supabase
      .channel("gs")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_state" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  return state;
}
