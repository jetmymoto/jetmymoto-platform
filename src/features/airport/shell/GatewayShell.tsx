import GatewayHero from "../sections/GatewayHero";
import RouteCinema from "../sections/RouteCinema";
import RentalMissionRail from "../../rentals/components/RentalMissionRail";
import ProofSection from "../components/proof/ProofSection";
import MissionIntelSection from "../components/intel/MissionIntelSection";
import DeploymentOptionsSection from "../components/options/DeploymentOptionsSection";
import type { Airport, Route } from "../../../core/graph/types";
import type { HeroPack } from "../../media/resolvers/airport";

interface Props {
  airport: Airport;
  routes: Route[];
  heroPack: HeroPack;
}

export default function GatewayShell({ airport, routes, heroPack }: Props) {
  return (
    <div className="bg-[var(--atlas-ink)] min-h-screen">
      <GatewayHero airportCode={airport.code} heroPack={heroPack} />
      
      <NetworkIntelPlaceholder airportCode={airport.code} />
      
      <RouteCinema airportCode={airport.code} routes={routes} />
      
      {/* Phase 5C Integration */}
      <RentalMissionRail airportCode={airport.code} />
      
      <ProofSection airportCode={airport.code} />
      
      <MissionIntelSection airportCode={airport.code} />
      
      <DeploymentOptionsSection airportCode={airport.code} />
      
      <footer className="p-12 text-[var(--atlas-muted)] text-[10px] uppercase tracking-widest opacity-30 text-center">
        RiderAtlas Clean Core — Architecture Verification Stage
      </footer>
    </div>
  );
}

function NetworkIntelPlaceholder({ airportCode }: { airportCode: string }) {
  return (
    <div className="p-12 border-b border-[var(--atlas-gold)]/10">
      <h3 className="text-[var(--atlas-gold)] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-50">
        Network Intel / {airportCode}
      </h3>
      <div className="h-24 bg-[var(--atlas-charcoal)] rounded-sm border border-[var(--atlas-gold)]/5 flex items-center justify-center italic text-[var(--atlas-muted)] text-xs">
        Real-time intelligence graph pending...
      </div>
    </div>
  );
}
