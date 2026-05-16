import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Headphones, CloudSun, CheckCircle2, ArrowRight } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { FadeIn } from '@/components/luxury/FadeIn';

export default function MissionTrustLayer({ mission }) {
  const proofs = [
    { label: "01", text: "Machines staged 12h before arrival." },
    { label: "02", text: "Recovery logistics managed end-to-end." },
    { label: "03", text: "Pass conditions monitored continuously." },
    { label: "04", text: "Support active throughout the corridor." }
  ];

  return (
    <section className="relative py-48 md:py-64 overflow-hidden bg-[#050505]">
      {/* Localized Atmospheric Glow (Alpine Navy & Amber Horizon) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(28,45,72,0.12)_0%,transparent_70%)] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_bottom_right,rgba(205,167,85,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 md:px-12 z-10">
        <div className="grid gap-24 lg:grid-cols-12 items-start">
          
          {/* LEFT: Operational Authority */}
          <div className="lg:col-span-5 pt-12">
            <FadeIn>
              <div className="flex items-center gap-6 mb-12">
                <div className="h-[1px] w-12 bg-[#CDA755]/40" />
                <div className="text-[11px] uppercase tracking-[0.6em] text-[#CDA755] font-black opacity-80">Operational Proof</div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] italic mb-14 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                Invisible <br /> Infrastructure. <br /> Absolute <br /> Execution.
              </h2>
              
              <p className="text-xl text-zinc-400 leading-relaxed mb-16 max-w-md font-light">
                The one-way corridor is backed by an active logistics engine. While you focus on the technical sectors, we monitor terrain telemetry, machine readiness, and border transitions in real-time.
              </p>
              
              <div className="space-y-8 border-l border-white/[0.05] pl-10">
                {proofs.map((proof) => (
                  <div key={proof.label} className="group cursor-default">
                    <div className="text-[9px] font-black text-[#CDA755]/60 uppercase tracking-[0.3em] mb-2 group-hover:text-[#CDA755] transition-colors">
                      {proof.label}
                    </div>
                    <div className="text-sm font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                      {proof.text}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* RIGHT: Cinematic Operational Panel */}
          <div className="lg:col-span-7 relative group flex justify-center lg:justify-end">
             <div className="relative aspect-[9/16] w-full max-w-md rounded-[60px] overflow-hidden border border-white/[0.03] shadow-2xl bg-black">
               <video
                 src="https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2FInvisible_infrastructure_operati%E2%80%A6_202605101849.mp4?alt=media&token=30cc5e83-db42-430f-8e49-2c0509fb98ec"
                 autoPlay
                 loop
                 muted
                 playsInline
                 className="w-full h-full object-cover saturate-[0.7] contrast-[1.1] opacity-60 group-hover:opacity-80 transition-all duration-[2s]"
               />
               
               {/* Atmospheric Overlays */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(205,167,85,0.08),transparent_50%)]" />
               
               {/* Quiet Operational Label */}
               <div className="absolute bottom-12 left-12 flex items-center gap-4 px-6 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-[#CDA755] animate-pulse" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Telemetry Active</span>
               </div>
             </div>
             
             {/* Amber Edge Glow */}
             <div className="absolute -inset-10 bg-[#CDA755]/[0.02] blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[3s] -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
