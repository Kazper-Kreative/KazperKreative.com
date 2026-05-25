import ClientDashboard from '@/components/organisms/ClientDashboard';
import PageWrapper from '@/components/layouts/PageWrapper';
import { client } from '@/sanity/lib/client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getJobs(sanityId: string) {
  return client.fetch(
    `*[_type == "job" && client._ref == $sanityId] | order(_createdAt desc)`,
    { sanityId }
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const sanityId = session?.user?.sanityId;

  if (!sanityId) {
    redirect('/unauthorized');
  }

  const jobs = await getJobs(sanityId);

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
