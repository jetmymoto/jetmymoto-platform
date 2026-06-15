import { FileText, Package, MessageSquare } from "lucide-react";

export default function MissionCTA() {
  return (
    <footer className="py-32 bg-[#0B0B0C] border-t border-white/5 relative overflow-hidden">
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.01] text-[20vw] font-black uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap">
        Rider Atlas
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-4 text-center">
            <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Final Authorization</h2>
            <h3 className="text-white text-5xl font-bold tracking-tighter italic uppercase">Claim Your Dossier</h3>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mx-auto">
              This intelligence is synchronized with real-world logistics. Secure your deployment plan before the tactical window closes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CTAButton 
              icon={<FileText className="w-5 h-5" />} 
              label="Get Full Mission PDF" 
              sub="Complete tactical intel"
            />
            <CTAButton 
              icon={<Package className="w-5 h-5" />} 
              label="Request Route Pack" 
              sub="GPX & logistics data"
              primary
            />
            <CTAButton 
              icon={<MessageSquare className="w-5 h-5" />} 
              label="Talk To Concierge" 
              sub="Personalized staging"
            />
          </div>

          <div className="pt-24 text-center">
            <div className="text-white/20 text-[10px] uppercase tracking-[0.6em] font-black">
              RiderAtlas Clean Core — Global Production Protocol
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CTAButton({ icon, label, sub, primary = false }: { icon: any, label: string, sub: string, primary?: boolean }) {
  return (
    <button className={`group relative p-8 flex flex-col gap-6 text-left transition-all duration-500 border ${
      primary 
        ? 'bg-[#CDA755] border-[#CDA755]' 
        : 'bg-white/[0.02] border-white/10 hover:border-[#CDA755]/50'
    }`}>
      <div className={`p-3 w-fit rounded-sm border transition-colors duration-500 ${
        primary 
          ? 'bg-black/20 border-black/10 text-black' 
          : 'bg-white/5 border-white/10 text-[#CDA755] group-hover:border-[#CDA755]/50'
      }`}>
        {icon}
      </div>

      <div className="space-y-1">
        <div className={`text-sm font-black uppercase tracking-widest ${primary ? 'text-black' : 'text-white'}`}>
          {label}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${primary ? 'text-black' : 'text-[#CDA755]'}`}>
          {sub}
        </div>
      </div>

      {/* Hover Effect */}
      {!primary && (
        <div className="absolute inset-0 bg-[#CDA755] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-[-1]" />
      )}
      {!primary && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col p-8 gap-6 z-0 pointer-events-none">
           <div className="p-3 w-fit rounded-sm border bg-black/20 border-black/10 text-black">
            {icon}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-black uppercase tracking-widest text-black">
              {label}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-black opacity-60">
              {sub}
            </div>
          </div>
        </div>
      )}
    </button>
  );
}
