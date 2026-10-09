<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Party game content and scoring live in src/lib/game-content.ts; server functions grade answers so phones can't fake scores.
- Players are anonymous (name + secret token in localStorage); all writes go through server functions, the browser only reads the leaderboard and round state live.
- Host actions are protected by the HOST_PIN secret, checked server-side.
