import KazperChat from "@/components/kazper/KazperChat";
import { recentExchanges } from "@/lib/kazper/data";

// Chat with Kazper. Same conversation as Discord: the last 40 exchanges from
// either door, then new messages go to the runtime through /api/kazper/chat.
export default async function KazperChatPage() {
  const exchanges = await recentExchanges(40);
  return <KazperChat initial={exchanges} />;
}
