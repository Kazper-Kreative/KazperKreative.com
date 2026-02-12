import AgentsGrid from "@/components/organisms/AgentsGrid";
import PageWrapper from "@/components/layouts/PageWrapper";
import { Metadata } from "next";

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
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Mason",
    pictureUrl: "/images/agents/mason.webp",
    role: "Unreal Engine Specialist: Bridging Creative Dev & Technical Stability",
    bio: "An Unreal Engine Specialist who architects and stabilizes development pipelines. Manages large repositories, provides White-Box QA, and builds core gameplay systems with a focus on clean, performant, and release-ready code.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Hunter Wilkinson",
    pictureUrl: "/images/agents/hunter-wilkinson.jpeg",
    role: "Graphics & Shader Developer",
    bio: "A low-level game engine developer specializing in graphics and shaders. With a deep understanding of engine architecture from Vulkan to Unity/Unreal, he excels at performance optimization and bridging the gap between custom engine techniques and modern workflows.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
];

export default function AgentsPage() {
  return (
    <PageWrapper>
      <AgentsGrid agents={agentsData} />
    </PageWrapper>
  );
}
