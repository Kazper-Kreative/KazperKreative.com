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
    pictureUrl: "https://assets-global.website-files.com/652f146430349b18361b17b2/652f146430349b18361b181e_AI_Avatar_Cyberpunk_Portrait_square.png",
    role: "AI/ML & WebGL Engineer",
    bio: "Specializing in cutting-edge AI/ML integration for interactive web experiences and high-performance WebGL applications.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Mason",
    pictureUrl: "https://assets-global.website-files.com/652f146430349b18361b17b2/652f146430349b18361b181e_AI_Avatar_Cyberpunk_Portrait_square.png",
    role: "Full-stack Engineer",
    bio: "Specializing in robust backend systems with Node.js and Python, and dynamic frontends with React and Next.js.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Hunter Wilkinson",
    pictureUrl: "https://assets-global.website-files.com/652f146430349b18361b17b2/652f146430349b18361b181e_AI_Avatar_Cyberpunk_Portrait_square.png",
    role: "Graphics & Shader Developer",
    bio: "I’m a low-level game engine developer who lives close to the metal but ships comfortably inside modern engines.\n\nMy background is rooted in custom engine and framework development. I’ve built games using SDL3, and I’m currently developing a Vulkan-based game engine on top of the Windows API, with planned support for Linux and macOS. This means I understand not just how to use engines, but how they actually work under the hood: memory, rendering pipelines, threading, asset flow, and performance tradeoffs.\n\nOn top of that foundation, I work effectively inside Unreal Engine and Unity, particularly in areas where engine abstractions meet real hardware:\n\nShader development and optimization\n\nRendering and performance profiling\n\nBridging engine systems with low-level graphics concepts\n\nTranslating custom engine techniques into Unreal and Unity workflows\n\nBecause I understand graphics from Vulkan upward, I can diagnose performance problems that aren’t obvious from the editor alone and apply fixes that scale.\n\nAlongside development, I offer QA and performance analysis services. I’ve worked with testing teams on:\n\nPublic projects such as Broken Aperture (on steam), focusing on performance improvements and in-depth analysis\n\nMy QA work is technical rather than surface-level. I specialize in:\n\nPerformance bottleneck identification\n\nFrame-time and GPU/CPU analysis\n\nReproducible bug reports engineers can act on immediately\n\nWhat You Get Working With Me\n\nAn engineer who understands engines from the inside out\n\nClean, well-reasoned technical decisions instead of guesswork\n\nPerformance-focused development and testing\n\nClear communication with developers, artists, and QA teams alike\n\nIf you need someone who can move fluidly between custom engines, Vulkan, Unreal, Unity, and real performance constraints, I’d be happy to talk.",
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
