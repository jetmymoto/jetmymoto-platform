import { getRentalRailItemsByAirport } from "../../rentals/services/rentalAdapter";
import RentalMissionCard from "../../rentals/components/RentalMissionCard";

interface Props {
  airportCode: string;
}

export default function MissionFleet({ airportCode }: Props) {
  const fleet = getRentalRailItemsByAirport(airportCode).slice(0, 3);

  if (fleet.length === 0) return null;

  return (
    <section className="py-24 bg-[#0B0B0C] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col gap-12">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h2 className="text-[#CDA755] text-xs font-black uppercase tracking-[0.4em]">Curated Mission Fleet</h2>
            <h3 className="text-white text-4xl font-bold tracking-tighter">Machine selection for theater deployment.</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              We've pre-selected the optimal ADV machines available at {airportCode} for this specific mission profile. 
              Verified readiness. Genuine performance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {fleet.map((item) => (
              <div key={item.id} className="flex-shrink-0">
                <RentalMissionCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
