import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Leaderboard, Ransom } from "@/components/party";
import { ROUNDS } from "@/lib/game-content";
import { hostCheckPin, hostReset, hostSetPreview, hostSetRounds } from "@/lib/game.functions";
import { useGameState, useLeaderboard } from "@/lib/use-live";
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
  const check=useServerFn(hostCheckPin), reset=useServerFn(hostReset), setRounds=useServerFn(hostSetRounds), setPreview=useServerFn(hostSetPreview);
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const { unlocked, preview } = useGameState();
  const players = useLeaderboard();

  useEffect(() => {
    const saved = sessionStorage.getItem("sxm-pin");
    if (saved) check({ data: { pin: saved } }).then(() => { setPin(saved); setOk(true); }).catch(() => {});
  }, []);

  if (!ok)
    return (
      <main className="mx-auto max-w-sm px-4 pt-16 text-center">
        <Button asChild variant="ghost" className="mb-6"><Link to="/"><ArrowLeft/> Back to party</Link></Button>
        <h1 className="text-3xl"><Ransom text="HOST ONLY" /></h1>
        <form
          className="polaroid mt-8"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await check({ data: { pin } });
              sessionStorage.setItem("sxm-pin", pin);
              setOk(true);
            } catch {
              setErr("Wrong PIN");
            }
          }}
        >
          <input className="field text-center" inputMode="numeric" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
          <Button variant="party" className="mt-3 w-full">ENTER</Button>
          {err && <p className="mt-2 text-destructive">{err}</p>}
        </form>
      </main>
    );

  const toggle = (id: string) => {
    const next = unlocked.includes(id) ? unlocked.filter((x) => x !== id) : [...unlocked, id];
    void setRounds({ data: { pin, unlocked: next } }).catch(() => setErr("Could not update rounds. Please try again."));
  };

  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-6">
      <Button asChild variant="ghost" className="mb-6"><Link to="/"><ArrowLeft/> Back to party</Link></Button>
      <h1 className="text-center text-3xl"><Ransom text="DJ BOOTH" /></h1>
      <p className="mt-2 text-center font-hand text-xl">tap a track to unlock it on everyone's phone</p>
      {err && <p role="alert" className="mt-3 text-destructive">{err}</p>}
      <div className="mt-6 space-y-3">
        {ROUNDS.map((r) => {
          const on = unlocked.includes(r.id);
          return (
            <Button
              key={r.id}
              onClick={() => toggle(r.id)}
              variant={on ? "secondary" : "choice"}
               className="polaroid grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] gap-3 py-4 text-left"
            >
              <span className="font-display text-2xl">{r.title}</span>
              <span className={cn("sticker text-xs", !on && "opacity-50")}>{on ? "LIVE" : "LOCKED"}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-8">
        <Button
          onClick={() => void setPreview({ data: { pin, preview: !preview } }).catch(() => setErr("Could not update preview. Please try again."))}
          variant={preview ? "secondary" : "choice"}
          className="polaroid flex w-full items-center justify-between gap-3 py-4 text-left"
        >
          <span className="font-display text-2xl">Let guests play now</span>
          <span className={cn("sticker text-xs", !preview && "opacity-50")}>{preview ? "OPEN" : "7 PM"}</span>
        </Button>
        <p className="mt-2 text-center font-hand text-lg text-muted-foreground">off means the games only open at 7 pm</p>
      </div>
      <div className="mt-8"><Leaderboard players={players} /></div>
      <Button
        className="mt-8 w-full border-2 border-dashed px-3 py-2 text-sm text-destructive"
        onClick={() => { if (confirm("Delete all players and lock every round?")) void reset({ data: { pin } }).catch(() => setErr("Could not reset game.")); }}
      >
        Reset whole game
      </Button>
    </main>
  );
}
