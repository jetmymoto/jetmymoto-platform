import { Link } from "react-router-dom";
import { FadeIn } from "./FadeIn";
import { withBrandContext } from "@/utils/navigationTargets";

export default function RoutesFromHere({ routes = [] }) {
  if (!routes || routes.length === 0) return null;
  const displayRoutes = routes.slice(0, 3);

  return (
    <section className="bg-[#050505] py-40 md:py-56 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-medium">Verified Lines</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-serif text-white tracking-tight">Routes From Here</h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          {displayRoutes.map((route, idx) => {
             const routeName = route?.name || route?.title || route?.slug?.replace(/-/g, " ");
             const description = route?.description || route?.cinematic_pitch || "A masterline journey through the region.";
             
             return (
               <FadeIn key={route.slug || route.id} delay={idx * 0.15} className="group flex flex-col items-center text-center">
                  <Link 
                    to={withBrandContext(`/route/${route.slug || route.id}`)}
                    className="w-full"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#111] mb-8">
                       {route.imageUrl && (
                         <img 
                           src={route.imageUrl} 
                           alt={routeName} 
                           className="w-full h-full object-cover contrast-[1.10] saturate-[.85] sepia-[.15] brightness-[0.95] transition-transform duration-[2s] ease-out group-hover:scale-105" 
                         />
                       )}
                       <div className="absolute inset-0 bg-[#050505]/20 group-hover:bg-transparent transition-colors duration-700" />
                    </div>
                    <h3 className="text-2xl font-serif text-white group-hover:text-[#CDA755] transition-colors duration-500 mb-4 tracking-wide">{routeName}</h3>
                    <p className="text-xs font-serif italic text-white/50 group-hover:text-white/80 transition-colors duration-500 max-w-[280px] mx-auto leading-relaxed">
                      "{description.split('.')[0]}"
                    </p>
                  </Link>
               </FadeIn>
             );
          })}
        </div>
      </div>
    </section>
  );
}
