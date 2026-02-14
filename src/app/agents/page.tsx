import AgentsGrid from "@/components/organisms/AgentsGrid";
import PageWrapper from "@/components/layouts/PageWrapper";
import { Metadata } from "next";
import Button from "@/components/atoms/Button";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const metadata: Metadata = {
  title: "Our Agents | Kazper Kreative LLC",
  description: "Meet the talented team of engineers and specialists at Kazper Kreative LLC.",
};

interface Agent {
  name: string;
  role: string;
  bio: string;
  upworkUrl: string;
  image: SanityImageSource;
}

async function getAgents(): Promise<Agent[]> {
    const query = `*[_type == "agent"]{
    name,
    role,
    bio,
    upworkUrl,
    image,
  }`;
  const data = await client.fetch(query);
  return data;
}

export default async function AgentsPage() {
  const agentsData = await getAgents();
  const agents = agentsData.map(agent => ({
      ...agent,
      pictureUrl: urlFor(agent.image).width(200).height(200).url(),
  }))

  return (
    <PageWrapper>
      <AgentsGrid agents={agents} />
      <section className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Our Agency on Upwork</h2>
        <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
          Explore our full profile and services on Upwork to see how Kazper Kreative LLC can help with your next project.
        </p>
        <Link href="https://www.upwork.com/agencies/1990979485860235162/">
          <Button>Visit Our Upwork Agency Profile</Button>
        </Link>
      </section>
    </PageWrapper>
  );
}
