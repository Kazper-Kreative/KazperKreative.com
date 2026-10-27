import MemoryBoard from "@/components/kazper/MemoryBoard";
import { memory } from "@/lib/kazper/data";

// What Kazper carries into every conversation: your facts, his own 📝 notes,
// and his pointers. All editable — this is where you curate his memory.
export default async function KazperMemoryPage() {
  const { facts, pointers } = await memory();
  return <MemoryBoard facts={facts} pointers={pointers} />;
}
