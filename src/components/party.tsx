import { cn } from "@/lib/utils";
import type { Player } from "@/lib/use-live";

const STYLES = ["ransom-a", "ransom-b", "ransom-c", "ransom-d"];

export function Ransom({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex flex-nowrap justify-center gap-1", className)} aria-label={text}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-2" />
        ) : (
          <span
            key={i}
            aria-hidden
            className={cn("inline-block px-1.5 py-0.5 leading-none", STYLES[(i * 7 + ch.charCodeAt(0)) % 4])}
            
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export function Leaderboard({ players, meId }: { players: Player[]; meId?: string }) {
  return (
    <div className="polaroid relative rotate-1">
      <div className="tape" />
      <h3 className="mb-3 text-center font-block text-lg">LEADERBOARD</h3>
      {players.length === 0 && <p className="text-center font-hand text-xl text-muted-foreground">No players yet…</p>}
      <ol className="space-y-1.5">
        {players.map((p, i) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center justify-between border-b border-dashed px-1 pb-1",
              p.id === meId && "bg-secondary",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="w-6 font-block text-primary">{i + 1}</span>
              <span className="font-hand text-2xl leading-none">{p.name}</span>
            </span>
            <span className="font-block">{p.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
