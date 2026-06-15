import { motion } from "framer-motion";
import type { RentalRailItem } from "../types";
import SmartImage from "../../../shared/media/SmartImage";

interface Props {
  item: RentalRailItem;
  isCompact?: boolean;
}

export default function RentalMissionCard({ item, isCompact = false }: Props) {
  const { 
    brand, 
    model, 
    priceLabel, 
    airportCode, 
    imageUrl, 
    hasTrustedPricing,
    classLabel
  } = item;

  const cardWidth = isCompact ? "w-[280px]" : "w-[340px]";
  const cardHeight = isCompact ? "h-[440px]" : "h-[500px]";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative flex flex-col ${cardWidth} ${cardHeight} bg-[#0B0B0C] border border-white/5 overflow-hidden group shadow-2xl transition-all duration-500 hover:border-[#CDA755]/30`}
    >
      {/* 70% Image Area */}
      <div className="relative h-[70%] overflow-hidden bg-white/[0.02]">
        <SmartImage 
          src={imageUrl} 
          alt={`${brand} ${model}`}
          aspectRatio="h-full w-full"
          className="grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
        />

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-60" />
        
        {/* Tactical Badges */}
        <div className="absolute top-6 left-6 flex gap-2 z-20">
          <div className="bg-[#0B0B0C]/90 backdrop-blur-md px-3 py-1 border border-white/10 rounded-sm">
            <span className="text-[10px] font-black text-white tracking-[0.2em]">{airportCode}</span>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <div className="bg-[#CDA755]/10 backdrop-blur-md px-3 py-1 border border-[#CDA755]/30 rounded-sm">
            <span className="text-[10px] font-bold text-[#CDA755] tracking-[0.15em] uppercase">Verified Fleet</span>
          </div>
        </div>
      </div>

      {/* 30% Information Panel */}
      <div className="h-[30%] p-8 flex flex-col justify-between relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
              {brand}
            </h3>
            <div className="h-[1px] w-4 bg-[#CDA755]/30" />
          </div>
          <h2 className="text-white text-2xl font-bold tracking-tighter leading-none group-hover:text-[#CDA755] transition-colors duration-300">
            {model}
          </h2>
          <p className="text-[#B6B6B6] text-[10px] uppercase tracking-widest font-medium opacity-60">
            {classLabel || 'Premium Deployment'}
          </p>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="flex flex-col">
            <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">
              Estimated Rate
            </span>
            <span className={`text-lg font-bold tracking-tight ${hasTrustedPricing ? 'text-white' : 'text-white/40 italic'}`}>
              {hasTrustedPricing ? priceLabel : "Quote Required"}
            </span>
          </div>
          
          <button className="relative overflow-hidden group/btn bg-transparent border border-[#CDA755]/50 text-[#CDA755] hover:text-[#0B0B0C] px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500">
            <span className="relative z-10">View Mission</span>
            <div className="absolute inset-0 bg-[#CDA755] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </div>
      </div>

      {/* Luxury Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </motion.div>
  );
}
