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

export function useUnlocked() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("game_state").select("unlocked").eq("id", 1).single();
      setUnlocked(data?.unlocked ?? []);
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
  return unlocked;
}
