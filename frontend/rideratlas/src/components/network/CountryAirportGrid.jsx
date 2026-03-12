import { Link } from "react-router-dom";
import { AIRPORT_INDEX } from "@/features/airport/network/airportIndex";
import { ArrowUpRight } from "lucide-react";

const getFlagEmoji = (countryCode) => {
  if (!countryCode) return "🏳️";
  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
};

const CountryAirportGrid = ({ airports = [] }) => {

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

      {airports.map(airport => {

        if (!airport) return null;

        return (
          <Link
            key={airport.code}
            to={`/airport/${airport.slug}-motorcycle-shipping`}
            className="group border border-white/5 bg-zinc-900/40 hover:border-amber-500/40 p-6 transition-all"
          >

            <div className="flex justify-between mb-4">

              <span className="text-2xl">
                {getFlagEmoji(airport.country)}
              </span>

              <ArrowUpRight
                size={14}
                className="text-zinc-600 group-hover:text-amber-500"
              />

            </div>

            <h3 className="text-lg font-bold italic group-hover:text-amber-500 transition-colors">
              {airport.city}
            </h3>

            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-mono">
              {airport.code} Airport
            </p>

          </Link>
        );
      })}

    </div>
  );
};

export default CountryAirportGrid;