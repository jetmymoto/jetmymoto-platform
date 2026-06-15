import type { Route } from "../../../core/graph/types";
import RouteCard from "../../routes/components/RouteCard";

interface Props {
  airportCode: string;
  routes: Route[];
}

export default function RouteCinema({ airportCode, routes }: Props) {
  if (routes.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--atlas-ink)] overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-[var(--atlas-gold)] opacity-50" />
          <h2 className="text-[var(--atlas-gold)] text-xs font-bold uppercase tracking-[0.3em]">
            Route Cinema <span className="opacity-40 mx-2">/</span> {airportCode}
          </h2>
        </div>
        <h3 className="text-white text-4xl md:text-6xl font-serif mt-6 tracking-tighter">
          Pick the film you want to ride.
        </h3>
      </div>
      
      <div className="flex gap-6 px-8 overflow-x-auto no-scrollbar scroll-smooth">
        {routes.map((route) => (
          <div key={route.slug} className="flex-shrink-0">
            <RouteCard route={route} />
          </div>
        ))}
        <div className="flex-shrink-0 w-8" />
      </div>
    </section>
  );
}
