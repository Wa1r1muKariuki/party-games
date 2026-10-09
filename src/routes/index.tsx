import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import collage from "@/assets/collage.jpg";
import { Leaderboard, Ransom } from "@/components/party";
import { ROUNDS, type Question } from "@/lib/game-content";
import { joinGame, myAnswers, submitAnswer } from "@/lib/game.functions";
import { useLeaderboard, useUnlocked } from "@/lib/use-live";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serah x Muraimu — Birthday Games" },
      { name: "description", content: "Party games for the Serah x Muraimu joint birthday dinner at Locatio Rooftop, Kilimani." },
      { property: "og:title", content: "Serah x Muraimu — Birthday Games" },
      { property: "og:description", content: "Join on your phone and play: crossword, who knows us best, dares and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Me = { id: string; token: string; name: string };
const KEY = "sxm-player";

function Index() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const players = useLeaderboard();
  const unlocked = useUnlocked();
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const m = JSON.parse(raw) as Me;
      myAnswers({ data: { playerId: m.id, token: m.token } }).then((r) => {
        if (r.valid) {
          setMe(m);
          setAnswered(Object.fromEntries(r.answers.map((a) => [a.qkey, a.points])));
        } else localStorage.removeItem(KEY);
        setReady(true);
      });
    } else setReady(true);
  }, []);

  const myScore = players.find((p) => p.id === me?.id)?.score ?? 0;
  const open = ROUNDS.filter((r) => unlocked.includes(r.id));
  const current = open.find((r) => r.id === tab) ?? open[open.length - 1];

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-16 pt-6">
      <header className="text-center">
        <p className="font-hand text-2xl">it's a joint birthday dinner!</p>
        <h1 className="my-2 text-4xl">
          <Ransom text="SERAH x MURAIMU" />
        </h1>
        <p className="sticker inline-block -rotate-2 text-sm">FRI 9 OCT · LOCATIO ROOFTOP, KILIMANI</p>
      </header>

      {!ready ? null : !me ? (
        <Join onJoin={(m) => { localStorage.setItem(KEY, JSON.stringify(m)); setMe(m); }} />
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="font-hand text-3xl">hey {me.name}!</p>
            <p className="sticker rotate-2">{myScore} pts</p>
          </div>

          {open.length === 0 ? (
            <div className="polaroid relative mt-6 -rotate-1 text-center">
              <div className="tape" />
              <img src={collage} alt="Scrapbook collage with cassette and polaroids" width={1024} height={768} className="w-full" />
              <p className="mt-3 font-hand text-2xl">Hold tight — the first round unlocks soon ♡</p>
            </div>
          ) : (
            <>
              <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {open.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setTab(r.id)}
                    className={cn(
                      "shrink-0 border-2 px-3 py-1.5 font-block text-xs",
                      current?.id === r.id ? "bg-ink text-paper" : "bg-paper",
                    )}
                  >
                    {r.title}
                  </button>
                ))}
              </nav>
              {current && (
                <section className="mt-4">
                  <div className="polaroid relative mb-5 rotate-[-1deg]">
                    <div className="tape" />
                    <p className="text-xs uppercase text-muted-foreground">▶ {current.tag}</p>
                    <h2 className="font-display text-3xl">{current.title}</h2>
                    <p className="font-hand text-xl">{current.blurb}</p>
                  </div>
                  <div className="space-y-4">
                    {current.questions.map((q, i) => (
                      <QuestionCard
                        key={q.key}
                        q={q}
                        index={i}
                        me={me}
                        done={answered[q.key]}
                        onDone={(pts) => setAnswered((a) => ({ ...a, [q.key]: pts }))}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className="mt-10">
            <Leaderboard players={players} meId={me.id} />
          </div>
        </>
      )}
    </main>
  );
}

function Join({ onJoin }: { onJoin: (m: Me) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="polaroid relative mt-8 rotate-1"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        try {
          onJoin(await joinGame({ data: { name: name.trim() } }));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="tape" />
      <img src={collage} alt="Scrapbook collage with cassette and polaroids" width={1024} height={768} className="w-full" />
      <label className="mt-4 block font-hand text-2xl" htmlFor="name">write your name, babe</label>
      <input id="name" className="field mt-1" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wanjiru" />
      <button className="btn-pop mt-4 w-full" disabled={busy}>{busy ? "JOINING…" : "LET'S PLAY ♡"}</button>
    </form>
  );
}

function QuestionCard({
  q, index, me, done, onDone,
}: { q: Question; index: number; me: Me; done?: number | undefined; onDone: (pts: number) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const tilt = index % 2 ? "rotate-[0.8deg]" : "rotate-[-0.8deg]";

  const send = async (v: string) => {
    if (!v.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const r = await submitAnswer({ data: { playerId: me.id, token: me.token, qkey: q.key, value: v } });
      onDone(r.points);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("polaroid", tilt)}>
      <p className="text-lg">
        <span className="font-block text-primary">{index + 1}. </span>
        {q.prompt}
      </p>
      {done !== undefined ? (
        <p className={cn("mt-2 font-hand text-2xl", done > 0 ? "text-success" : "text-hot")}>
          {done > 0 ? `+${done} pts ✓` : "Nope! 0 pts"}
        </p>
      ) : q.kind === "choice" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {q.options.map((o, i) => (
            <button key={o} disabled={busy} onClick={() => send(String(i))} className="border-2 bg-paper px-2 py-2 text-sm active:bg-secondary">
              {o}
            </button>
          ))}
        </div>
      ) : q.kind === "done" ? (
        <button disabled={busy} onClick={() => send("done")} className="btn-pop mt-3">DONE IT · +{q.points}</button>
      ) : (
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(value); }}>
          <input
            className={cn("field", q.kind === "text" && "uppercase tracking-[0.3em]")}
            inputMode={q.kind === "number" ? "numeric" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={q.kind === "number" ? "age" : "answer"}
            maxLength={q.kind === "text" ? q.answer.length + 4 : 3}
          />
          <button className="btn-pop" disabled={busy}>GO</button>
        </form>
      )}
      {q.kind === "text" && done === undefined && (
        <div className="mt-2 flex gap-1">
          {q.answer.split("").map((_, i) => (
            <span key={i} className="h-5 w-5 border bg-paper" />
          ))}
        </div>
      )}
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}
