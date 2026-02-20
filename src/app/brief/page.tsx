import BriefTerminal from '@/components/organisms/BriefTerminal';
import PageWrapper from '@/components/layouts/PageWrapper';

export default function BriefPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center bg-black">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
            INITIALIZE <span className="text-emerald-500">PROJECT</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
            ESTABLISHING ENCRYPTED UPLINK...
          </p>
        </div>
        
        <BriefTerminal />
        
        <p className="mt-8 text-zinc-800 font-mono text-[10px] max-w-md text-center">
          BY INITIALIZING, YOU AGREE TO DATA ENCAPSULATION PROTOCOLS. 
          KAZPER KREATIVE SQUAD WILL REVIEW YOUR DOSSIER UPON COMPLETION.
        </p>
      </div>
    </PageWrapper>
  );
}
