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
    name: "Alex",
    pictureUrl: "https://assets-global.website-files.com/652f146430349b18361b17b2/652f146430349b18361b181e_AI_Avatar_Cyberpunk_Portrait_square.png",
    role: "QA Engineer",
    bio: "Ensuring software quality through comprehensive testing, automation, and CI/CD pipeline integration.",
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
