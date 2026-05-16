import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GRAPH } from "@/core/network/networkGraph";
import { ArrowRight, MapPin, Navigation, Phone, ExternalLink } from "lucide-react";
import { withBrandContext } from "@/utils/navigationTargets";

function AirportControlPanel({ data, airport }) {
    const location = useLocation();
    const withCtx = (path) => withBrandContext(path, location.search);
    const routeSlugs = GRAPH.routesByAirport?.[airport?.code] || [];
    const routes = routeSlugs.map(r => GRAPH.routes[r]).filter(Boolean);
    const destinations = routes.map(r => r.destination).filter(Boolean);
    const uniqueDestinations = Array.from(new Map(destinations.map(d => [d.slug, d])).values());

    const graphAirport = GRAPH.airports?.[airport?.code];
    const intel = graphAirport?.operational_intel;
  
    return (
      <section id="control" className="py-20 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-wide uppercase text-[#CDA755] mb-2">Hub Services</p>
              <h2 className="text-3xl font-serif font-bold text-zinc-900">
                Hub Overview &amp; Amenities
              </h2>
            </div>
            <p className="text-sm text-zinc-500 max-w-xs md:text-right leading-relaxed">
              Verify live information with {airport?.name}.
              <br />
              <span className="text-[#CDA755]">
                {routes.length} routes &middot; {uniqueDestinations.length} destinations
              </span>
            </p>
          </div>

          {/* Operational Intel Bar */}
          {intel && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {intel?.arrival_link && (
                <a href={intel.arrival_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                  <div className="p-2 rounded-xl bg-[#CDA755]/10">
                    <ExternalLink size={16} className="text-[#CDA755]" />
                  </div>
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Live Arrivals</span>
                </a>
              )}
              {intel?.departure_link && (
                <a href={intel.departure_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                  <div className="p-2 rounded-xl bg-[#CDA755]/10">
                    <ExternalLink size={16} className="text-[#CDA755]" />
                  </div>
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Live Departures</span>
                </a>
              )}
              {intel?.baggage_phone && (
                <a href={`tel:${intel.baggage_phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                  <div className="p-2 rounded-xl bg-rose-50">
                    <Phone size={16} className="text-rose-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Baggage</span>
                    <span className="text-xs text-zinc-400">{intel.baggage_phone}</span>
                  </div>
                </a>
              )}
              {intel?.general_phone && (
                <a href={`tel:${intel.general_phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <Phone size={16} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Info Desk</span>
                    <span className="text-xs text-zinc-400">{intel.general_phone}</span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* External Utilities */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-16">
            {data.map((item, i) => (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all text-center">
                <div className="p-2.5 rounded-xl bg-zinc-50 group-hover:bg-[#CDA755]/10 transition-colors">
                  <item.icon size={18} className="text-zinc-500 group-hover:text-[#CDA755] transition-colors" />
                </div>
                <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">
                  {item.label}
                </span>
              </a>
            ))}
          </div>

          {/* Routes & Destinations */}
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs tracking-wide uppercase text-zinc-400 mb-6 flex items-center gap-2">
                <Navigation size={14} className="text-[#CDA755]" /> Routes from this hub
              </h3>
              <div className="grid gap-2">
                {routes.slice(0, 10).map(route => (
                  <Link key={route.slug} to={withCtx(`/route/${route.slug}`)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                    <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
                      {route.title || `${route.airport?.city || airport?.city} to ${route.destination?.name || "Open Route"}`}
                    </span>
                    <ArrowRight size={14} className="text-zinc-300 group-hover:text-[#CDA755] transition-colors" />
                  </Link>
                ))}
                {routes.length > 10 && (
                  <p className="text-xs text-zinc-400 mt-2">+ {routes.length - 10} more routes</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs tracking-wide uppercase text-zinc-400 mb-6 flex items-center gap-2">
                <MapPin size={14} className="text-[#CDA755]" /> Curated destinations
              </h3>
              <div className="grid gap-2">
                {uniqueDestinations.map(dest => (
                  <Link key={dest.slug} to={withCtx(`/destination/${dest.slug}`)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">{dest.name}</span>
                      <span className="text-xs text-zinc-400">{dest.region || dest.country}</span>
                    </div>
                    <ArrowRight size={14} className="text-zinc-300 group-hover:text-[#CDA755] transition-colors" />
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
