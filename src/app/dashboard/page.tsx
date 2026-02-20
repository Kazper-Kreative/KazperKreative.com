import ClientDashboard from '@/components/organisms/ClientDashboard';
import PageWrapper from '@/components/layouts/PageWrapper';
import { client } from '@/sanity/lib/client';

async function getJobs() {
  // In a real scenario, we'd filter by the logged-in client's ID
  // For now, we fetch all 'job' types to see the system in action
  const jobs = await client.fetch(`*[_type == "job"] | order(_createdAt desc)`);
  return jobs;
}

export default async function DashboardPage() {
  const jobs = await getJobs();

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <ClientDashboard jobs={jobs} />
        </div>
      </div>
    </PageWrapper>
  );
}
