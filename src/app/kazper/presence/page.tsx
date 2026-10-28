import { redirect } from "next/navigation";

// Presence now lives beside the chat on /kazper.
export default function KazperPresencePage() {
  redirect("/kazper");
}
