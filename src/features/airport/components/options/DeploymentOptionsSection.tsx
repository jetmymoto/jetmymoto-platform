import { Box, Bike, Compass } from "lucide-react";

interface Props {
  airportCode: string;
}

export default function DeploymentOptionsSection({ airportCode }: Props) {
  const options = [
    {
      title: "Ship My Bike",
      description: "Air & Sea freight logistics to get your machine into the theater.",
      icon: <Box className="w-6 h-6 text-[#CDA755]" />,
      cta: "Configure Freight"
    },
    {
      title: "Rent a Motorcycle",
      description: "Secure a verified ADV machine from our local staging fleet.",
      icon: <Bike className="w-6 h-6 text-[#CDA755]" />,
      cta: "Explore Fleet"
    },
    {
      title: "Mission Planning",
      description: "Custom route planning and tactical intel for your specific extraction.",
      icon: <Compass className="w-6 h-6 text-[#CDA755]" />,
      cta: "Request Intel"
    }
  ];

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-[#CDA755] opacity-50" />
              <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">
                Deployment Options <span className="opacity-40 mx-2">/</span> {airportCode}
              </h2>
            </div>
            <h3 className="text-white text-4xl font-bold tracking-tighter">
              Choose your method of theater entry.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {options.map((option, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/5 flex flex-col gap-6 group hover:border-[#CDA755]/30 transition-all duration-500">
                <div className="p-4 bg-white/5 border border-white/10 rounded-sm w-fit group-hover:border-[#CDA755]/50 transition-colors duration-500">
                  {option.icon}
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white text-xl font-bold tracking-tight">
                    {option.title}
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>

                <button className="mt-auto w-fit px-6 py-2 bg-transparent border border-[#CDA755]/50 text-[#CDA755] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#CDA755] hover:text-[#0B0B0C] transition-all duration-500">
                  {option.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
