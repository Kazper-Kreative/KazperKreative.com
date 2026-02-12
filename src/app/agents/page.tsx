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
    bio: "I create immersive and interactive gaming experiences that captivate users and foster unique interactions. With over five years in customer-facing sales roles, I excel at understanding diverse audiences and delivering tailored solutions. My background in retail wireless consulting has sharpened my ability to communicate effectively, uncover needs, and drive customer oriented results.\n\nCombining this experience with self-taught technical skills and formal education in Gaming and Development, I bring a unique blend of consumer insight and technical expertise. Whether you need a consultant who understands gameplay dynamics or a collaborator to enhance your project's narrative and mechanics, I am here to help. Let's transform your ideas into engaging experiences that resonate with your audience.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Mason",
    pictureUrl: "/images/agents/mason.webp",
    role: "Unreal Engine Specialist: Bridging Creative Dev & Technical Stability",
    bio: "I don't just build gameplay systems; I architect the pipelines, testing protocols, and version control standards that ensure your game is polished, performant, and release-ready.\n\nCurrently, I serve as Lead QA for high-fidelity military simulations, managing 500GB+ repositories and complex hardware integrations. I move beyond simple 'bug hunting' to provide true White-Box QA and Systems Engineering.\n\nMy Core Expertise:\n\n1. Unreal Engine Development (C++ & Blueprints)\n\nUI/UX Specialist: Building immersive, modular UI using UMG and Slate (HUDs, Menus, Terminals).\n\nGameplay Systems: Creating responsive 'Game Feel', inventory economies, and distance-based progression.\n\nClean Architecture: Writing scalable code designed for easy iteration and long-term maintenance.\n\n2. Technical QA & Pipeline Leadership\n\nInfrastructure: Managing Git LFS, verifying build artifacts, and optimizing repo storage for distributed teams.\n\nPerformance: Profiling physics collisions, frame rates (Sub-T/FPV flight models), and memory usage.\n\nAutomation: Designing 'Cold Install' protocols and smoke tests to stabilize chaotic release cycles.\n\nWhat I Deliver:\n\nCore Systems: Full gameplay loops (Movement, Combat, Interaction, Crafting).\n\nPipeline Architecture: Setting up CI/CD workflows and Branching strategies.\n\nValidation: Comprehensive Test Plans and Hardware compatibility checks.\n\nWhether you need a feature built from scratch or a pipeline stabilized for launch, I bring the engineering discipline to get it done right.\n\nLet's discuss your project's development or QA needs. Send me a message to get started.",
    upworkUrl: "https://www.upwork.com/freelancers/~012e873648a97f2621",
  },
  {
    name: "Hunter Wilkinson",
    pictureUrl: "/images/agents/hunter-wilkinson.jpeg",
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
