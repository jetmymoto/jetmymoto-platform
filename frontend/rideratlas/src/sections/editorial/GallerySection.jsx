import React from "react";
import SafeImage from "@/components/ui/SafeImage";

/**
 * GallerySection - High-resolution visual grid for POIs or terrain.
 */
export default function GallerySection({
  title = "Geographical Intelligence",
  images = [],
  theme = "dark",
}) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const accentColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";

  if (!images || images.length === 0) return null;

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-12 bg-[#CDA755]/50" />
        <h3 className={`text-xl font-headline font-bold uppercase tracking-[0.2em] ${textColor}`}>
          {title}
        </h3>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {images.map((img, i) => (
          <div key={i} className={`aspect-square overflow-hidden rounded-2xl border border-white/5 group`}>
            <SafeImage 
              src={img.url || img} 
              alt={img.label || `Gallery ${i}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              showPlaceholder={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
