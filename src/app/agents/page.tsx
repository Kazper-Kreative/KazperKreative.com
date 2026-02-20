import SquadRoster from "@/components/organisms/SquadRoster";
import PageWrapper from "@/components/layouts/PageWrapper";
import { Metadata } from "next";
import Button from "@/components/atoms/Button";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { getAgents } from "@/sanity/lib/agents";

export const metadata: Metadata = {
  title: "Our Agents | Kazper Kreative LLC",
  description: "Meet the talented team of engineers and specialists at Kazper Kreative LLC.",
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
        <h2 className="text-3xl font-bold text-white mb-4">Operational Base: Upwork</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          For streamlined contracting and verified performance tracking, we operate 
          primarily through our specialized Upwork Agency roster.
        </p>
        <Link href="https://www.upwork.com/agencies/1990979485860235162/">
          <Button size="lg" variant="secondary">Visit Agency Profile</Button>
        </Link>
      </section>
    </PageWrapper>
  );
}
