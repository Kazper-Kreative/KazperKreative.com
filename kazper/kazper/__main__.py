"""Run Kazper: python -m kazper"""

import logging
import sys

from .bot import KazperBot
from .config import load_config


def main():
    # stdout, not the default stderr: Railway colours every stderr line as an error.
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s", stream=sys.stdout
    )
    cfg = load_config()
    KazperBot(cfg).run(cfg.discord_token, log_handler=None)


if __name__ == "__main__":
    main()
