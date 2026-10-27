# Kazper — the AI-me runtime

Kazper lives alongside the Kazper Kreative site but runs separately:

| Piece | Where | What |
|---|---|---|
| Runtime (this folder) | **Railway**, always on | Discord line, senses, daily briefing, weekly review |
| Memory | **Supabase** (same project as the site), `kazper_*` tables | Conversations (+ cost), facts, pointers, feedback, events |
| App | **kazperkreative.com/kazper** (installable PWA: phone + desktop) | Chat, memory, history, stats; v2 approvals next |

The site never imports this code and Vercel ignores it; Railway builds only this folder.

## v1 = Tier 0 (watch only)

Kazper **reads** Calendar, Gmail, Slack, Discord mentions, CryptidKeep and Railway, answers
questions about them, and DMs you a briefing every morning. It can't send, reply,
post or edit anything. That starts in v2, with your approval on each action.

The one exception is its own memory: with the `remember` tool Kazper saves durable facts it learns
from you. Each one is tagged as Kazper's (`source = 'kazper'`), ranked below what you told it, capped
at 3 per reply, and DMed to you as `📝 Noted #id` so nothing lands in memory unseen.

## How Kazper remembers (and stays cheap)

- **Short window, deep recall.** Each message replays only the last `RECENT_TURNS` chat turns (default 6).
  Older conversation stays in `kazper_exchanges`, and Kazper looks it up only when needed:
  `history_search` (Postgres full-text) finds it, then `history_read` pulls just those exchanges.
