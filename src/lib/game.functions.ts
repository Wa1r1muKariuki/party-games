import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findQuestion, grade, ROUNDS } from "./game-content";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function checkPin(pin: string) {
  if (!process.env["HOST_PIN"] || pin !== process.env["HOST_PIN"]) throw new Error("Wrong PIN");
}

export const joinGame = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ name: z.string().trim().min(1).max(24) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row, error } = await db
      .from("players")
      .insert({ name: data.name })
      .select("id, token, name")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const myAnswers = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ playerId: z.string().uuid(), token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: p } = await db.from("players").select("id").eq("id", data.playerId).eq("token", data.token).maybeSingle();
    if (!p) return { valid: false, answers: [] as { qkey: string; points: number }[] };
    const { data: rows } = await db.from("answers").select("qkey, points").eq("player_id", data.playerId);
    return { valid: true, answers: rows ?? [] };
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      playerId: z.string().uuid(),
      token: z.string().uuid(),
      qkey: z.string().max(20),
      value: z.string().max(60),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const found = findQuestion(data.qkey);
    if (!found) throw new Error("Unknown question");
    const { data: state } = await db.from("game_state").select("unlocked").eq("id", 1).single();
    if (!state?.unlocked.includes(found.round.id)) throw new Error("Round is locked");
    const { data: p } = await db
      .from("players")
      .select("id, score")
      .eq("id", data.playerId)
      .eq("token", data.token)
      .maybeSingle();
    if (!p) throw new Error("Player not found");
    const result = grade(found.q, data.value);
    const { error } = await db
      .from("answers")
      .insert({ player_id: p.id, qkey: data.qkey, points: result.points });
    if (error) return { ...result, already: true };
    await db.from("players").update({ score: p.score + result.points }).eq("id", p.id);
    return { ...result, already: false };
  });

export const hostSetRounds = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ pin: z.string().max(20), unlocked: z.array(z.string()).max(ROUNDS.length) }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPin(data.pin);
    const ids = ROUNDS.map((r) => r.id).filter((id) => data.unlocked.includes(id));
    const db = await admin();
    await db.from("game_state").update({ unlocked: ids, updated_at: new Date().toISOString() }).eq("id", 1);
    return { ok: true };
  });

export const hostCheckPin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ pin: z.string().max(20) }).parse(d))
  .handler(async ({ data }) => {
    checkPin(data.pin);
    return { ok: true };
  });

export const hostReset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ pin: z.string().max(20) }).parse(d))
  .handler(async ({ data }) => {
    checkPin(data.pin);
    const db = await admin();
    await db.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await db.from("game_state").update({ unlocked: [] }).eq("id", 1);
    return { ok: true };
  });
