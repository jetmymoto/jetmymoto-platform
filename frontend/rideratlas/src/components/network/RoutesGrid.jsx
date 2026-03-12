import { Link } from "react-router-dom";

const RoutesGrid = ({ routes = [] }) => {

  if (!routes.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">

      <h2 className="text-2xl font-bold uppercase italic mb-10">
        Popular Routes
      </h2>

      <ul className="space-y-4">

        {routes.slice(0,10).map(route => (

          <li key={route.slug}>

            <Link
              to={`/route/${route.slug}`}
              className="text-blue-500 hover:underline"
            >
              {route.airport.city} → {route.destination.name}
            </Link>

          </li>

        ))}

      </ul>

    </section>
  );
};

export default RoutesGrid;