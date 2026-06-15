import { motion } from "framer-motion";

interface Props {
  mission: any;
}

export default function MissionHighlights({ mission }: Props) {
  const highlights = (mission.highlights || []).slice(0, 4);

  return (
    <section className="py-32 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-24">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Strategic Highlights</h2>
            <h3 className="text-white text-6xl font-bold tracking-tighter leading-none italic uppercase">Mission Objectives</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {highlights.map((highlight: string, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="relative group p-12 bg-white/[0.02] border border-white/5 hover:border-[#CDA755]/30 transition-all duration-700"
              >
                {/* Large Number Watermark */}
                <div className="absolute top-8 right-12 text-white/[0.03] text-9xl font-black italic select-none group-hover:text-[#CDA755]/10 transition-colors duration-700">
                  0{i + 1}
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-[#CDA755]" />
                    <span className="text-[#CDA755] font-black text-[10px] tracking-[0.4em] uppercase">Phase 0{i + 1}</span>
                  </div>
                  
                  <p className="text-white text-3xl font-bold tracking-tight leading-tight max-w-md group-hover:text-white transition-colors">
                    {highlight}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#CDA755] group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
