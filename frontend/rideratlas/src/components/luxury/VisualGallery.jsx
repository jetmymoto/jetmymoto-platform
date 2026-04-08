import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

export default function VisualGallery({ items = [] }) {
  if (!items || items.length === 0) return null;
  const displayItems = items.slice(0, 5);

  return (
    <section className="bg-[#050505] py-32 md:py-48 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        {displayItems.map((item, idx) => (
          <FadeIn key={item.id || idx} delay={idx * 0.1} className="relative aspect-[4/5] group overflow-hidden bg-[#111]">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] grayscale transition-all duration-[1.5s] ease-out group-hover:scale-110 group-hover:grayscale-0" 
              />
            )}
            <div className="absolute inset-0 bg-[#050505]/20 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute bottom-8 left-0 right-0 text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <h3 className="text-xl font-serif text-white">{item.title}</h3>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
