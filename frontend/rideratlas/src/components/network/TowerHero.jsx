const TowerHero = ({ title, description }) => {

  return (
    <section className="py-32 text-center border-b border-white/5">

      <h1 className="text-5xl font-bold uppercase italic mb-6">
        {title}
      </h1>

      <p className="text-zinc-400 max-w-2xl mx-auto">
        {description}
      </p>

    </section>
  );
};

export default TowerHero;