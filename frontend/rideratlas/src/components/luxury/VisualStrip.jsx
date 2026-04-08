import { FadeIn } from "./FadeIn";

export default function VisualStrip({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[#050505] pb-40">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        {items.map((item, idx) => (
          <FadeIn key={item.id || idx} delay={idx * 0.15} className="relative aspect-[4/5] md:aspect-auto md:h-[70vh] group overflow-hidden bg-[#111]">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] grayscale-[30%] transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:grayscale-0" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-[#050505]/10 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-70" />
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center text-center px-6">
              {item.eyebrow && (
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#CDA755] mb-4 font-medium opacity-80">
                  {item.eyebrow}
                </span>
              )}
              <h3 className="text-2xl md:text-3xl font-serif text-white tracking-wide">{item.title}</h3>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
