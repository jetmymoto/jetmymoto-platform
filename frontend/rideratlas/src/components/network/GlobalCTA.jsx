import { Link } from "react-router-dom";

const GlobalCTA = () => {

  return (
    <section className="py-24 text-center border-t border-white/5">

      <h3 className="text-3xl font-bold italic mb-4">
        Ready for your next deployment?
      </h3>

      <p className="text-zinc-400 mb-8">
        Our logistics officers align your machine with the ideal riding theater.
      </p>

      <Link
        to="/moto-airlift"
        className="px-8 py-4 border border-white/10 hover:border-amber-500 transition"
      >
        Request Global Deployment Strategy
      </Link>

    </section>
  );
};

export default GlobalCTA;
