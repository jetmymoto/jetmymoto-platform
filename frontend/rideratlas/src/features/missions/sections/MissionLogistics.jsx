import { Plane, LogOut, Headphones } from "lucide-react";

export default function MissionLogistics({ logistics }) {
  if (!logistics) return null;

  return (
    <section className="bg-[#f6f3ee] py-24 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#785a0c] mb-4">Logistics & Support</p>
          <h2 className="font-headline text-4xl font-bold text-[#050505] md:text-5xl uppercase tracking-tighter">
            Route Support
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <LogisticsCard 
            icon={Plane} 
            title="Insertion Hub" 
            detail={logistics.insertion} 
            description="Start terminal where your machine is prepped and waiting."
          />
          <LogisticsCard 
            icon={LogOut} 
            title="Extraction Hub" 
            detail={logistics.extraction} 
            description="Final terminal for machine recovery and logistics."
          />
          <LogisticsCard 
            icon={Headphones} 
            title="Concierge Support" 
            detail={logistics.support} 
            description="24/7 support for route updates and technical assistance."
          />
        </div>
      </div>
    </section>
  );
}

function LogisticsCard({ icon: Icon, title, detail, description }) {
  return (
    <div className="rounded-[2.5rem] border border-[#050505]/5 bg-white p-10 shadow-sm transition-all hover:shadow-xl group">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#050505] text-[#CDA755] group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#785a0c] mb-2">
        {title}
      </h4>
      <p className="font-headline text-2xl font-black text-[#050505] uppercase tracking-tight">
        {detail}
      </p>
      <p className="mt-4 text-sm text-[#5a5a55] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
