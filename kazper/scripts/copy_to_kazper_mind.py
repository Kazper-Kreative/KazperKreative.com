"""One-off: copy Kazper's memory from the shared site project into Kazper Mind.

    .venv\\Scripts\\python.exe scripts\\copy_to_kazper_mind.py

Reads the old project (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env, read
only: GET requests and nothing else) and adds every row to Kazper Mind
(KAZPER_MIND_URL / KAZPER_MIND_SERVICE_KEY), keeping the same ids. Rows already
in Kazper Mind are skipped, never overwritten, so it's safe to run again after
the runtime switches over to pick up anything written in between. Deletes nothing.
kazper_owners isn't copied (sign-ins differ per project): the owner's account is
created in Kazper Mind and made owner instead.
"""

import os
import sys
from pathlib import Path

import httpx
from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parent.parent
env = {**dotenv_values(ROOT / ".env"), **os.environ}

OLD_URL = env["SUPABASE_URL"].rstrip("/")
OLD_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
NEW_URL = env.get("KAZPER_MIND_URL", "https://jvqxdnnnyoatgbqaebvt.supabase.co").rstrip("/")
NEW_KEY = env.get("KAZPER_MIND_SERVICE_KEY", "")
OWNER_EMAIL = "kazperkreative@gmail.com"  # the owner on the old project (kazper_owners)

# (table, conflict column, columns to copy, page size). Parents before children.
TABLES = [
    ("kazper_exchanges", "id", "id,created_at,user_text,reply_text,messages,kind,llm_calls,prompt_tokens,cached_tokens,"
                               "completion_tokens,reasoning_tokens,cost_usd,providers,channel", 10),
    ("kazper_reply_messages", "discord_message_id", "discord_message_id,exchange_id", 500),
    ("kazper_facts", "id", "id,created_at,text,source", 500),
    ("kazper_feedback", "id", "id,created_at,exchange_id,kind,correction", 500),
    ("kazper_events", "id", "id,created_at,source,summary,data", 500),
    ("kazper_pointers", "id", "id,created_at,text,exchange_id", 500),
    ("kazper_actions", "id", "id,created_at,kind,status,summary,destination,payload,exchange_id,decided_at", 500),
    ("kazper_activity", "id", "id,created_at,kind,text", 500),
]


def client(url: str, key: str) -> httpx.Client:
    headers = {"apikey": key}
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    return httpx.Client(base_url=f"{url}/rest/v1", headers=headers, timeout=60)


def main() -> None:
    if not NEW_KEY:
        sys.exit("Add KAZPER_MIND_SERVICE_KEY (Kazper Mind's secret key) to kazper/.env first.")
    if NEW_URL == OLD_URL:
        sys.exit("KAZPER_MIND_URL is the same project as SUPABASE_URL; nothing to copy.")
    old, new = client(OLD_URL, OLD_KEY), client(NEW_URL, NEW_KEY)
    for table, key, columns, page in TABLES:
        copied = offset = 0
        while True:
            r = old.get(f"/{table}", params={"select": columns, "order": f"{key}.asc", "limit": page, "offset": offset})
            r.raise_for_status()
            rows = r.json()
            if not rows:
                break
            w = new.post(f"/{table}", params={"on_conflict": key}, json=rows,
                         headers={"Prefer": "resolution=ignore-duplicates,return=minimal"})
            if w.is_error:
                sys.exit(f"{table}: Kazper Mind refused rows ({w.status_code}): {w.text[:300]}")
            copied += len(rows)
            offset += page
        total = new.get(f"/{table}", params={"select": key}, headers={"Prefer": "count=exact", "Range": "0-0"})
        print(f"{table:24} read {copied:4}  ·  now in Kazper Mind: {total.headers.get('content-range', '?').split('/')[-1]}")
    seed_owner(new)


def seed_owner(new: httpx.Client) -> None:
    """Create the owner's sign-in in Kazper Mind (pre-confirmed, no email sent) and make it the owner."""
    auth = httpx.Client(base_url=f"{NEW_URL}/auth/v1", headers=new.headers, timeout=30)
    r = auth.post("/admin/users", json={"email": OWNER_EMAIL, "email_confirm": True})
    if r.is_success:
        user_id = r.json()["id"]
    else:  # already there from an earlier run
        users = auth.get("/admin/users", params={"per_page": 1000}).raise_for_status().json().get("users", [])
        user_id = next((u["id"] for u in users if u.get("email") == OWNER_EMAIL), None)
        if user_id is None:
            sys.exit(f"Couldn't create or find {OWNER_EMAIL} in Kazper Mind ({r.status_code}): {r.text[:300]}")
    new.post("/kazper_owners", params={"on_conflict": "user_id"}, json={"user_id": user_id},
             headers={"Prefer": "resolution=ignore-duplicates,return=minimal"}).raise_for_status()
    print(f"owner                    {OWNER_EMAIL} can sign in to /kazper")


if __name__ == "__main__":
    main()
