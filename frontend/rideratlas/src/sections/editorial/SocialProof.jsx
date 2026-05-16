import React from "react";
import { Star, Quote } from "lucide-react";

/**
 * SocialProof - Displays rider testimonials or trust indicators.
 */
export default function SocialProof({
  testimonials = [
    { name: "Marcus V.", role: "Adventure Rider", content: "The MUC hub deployment was seamless. My R1300GS was staged and ready at the terminal gate.", rating: 5 },
    { name: "Elena S.", role: "Touring Enthusiast", content: "No backtracking. I flew into Milan, rode the Alps, and dropped the bike in Munich. Pure efficiency.", rating: 5 }
  ],
  theme = "light",
}) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-[#050505]" : "bg-[#F7F3EA]";
  const cardColor = isDark ? "bg-[#121212]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";

  return (
    <section className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className={`font-mono text-[10px] uppercase tracking-[0.4em] font-bold mb-4 ${accentColor}`}>
          Rider Network Intel
        </div>
        <h2 className={`text-3xl font-headline font-bold uppercase tracking-tight ${textColor}`}>
          Verified Logistics Performance
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <div key={i} className={`p-8 lg:p-12 rounded-[32px] border relative ${cardColor} ${borderColor} shadow-xl`}>
            <Quote className={`absolute top-8 right-8 opacity-10 ${accentColor}`} size={60} />
            
            <div className="flex gap-1 mb-6">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} size={14} className="fill-[#CDA755] text-[#CDA755]" />
              ))}
            </div>

            <p className={`text-lg mb-8 leading-relaxed italic ${isDark ? "text-zinc-300" : "text-[#706F6C]"}`}>
              "{t.content}"
            </p>

            <div>
              <div className={`font-black uppercase tracking-tight ${textColor}`}>{t.name}</div>
              <div className={`text-[10px] font-mono uppercase tracking-widest ${accentColor}`}>{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
