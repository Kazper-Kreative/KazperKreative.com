import AgentsGrid from "@/components/organisms/AgentsGrid";
import PageWrapper from "@/components/layouts/PageWrapper";
import { Metadata } from "next";
import Button from "@/components/atoms/Button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Agents | Kazper Kreative LLC",
  description: "Meet the talented team of engineers and specialists at Kazper Kreative LLC.",
};

const agentsData = [
  {
    name: "Levi",
    pictureUrl: "/images/agents/levi.jpeg",
    role: "Environment Design",
    bio: "A creative developer with a unique blend of customer-facing experience and technical skills in game design. Excels at understanding audience needs to create immersive and interactive gameplay.",
    upworkUrl: "https://www.upwork.com/freelancers/~01941036c5e7f4b7df",
  },
  {
    name: "Mason",
    pictureUrl: "/images/agents/mason.webp",
    role: "Unreal Engine Specialist: Bridging Creative Dev & Technical Stability",
    bio: "An Unreal Engine Specialist who architects and stabilizes development pipelines. Manages large repositories, provides White-Box QA, and builds core gameplay systems with a focus on clean, performant, and release-ready code.",
    upworkUrl: "https://www.upwork.com/freelancers/~013be55604a1f4f551",
  },
  {
    name: "Hunter Wilkinson",
    pictureUrl: "/images/agents/hunter-wilkinson.jpeg",
    role: "Graphics & Shader Developer",
    bio: "A low-level game engine developer specializing in graphics and shaders. With a deep understanding of engine architecture from Vulkan to Unity/Unreal, he excels at performance optimization and bridging the gap between custom engine techniques and modern workflows.",
    upworkUrl: "https://www.upwork.com/freelancers/~010f0165fe0a2764cc",
  },
];

export default function AgentsPage() {
  return (
    <PageWrapper>
      <AgentsGrid agents={agentsData} />
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
