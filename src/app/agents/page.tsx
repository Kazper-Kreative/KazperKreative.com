import SquadRoster from "@/components/organisms/SquadRoster";
import PageWrapper from "@/components/layouts/PageWrapper";
import { Metadata } from "next";
import Button from "@/components/atoms/Button";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { getAgents } from "@/sanity/lib/agents";

export const metadata: Metadata = {
  title: "The team | Kazper Kreative LLC",
  description: "Meet the engineers behind every Kazper Kreative build.",
};

export default async function AgentsPage() {
  const agentsData = await getAgents();
  const agents = agentsData.map(agent => ({
      ...agent,
      pictureUrl: urlFor(agent.image).url(),
      upworkUrl: agent.upworkUrl || '#',
  }))

  return (
    <PageWrapper>
      <SquadRoster agents={agents} />
      <section className="container mx-auto px-4 py-16 text-center border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-white mb-4">Hire us on Upwork</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          We do most of our contracting through Upwork for verified performance tracking.
        </p>
        <Link href="https://www.upwork.com/agencies/1990979485860235162/">
          <Button size="lg" variant="secondary">View on Upwork</Button>
        </Link>
      </section>
    </PageWrapper>
  );
}
