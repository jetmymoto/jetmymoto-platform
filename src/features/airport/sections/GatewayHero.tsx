import type { HeroPack } from "../../media/resolvers/airport";
import SmartImage from "../../../shared/media/SmartImage";

interface Props {
  airportCode: string;
  heroPack: HeroPack;
}

export default function GatewayHero({ airportCode, heroPack }: Props) {
  const { title, kicker, description, stats, images } = heroPack;
  const primaryImage = images[0];

  return (
    <section className="relative min-h-[80vh] bg-[#0B0B0C] overflow-hidden flex items-center justify-center">
      {/* Cinematic Background using SmartImage */}
      <div className="absolute inset-0 opacity-40">
        <SmartImage 
          src={primaryImage} 
          alt={`Gateway ${airportCode}`}
          priority={true}
          aspectRatio="h-full w-full"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/20 via-transparent to-[#0B0B0C]" />
      
      <div className="relative container mx-auto px-8 z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#CDA755]/35 bg-white/5 backdrop-blur-xl px-4 py-2 mb-7">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-[#CDA755] text-[10px] font-bold uppercase tracking-widest">{kicker}</span>
          </div>

          <h1 className="text-white text-6xl md:text-8xl font-bold tracking-tighter italic uppercase leading-[0.85]">
            {title.line1}<br />
            {title.line2}<br />
            {title.line3} <span className="text-[#CDA755]">{title.highlight}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-2xl text-white/70 leading-relaxed font-light">
            {description}
          </p>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                <p className="text-[#B6B6B6] text-[9px] uppercase tracking-widest">{stat.label}</p>
                <p className="text-white text-xl font-bold mt-1 uppercase">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