- **Pointers.** Kazper leaves short working notes to itself (`leave_pointer`, e.g. "open: send Dana the
  1099s"). Each one links to the exchange it came from, and the newest 12 ride along in every prompt.
  `!pointers` lists them.
- **Cache-friendly prompt.** The parts that rarely change come first and the current time rides on the
  newest message, so providers can reuse the start of the prompt at a fraction of the price.
- **Effort by task.** Chat uses `LLM_REASONING_EFFORT`. Briefings and reviews use
  `LLM_DEEP_REASONING_EFFORT` and skip the chat window entirely.
- **Every reply is costed.** Tokens, cached tokens, reasoning tokens, dollars and provider are stored on
  each exchange. `!stats` sums them. `LLM_PROVIDER_ORDER` pins preferred OpenRouter providers once
  the data says which are worth it.

## How Kazper learns

- `!fix` stores the correction, and Kazper also turns it into a lasting 📝 note right away when it
  reflects a real preference.
- Pushing back in plain chat ("no, I meant…") is logged as a `redirect` on the previous reply.
- **Weekly review** (`REVIEW_DAY` / `REVIEW_TIME`, default Sunday 18:00, or `!review`): Kazper reads the
  week's 👎s, corrections and pushbacks and saves up to 3 lessons as 📝 notes. Weeks with nothing to
  learn from cost nothing.
- `python -m kazper.export_dataset` writes `data/sft.jsonl` (👍 replies) and `data/dpo.jsonl`
  (corrections as preference pairs) for the v4 LoRA. `!stats` shows progress toward ~500 examples.

```
kazper/
  identity/kazper_identity.example.md   public blank template; your real profile is the gitignored
                                        kazper_identity.md locally, KAZPER_IDENTITY on Railway
  kazper/brain.py               prompt + LLM + tool-calling loop
  kazper/bot.py                 Discord DM line, Discord sense, 7 AM briefing
  kazper/memory.py              Supabase memory (SQLite fallback locally)
  kazper/tools/                 senses: google, slack, discord_watch, cryptidkeep (MCP), railway;
                                memory: remember, recall (history search + pointers)
  kazper/export_dataset.py      feedback → fine-tuning JSONL
  kazper/setup_google.py        one-time Google login helper
../supabase/kazper.sql          memory schema (run once)
```

Every sense is optional. It switches on when its env vars are set, and `!senses` shows what's connected.

## Run locally

```powershell
cd kazper
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env     # fill in
python -m kazper
```

## Connecting each piece

### Memory → Supabase
1. Supabase dashboard → SQL editor → run `supabase/kazper.sql`.
2. Project Settings → API → copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`.
   This key bypasses RLS. Keep it server-side only (Railway variables / local `.env`).

### Google Calendar + Gmail
1. https://console.cloud.google.com → new project "Kazper".
2. **APIs & Services → Library**: enable **Gmail API** and **Google Calendar API**.
3. **OAuth consent screen** (Google Auth Platform): pick **Internal** if this is a Google Workspace
   account. Otherwise pick **External**, add yourself as a test user, then **Publish app → In production**.
   An unverified app in production shows a warning screen you click through. Apps left in
   *Testing* get refresh tokens that **expire after 7 days**.
4. **Credentials → Create credentials → OAuth client ID → Desktop app.** Copy the client ID and
   secret into `.env`.
5. Run `python -m kazper.setup_google`. A browser opens; allow access. The script writes
   `GOOGLE_REFRESH_TOKEN` into `.env`.

### Slack
1. https://api.slack.com/apps → **Create New App** → From scratch → name it "Kazper", pick your workspace.
2. **OAuth & Permissions → User Token Scopes**: `im:history`, `im:read`, `mpim:history`, `mpim:read`,
   `search:read`, `users:read`.
3. **Install to Workspace**, then copy the **User OAuth Token** (`xoxp-…`) into `SLACK_USER_TOKEN`.

### Discord sense
Kazper flags messages that @mention you or contain `DISCORD_WATCH_KEYWORDS`, but only in servers
its bot has joined. Invite it to the servers you want watched (Developer Portal → OAuth2 → URL
Generator → `bot` scope, *Read Message History* permission). **Message Content Intent** must stay on.

### CryptidKeep
Create a token for Kazper in CryptidKeep and set `CRYPTIDKEEP_TOKEN`. Kazper connects as an MCP
client and exposes only the read tools (list/get/search). The write tools are filtered out.

### Railway
1. https://railway.com/account/tokens → new token → pick your **workspace** (not "No workspace").
2. Set it as `RAILWAY_API_TOKEN`.

Kazper sees deploy status, deploy history and build/runtime logs, and the briefing flags failed or
crashed deploys. Railway tokens can't be made read-only, so Tier 0 lives in `tools/railway.py`: it
only sends fixed GraphQL queries, never mutations. A workspace token keeps a leak inside one workspace.

## The web app (`/kazper`)

Kazper's home outside Discord, at `kazperkreative.com/kazper`. It's the same brain and the same
conversation: Discord and the app share one history, and each message records which door it came
through (`channel`). Install it from the browser ("Add to Home Screen" on a phone, "Install app" in
Chrome/Edge) and it runs in its own window from its own icon.

```
browser ──► /api/kazper/* (Next.js on Vercel) ──► Kazper runtime /v1/* (Railway) ──► brain + memory
            checks you're the owner              shared-secret bearer auth
browser ──► Supabase directly for reads (history, memory, stats), via RLS is_kazper_owner()
```

- **Who can open it:** only users in `kazper_owners` (seeded by SQL, separate from billing staff).
- **Runtime side:** `kazper/api.py` runs inside the bot process when `KAZPER_API_SECRET` is set,
  on Railway's `PORT`. The service needs a public domain (Railway → Settings → Networking).
- **Site side:** set `KAZPER_RUNTIME_URL` (that domain, https) and the same `KAZPER_API_SECRET` on Vercel.
- Code: `src/app/kazper/*`, `src/components/kazper/*`, `src/lib/kazper/*`, `src/app/api/kazper/[action]`.

## Deploy to Railway
1. Railway → **New Project → Deploy from GitHub repo** → `Kazper-Kreative/KazperKreative.com`.
2. Service **Settings → Root Directory** = `/kazper`. It builds from the `Dockerfile`; `railway.json`
   sets restart-always.
3. Add every variable from your `.env` under **Variables**. Set `SUPABASE_*` so memory persists
   across deploys; the SQLite fallback would be wiped on each deploy.
4. Stop any local copy first. Two Kazpers on one token both answer every message.
5. Auto-deploy on push needs the **Railway GitHub App** installed on the `Kazper-Kreative` org
   (github.com/apps/railway-app) with access to this repo. Without it Railway can still build
   the public repo, but pushes won't trigger deploys.

## Teaching Kazper (Discord DM)

| Do this | Effect |
|---|---|
| `!brief` | Briefing now (also automatic at `BRIEFING_TIME`) |
| `!senses` | What's connected |
| `!stats` | Cost (7/30 days, per reply), memory size, feedback, fine-tune dataset progress |
| `!review` | Run the weekly self-review now |
| `!pointers` / `!forget p4` | Kazper's working notes / clear one |
| `!remember I hate morning meetings` | Permanent fact, in every prompt |
| `!facts` / `!forget 3` | Review / remove facts |
| React 🗑️ on a `📝 Noted #7` message | Delete a note Kazper saved itself |
| React 👍 or 👎 | Rates that reply |
| Reply to a Kazper message with `!fix <what you'd say>` | Correction, the best training signal; may become a 📝 note |
| "no, I meant…" in plain chat | Logged as pushback for the weekly review |

## Roadmap
- v0 core + Discord line ✔
- **v1 senses + briefing + always-on** ← here
- v2 hands at Tier 1: drafts actions, you approve from your phone
- v3 earned autonomy per category
- v4 voice + LoRA fine-tune on `kazper_exchanges` / `kazper_feedback`
