import { CheckCircle2, ShieldCheck, Star, Users } from "lucide-react";

interface Props {
  airportCode: string;
}

export default function ProofSection({ airportCode }: Props) {
  const stats = [
    {
      label: "Verified Hub",
      value: airportCode,
      icon: <CheckCircle2 className="w-5 h-5 text-[#CDA755]" />,
      sub: "Active Staging Node"
    },
    {
      label: "Theater Missions",
      value: "100% Validated",
      icon: <ShieldCheck className="w-5 h-5 text-[#CDA755]" />,
      sub: "Satellite Verified"
    },
    {
      label: "Elite Partners",
      value: "Fleet Tier 1",
      icon: <Star className="w-5 h-5 text-[#CDA755]" />,
      sub: "Quality Inspected"
    },
    {
      label: "Rider Network",
      value: "2.4k Missions",
      icon: <Users className="w-5 h-5 text-[#CDA755]" />,
      sub: "Global Deployment"
    }
  ];

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-4 group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-sm group-hover:border-[#CDA755]/50 transition-colors duration-500">
                  {stat.icon}
                </div>
                <div className="h-[1px] flex-grow bg-white/10" />
              </div>
              
              <div className="space-y-1">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  {stat.label}
                </div>
                <div className="text-white text-2xl font-bold tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-[#CDA755] text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 border border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h4 className="text-white text-lg font-bold mb-2">Institutional Trust & Verification</h4>
            <p className="text-white/50 text-sm leading-relaxed">
              Every route, motorcycle, and logistical node in the {airportCode} theater has been physically inspected and satellite verified for mission readiness. We don't aggregate; we authorize.
            </p>
          </div>
          <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder for partner logos */}
            <div className="h-8 w-24 bg-white/20 rounded-sm" />
            <div className="h-8 w-24 bg-white/20 rounded-sm" />
            <div className="h-8 w-24 bg-white/20 rounded-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
