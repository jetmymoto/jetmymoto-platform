import { FadeIn } from "./FadeIn";

export default function CuratedExperiences({ experiences = [] }) {
  if (!experiences || experiences.length === 0) return null;
  const displayExperiences = experiences.slice(0, 3);

  return (
    <section className="bg-[#050505] py-40 md:py-56 px-6 md:px-16">
      <div className="max-w-7xl mx-auto text-center">
        <FadeIn className="mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-medium">Elevated Stays & Stops</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-serif text-white tracking-tight">Curated Experiences</h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          {displayExperiences.map((exp, idx) => (
             <FadeIn key={exp.id || idx} delay={idx * 0.15} className="group relative aspect-[3/4] overflow-hidden bg-[#111]">
                {exp.imageUrl && (
                  <img 
                    src={exp.imageUrl} 
                    alt={exp.name} 
                    className="w-full h-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] transition-transform duration-[3s] ease-out group-hover:scale-110" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent opacity-80" />
                <div className="absolute bottom-12 left-0 right-0 px-6">
                  <h3 className="text-2xl md:text-3xl font-serif text-white tracking-wide mb-2">{exp.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#CDA755] font-medium">{exp.type || "Experience"}</p>
                </div>
             </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
