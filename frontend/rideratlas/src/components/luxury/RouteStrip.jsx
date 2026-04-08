import { FadeIn } from "./FadeIn";
import { Link } from "react-router-dom";
import { withBrandContext } from "@/utils/navigationTargets";

export default function RouteStrip({ routes = [] }) {
  if (!routes || routes.length === 0) return null;

  // We limit to 3 or 4 minimal route links for editorial feel
  const limitedRoutes = routes.slice(0, 4);

  return (
    <section className="bg-[#050505] py-40 md:py-56 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <FadeIn className="text-center mb-24">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#CDA755] font-medium">Verified Lines</span>
          <h2 className="mt-6 text-3xl md:text-4xl font-serif text-white tracking-tight">Curated Routes</h2>
        </FadeIn>
        
        <div className="space-y-6">
          {limitedRoutes.map((route, idx) => {
             const routeName = route?.name || route?.title || route?.slug?.replace(/-/g, " ");
             const dist = route?.distanceKm || route?.distance_km || route?.distance;
             
             return (
               <FadeIn key={route.slug || route.id} delay={idx * 0.1} className="group">
                  <Link 
                    to={withBrandContext(`/route/${route.slug || route.id}`)}
                    className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/10 transition-colors hover:border-[#CDA755]/40"
                  >
                    <div>
                      <h3 className="text-2xl font-serif text-white group-hover:text-[#CDA755] transition-colors">{routeName}</h3>
                    </div>
                    {dist && (
                      <div className="mt-2 md:mt-0 text-xs font-serif italic text-white/50 group-hover:text-white/80 transition-colors">
                        {Math.round(parseFloat(dist))} km
                      </div>
                    )}
                  </Link>
               </FadeIn>
             );
          })}
        </div>
      </div>
    </section>
  );
}
