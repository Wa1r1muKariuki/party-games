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

- Keep party content in src/lib/game-content.ts and grade submissions on the server so clients cannot set scores.
- Persist player credentials and dare assignments in Cloud; localStorage stores only the returning player's credential, not scores.
- Keep private player tokens out of public leaderboard projections; all private reads and submissions verify the player token on the server.
- Protect host operations using HOST_PIN inside server-only handlers; never embed host credentials in client code.
- Award scores through an atomic answer-insert trigger with unique question keys, including the event bonus, to prevent duplicate or lost points.
- Place privileged helpers in game.server.ts and import them inside server-function handlers to preserve Worker bundle boundaries.
