import { Link, useLocation } from "react-router-dom";
import { withBrandContext } from "@/utils/navigationTargets";

const RegionsGrid = ({ regions = [] }) => {
  const location = useLocation();
  const withCtx = (path) => withBrandContext(path, location.search);

  if (!regions.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <h2 className="text-2xl font-bold uppercase italic mb-10">
        Ride Regions
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        {regions.map(region => (

          <Link
            key={region.slug}
            to={withCtx(`/destination/${region.slug}`)}
            className="border border-zinc-800 p-6 hover:border-amber-500 transition"
          >
            <h3 className="text-lg font-semibold">
              {region.name}
            </h3>
          </Link>

        ))}

      </div>

    </section>
  );
};

export default RegionsGrid;
