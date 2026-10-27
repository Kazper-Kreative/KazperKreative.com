"""One-time Google login: python -m kazper.setup_google

Opens your browser, asks you to allow read-only Calendar + Gmail access, and
writes the resulting GOOGLE_REFRESH_TOKEN into kazper/.env. Needs
GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first (see README).
"""

import os
import re

from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

from .config import ROOT
from .tools.google import SCOPES


def main():
    env_path = ROOT / ".env"
    load_dotenv(env_path, override=True)
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    if not (client_id and client_secret):
        raise SystemExit("Put GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in kazper/.env first.")

    flow = InstalledAppFlow.from_client_config(
        {"installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }},
        SCOPES,
    )
    creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")
    if not creds.refresh_token:
        raise SystemExit("Google didn't return a refresh token — remove Kazper's access at "
                         "myaccount.google.com/permissions and run this again.")

    text = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
    line = f"GOOGLE_REFRESH_TOKEN={creds.refresh_token}"
    if re.search(r"^GOOGLE_REFRESH_TOKEN=.*$", text, flags=re.M):
        text = re.sub(r"^GOOGLE_REFRESH_TOKEN=.*$", line, text, flags=re.M)
    else:
        text = text.rstrip("\n") + "\n" + line + "\n"
    env_path.write_text(text, encoding="utf-8")
    print("Saved GOOGLE_REFRESH_TOKEN to kazper/.env. Restart Kazper to connect Calendar + Gmail.")


if __name__ == "__main__":
    main()
