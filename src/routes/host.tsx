import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaderboard, Ransom } from "@/components/party";
import { ROUNDS } from "@/lib/game-content";
import { hostCheckPin, hostReset, hostSetRounds } from "@/lib/game.functions";
import { useLeaderboard, useUnlocked } from "@/lib/use-live";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host controls — Serah x Muraimu" },
      { name: "description", content: "Unlock rounds and watch the live leaderboard." },
      { property: "og:title", content: "Host controls — Serah x Muraimu" },
      { property: "og:description", content: "Unlock rounds and watch the live leaderboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Host,
});

function Host() {
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const unlocked = useUnlocked();
  const players = useLeaderboard();

  useEffect(() => {
    const saved = sessionStorage.getItem("sxm-pin");
    if (saved) hostCheckPin({ data: { pin: saved } }).then(() => { setPin(saved); setOk(true); }).catch(() => {});
  }, []);

  if (!ok)
    return (
      <main className="mx-auto max-w-sm px-4 pt-16 text-center">
        <h1 className="text-3xl"><Ransom text="HOST ONLY" /></h1>
        <form
          className="polaroid mt-8"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await hostCheckPin({ data: { pin } });
              sessionStorage.setItem("sxm-pin", pin);
              setOk(true);
            } catch {
              setErr("Wrong PIN");
            }
          }}
        >
          <input className="field text-center" inputMode="numeric" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          <button className="btn-pop mt-3 w-full">ENTER</button>
          {err && <p className="mt-2 text-destructive">{err}</p>}
        </form>
      </main>
    );

  const toggle = (id: string) => {
    const next = unlocked.includes(id) ? unlocked.filter((x) => x !== id) : [...unlocked, id];
    hostSetRounds({ data: { pin, unlocked: next } });
  };

  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-6">
      <h1 className="text-center text-3xl"><Ransom text="DJ BOOTH" /></h1>
      <p className="mt-2 text-center font-hand text-xl">tap a track to unlock it on everyone's phone</p>
      <div className="mt-6 space-y-3">
        {ROUNDS.map((r) => {
          const on = unlocked.includes(r.id);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              className={cn("polaroid flex w-full items-center justify-between text-left", on && "bg-secondary")}
            >
              <span>
                <span className="block text-xs uppercase text-muted-foreground">{r.tag}</span>
                <span className="font-display text-2xl">{r.title}</span>
              </span>
              <span className={cn("sticker text-xs", !on && "opacity-50")}>{on ? "LIVE" : "LOCKED"}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-8"><Leaderboard players={players} /></div>
      <button
        className="mt-8 w-full border-2 border-dashed px-3 py-2 text-sm text-destructive"
        onClick={() => { if (confirm("Delete all players and lock every round?")) hostReset({ data: { pin } }); }}
      >
        Reset whole game
      </button>
    </main>
  );
}
