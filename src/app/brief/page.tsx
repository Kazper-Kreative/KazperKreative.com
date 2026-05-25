import BriefTerminal from '@/components/organisms/BriefTerminal';
import PageWrapper from '@/components/layouts/PageWrapper';

export default function BriefPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center bg-black">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
            Brief us
          </h1>
          <p className="text-zinc-500 text-sm">
            Send us a quick sketch of what you&apos;re building.
          </p>
        </div>

        <BriefTerminal />

        <p className="mt-8 text-zinc-600 text-xs max-w-md text-center">
          We&apos;ll review your brief and respond within one business day.
        </p>
      </div>
    </PageWrapper>
  );
}
