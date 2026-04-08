import { Link } from "react-router-dom";
import { withBrandContext } from "@/utils/navigationTargets";

export default function DestinationsFromHere({ destinations = [] }) {
  if (!destinations || destinations.length === 0) return null;
  const curated = destinations.slice(0, 3);

  return (
    <section className="py-32 md:py-48 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-16 tracking-tight">
          Destinations from here
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          {curated.map((d) => (
            <Link 
              to={withBrandContext(`/destination/${d.slug}`)} 
              key={d.id || d.slug} 
              className="group block"
            >
              <div className="relative overflow-hidden bg-[#111] aspect-[4/5] mb-6">
                {d.imageUrl && (
                  <img
                    src={d.imageUrl}
                    alt={d.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-[#050505]/20 transition-colors duration-700 group-hover:bg-transparent" />
              </div>
              <p className="font-serif text-2xl text-white group-hover:text-[#CDA755] transition-colors duration-500">{d.name}</p>
              {d.region && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2">{d.region}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
