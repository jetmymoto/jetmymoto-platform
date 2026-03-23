import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GRAPH } from "@/core/network/networkGraph";
import { ArrowRight, MapPin, Navigation } from "lucide-react";

function AirportControlPanel({ data, airport }) {
    const routeSlugs = GRAPH.routesByAirport?.[airport?.code] || [];
    const routes = routeSlugs.map(r => GRAPH.routes[r]).filter(Boolean);
    const destinations = routes.map(r => r.destination).filter(Boolean);
    
    // Group destinations by unique slug
    const uniqueDestinations = Array.from(new Map(destinations.map(d => [d.slug, d])).values());

    const getCategoryTheme = (cat) => {
      switch (cat) {
        case "Auth":
          return "border-rose-500/10 hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-500/70 group-hover:text-rose-400";
        case "Transfer":
          return "border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-500/70 group-hover:text-blue-400";
        default:
          return "border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 text-zinc-500 group-hover:text-amber-500";
      }
    };
  
    return (
      <section id="control" className="py-20 bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase italic mb-3">
                LIVE_AIRPORT_ACCESS_PANEL
              </div>
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">
                Airport Control Panel
              </h2>
            </div>
            <div className="text-[10px] font-mono text-zinc-600 italic uppercase tracking-widest max-w-[300px] md:text-right">
              Operational utility hub. Verify details with {airport?.name} authority.
              <br />
              <span className="text-amber-500/80 mt-1 block">
                Serving {routes.length} routes across {uniqueDestinations.length} destinations.
              </span>
            </div>
          </div>
  
          {/* External Utilities */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2 mb-12">
            {data.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border bg-zinc-900/20 backdrop-blur-md transition-all duration-300 text-center ${getCategoryTheme(
                  item.category
                )}`}
              >
                <item.icon
                  size={20}
                  className="transition-all duration-300 group-hover:scale-110"
                />
                <span
                  className={`text-[9px] font-mono font-black uppercase tracking-widest transition-colors ${
                    item.category === "Auth"
                      ? "text-rose-500/60 group-hover:text-white"
                      : "text-zinc-500 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Active Routes */}
            <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                    <Navigation size={14} className="text-amber-500" /> Active Expedition Routes
                </h3>
                <div className="grid gap-2">
                    {routes.slice(0, 10).map(route => (
                        <Link 
                            key={route.slug} 
                            to={`/route/${route.slug}`}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                            <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                                {route.title || `${route.airport?.city || airport?.city} to ${route.destination?.name || "Open Route"}`}
                            </span>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                        </Link>
                    ))}
                    {routes.length > 10 && (
                        <div className="text-[10px] font-mono text-zinc-600 uppercase italic mt-2">
                            + {routes.length - 10} more routes available in theater
                        </div>
                    )}
                </div>
            </div>

            {/* Primary Destinations */}
            <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                    <MapPin size={14} className="text-amber-500" /> Tactical Riding Destinations
                </h3>
                <div className="grid gap-2">
                    {uniqueDestinations.map(dest => (
                        <Link 
                            key={dest.slug} 
                            to={`/destination/${dest.slug}`}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                                    {dest.name}
                                </span>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 group-hover:text-amber-500/60 transition-colors">
                                    {dest.region || dest.country}
                                </span>
                            </div>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  export default AirportControlPanel;
