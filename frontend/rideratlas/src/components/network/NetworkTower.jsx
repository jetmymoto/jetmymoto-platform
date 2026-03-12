import TowerHero from "./TowerHero";
import InfrastructureMetrics from "./InfrastructureMetrics";
import RegionsGrid from "./RegionsGrid";
import RoutesGrid from "./RoutesGrid";
import GlobalCTA from "./GlobalCTA";

import DeploymentCard from "@/components/airport/DeploymentCard";

const NetworkTower = ({
  level = "global",
  config,
  airports = [],
  regions = [],
  routes = [],
  clusters = []
}) => {

  const isGlobal = level === "global";
  const isContinent = level === "continent";
  const isCountry = level === "country";

  return (
    <>
      <TowerHero
        title={config.hero}
        description={config.description}
      />

      {(isGlobal || isContinent) && (
        <InfrastructureMetrics airports={airports} />
      )}

      {(isContinent || isCountry || isGlobal) && (
        <section className="max-w-7xl mx-auto px-6 py-20">

          <h2 className="text-2xl font-bold uppercase italic mb-10">
            {clusters.length > 0 ? "Adventure Networks" : "Deployment Hubs"}
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {clusters.length > 0 ? (
              clusters.map((cluster) => (
                <DeploymentCard
                  key={cluster.id}
                  mission={{
                    airport_name: cluster.title,
                    region_desc: `${cluster.routeCount} routes available`,
                    airport_code: cluster.airport.iata,
                    country_code: cluster.airport.country,
                    coords: { lat: cluster.airport.lat, long: cluster.airport.lon },
                    rental: {},
                    weather: {}
                  }}
                />
              ))
            ) : (
              airports.slice(0,6).map((airport) => (
                <DeploymentCard
                  key={airport.code}
                  mission={{
                    airport_name: airport.city,
                    airport_code: airport.code,
                    region_desc: airport.country
                  }}
                />
              ))
            )}

          </div>

        </section>
      )}

      {(isGlobal || isContinent) && (
        <RegionsGrid regions={regions} />
      )}

      {clusters.length === 0 && <RoutesGrid routes={routes} />}

      <GlobalCTA />
    </>
  );
};

export default NetworkTower;