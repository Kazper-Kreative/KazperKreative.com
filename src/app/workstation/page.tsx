import AgentWorkspace from '@/components/organisms/AgentWorkspace';
import PageWrapper from '@/components/layouts/PageWrapper';
import { client } from '@/sanity/lib/client';

async function getJobs() {
  const jobs = await client.fetch(`*[_type == "job"] | order(_createdAt desc){
    _id,
    title,
    status,
    description,
    "client": client->{name}
  }`);
  return jobs;
}

export default async function WorkstationPage() {
  const jobs = await getJobs();

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <AgentWorkspace jobs={jobs} />
        </div>
      </div>
    </PageWrapper>
  );
}
