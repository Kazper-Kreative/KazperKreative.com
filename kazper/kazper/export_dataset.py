"""Export Kazper's feedback as fine-tuning data: python -m kazper.export_dataset

Writes into kazper/data/ (gitignored — these files contain your private prompts):
- sft.jsonl  — 👍-rated exchanges as {"messages": [...prompt..., assistant reply]}
- dpo.jsonl  — corrections as {"prompt": [...], "chosen": correction, "rejected": original reply}

Both are the standard shapes LoRA trainers (TRL, Axolotl, Unsloth) accept. Tool
calls stay in the prompt so the model also learns when to look things up.
"""

import json

from .config import load_config
from .memory import open_memory


def main():
    cfg = load_config()
    memory = open_memory(cfg)
    feedback = memory.feedback_since(None, with_messages=True)

    sft, dpo = [], []
    for f in feedback:
        ex = f["exchange"]
        prompt = ex.get("messages") or []
        if not prompt:
            continue
        if f["kind"] == "good":
            sft.append({"messages": [*prompt, {"role": "assistant", "content": ex["reply_text"]}]})
        elif f["kind"] == "correction" and f["correction"]:
            dpo.append({"prompt": prompt, "chosen": f["correction"], "rejected": ex["reply_text"]})

    for name, rows in (("sft.jsonl", sft), ("dpo.jsonl", dpo)):
        with open(cfg.data_dir / name, "w", encoding="utf-8") as out:
            for row in rows:
                out.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"Wrote {len(sft)} SFT examples and {len(dpo)} preference pairs to {cfg.data_dir}")


if __name__ == "__main__":
    main()
