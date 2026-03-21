import React, { useMemo, useEffect } from "react";
import { MapPin } from "lucide-react";
import { GRAPH } from "@/core/network/networkGraph";

// Components
import ArrivalOS from "./sections/ArrivalOS";
import {
  RecoverySection,
  UtilitySection,
  CityExtensionSection,
  RankingCards,
  PainPointsSection,
  PivotSection
} from "./sections/AirportSections";
import AirportControlPanel from "./sections/AirportControlPanel";
import RoutesGrid from "@/components/network/RoutesGrid";
import MotoAirliftBookingForm from "@/features/booking/MotoAirliftBookingForm";

const HERO_VIDEO =
  "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/site_videos%2F_Cont.%20EuropePageH1video.mp4?alt=media&token=d27e77c5-f34f-4486-a78d-a88f46296c02";

export default function AirportTemplate({
  airport,
  intent,
  setIntent
}) {
  if (!airport) {
    return <div className="p-20 text-white">Loading airport...</div>;
  }

  const a = {
    code: airport.code ?? "UNK",
    name: airport.name ?? "",
    city: airport.city ?? "",
    country: airport.country ?? "",
    continent: airport.continent ?? "",
    region: airport.region ?? "",
    motto: airport.motto ?? "",
    staging: airport.staging ?? "",

    hero: {
      videoUrl: airport.hero?.videoUrl ?? HERO_VIDEO,
      posterUrl: airport.hero?.posterUrl ?? "",
    },

    controlPanel: Array.isArray(airport.controlPanel)
      ? airport.controlPanel
      : [],

    utilities: Array.isArray(airport.utilities)
      ? airport.utilities
      : [],

    recovery: airport.recovery ?? {
      premium: { name: "", location: "", href: "#", features: [] },
      budget: { name: "", location: "", href: "#", features: [] }
    },

    cityExtension: airport.cityExtension?.enabled
      ? airport.cityExtension
      : { enabled: false, headline: "", subline: "", items: [] },
  };

  const airportRoutes = useMemo(() => {
    return GRAPH.routesByAirport?.[a.code]
      ?.map(slug => GRAPH.routes[slug])
      .filter(Boolean) ?? [];
  }, [a.code]);

  const { derivedRegions, derivedCountries, derivedTheater } = useMemo(() => {
    const rSet = new Set();
    const cSet = new Set();

    airportRoutes.forEach(r => {
      if (r.destination?.region) rSet.add(r.destination.region);
      if (r.destination?.country) cSet.add(r.destination.country);
    });

    const cluster = Object.values(GRAPH.clusters || {}).find(c =>
      c.airports?.includes(a.code)
    );

    return {
      derivedRegions: Array.from(rSet),
      derivedCountries: Array.from(cSet),
      derivedTheater: cluster?.region || a.continent || "Global"
    };
  }, [airportRoutes, a.code, a.continent]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("AIRPORT TEMPLATE ACTIVE:", a.code);
    }
  }, [a.code]);

  // allow future override via a.rankings; fallback to defaults
  const defaultRankingData = useMemo(
    () => ({
      moto: [
        {
          rank: "1",
          winner: true,
          title: "JetMyMoto MotoAirlift",
          price: "From €850",
          priceDetail: "round trip",
          bestFor: "Passionate Missions (4+ days)",
          sub: "Your own bike, received, prepped, and staged at our Riviera depot. Fly in, ride out.",
          access: "Handover corridor: 12 min",
          type: "internal",
          href: "#",
          cta: "Request Logistics Quote",
          features: ["Your own bike", "No deposit lock", "Prepped & ready"],
        },
        {
          rank: "2",
          winner: false,
          title: "Premium Motorcycle Rental",
          price: "€190",
          priceDetail: "/ day (avg)",
          bestFor: "Premium Comfort (2–3 days)",
          sub: "Late model GS / Multistrada. High daily rates + significant deposit locks.",
          access: "Terminal desk: 5 min",
          type: "internal",
          href: "#",
          cta: "Notify When Live",
          features: ["Recent models", "Airport pickup", "High deposit"],
        },
      ],
      car: [
        {
          rank: "1",
          winner: true,
          title: "Sixt Premium (T1 & T2)",
          price: "From €115",
          priceDetail: "/ day (avg)",
          bestFor: "Premium comfort & speed",
          sub: "Most consistent premium fleet at Terminal 1 & 2 (BMW/Audi). Fast track available.",
          access: "Terminal desk: 3 min",
          type: "affiliate",
          href: "https://www.sixt.com/car-rental/france/nice/nice-cote-dazur-airport/",
          cta: "Check Sixt deals",
          features: ["Terminal desk", "Premium fleet", "Fast check-in"],
        },
        {
          rank: "2",
          winner: false,
          title: "Europcar / Hertz",
          price: "€85",
          priceDetail: "/ day (avg)",
          bestFor: "Reliable mid-range",
          sub: "Large inventory. Expect queues in peak season. Standard fleet specs.",
          access: "Terminal desk: 15 min queue risk",
          type: "internal",
          href: "#",
          cta: "Request Partner Quote",
          features: ["Large fleet", "Terminal desk", "Peak queues"],
        },
      ],
    }),
    []
  );

  const rankingData = a.rankings || defaultRankingData;
  const items = rankingData?.[intent] ?? [];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO + ARRIVAL OPS */}
      <ArrivalOS
        airport={a}
        intent={intent}
        setIntent={setIntent}
        airportRoutes={airportRoutes}
        derivedRegions={derivedRegions}
        derivedCountries={derivedCountries}
        derivedTheater={derivedTheater}
        rankingData={rankingData}
      />

      {/* CONTROL PANEL — SHOULD BE RIGHT AFTER HERO */}
      <AirportControlPanel
        airport={a}
        data={a.controlPanel}
      />

      {/* EXPERIENCE SECTIONS */}
      <RankingCards items={items} />

      <PainPointsSection airport={a.code} />

      <PivotSection airport={a.code} />

      <RecoverySection data={a.recovery} />

      <UtilitySection data={a.utilities} />

      <CityExtensionSection data={a.cityExtension} />

      {/* ROUTES */}
      <RoutesGrid routes={airportRoutes} />

      {/* BOOKING */}
      <MotoAirliftBookingForm />

      {/* FOOTER */}
      <footer className="py-20 bg-black border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase mb-8 italic flex items-center justify-center gap-2 underline">
            <MapPin size={12}/> Regional Nodes: GVA | NCE | MRS | BCN | MUC
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 text-[10px] font-mono italic uppercase tracking-widest">
            <div>© 2025 JetMyMoto Ops. Precision Handover Infrastructure.</div>

            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Tactical_Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact_Command</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
