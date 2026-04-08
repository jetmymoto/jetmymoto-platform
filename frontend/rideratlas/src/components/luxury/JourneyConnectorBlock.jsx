export default function JourneyConnectorBlock({ airport }) {
  return (
    <section className="py-32 md:py-48 px-6 md:px-16 max-w-4xl">
      <p className="font-serif text-2xl md:text-4xl text-white/90 leading-relaxed tracking-tight">
        From {airport.name}, the road unfolds toward{" "}
        <span className="text-white italic">
          {airport.region || airport.city || "new horizons"}
        </span>.
      </p>

      <p className="mt-8 text-white/50 text-lg font-serif">
        Within hours, the city fades behind you and the landscape begins to rise.
      </p>
    </section>
  );
}
