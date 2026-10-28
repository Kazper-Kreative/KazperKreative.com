import KazperChat from "@/components/kazper/KazperChat";
import KazperPresence from "@/components/kazper/KazperPresence";
import { recentExchanges } from "@/lib/kazper/data";

// Chat with Kazper on the left, Kazper himself on the right (on top on narrow
// screens). Same conversation as Discord: the last 40 exchanges from either
// door, then new messages go to the runtime through /api/kazper/chat.
export default async function KazperChatPage() {
  const exchanges = await recentExchanges(40);
  return (
    <div className="kz-split">
      <KazperChat initial={exchanges} />
      <aside className="kz-split-side" aria-label="Kazper's presence">
        <KazperPresence />
      </aside>
    </div>
  );
}
