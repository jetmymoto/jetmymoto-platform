export function generateAirportSchema(airport) {

  if (!airport) return null

  return {
    "@context": "https://schema.org",
    "@type": "Airport",

    name: `${airport.city || "Unknown City"} Airport (${(airport.code || "")})`,

    identifier: (airport.code || ""),
    iataCode: (airport.code || ""),

    url: `https://jetmymoto.com/airport/${airport.slug}-motorcycle-shipping`,

    address: {
      "@type": "PostalAddress",
      addressCountry: (airport.country || "").toUpperCase()
    },

    areaServed: {
      "@type": "Place",
      name: airport.region
    },

    geo: {
      "@type": "GeoCoordinates",
      latitude: airport.lat || null,
      longitude: airport.lng || null
    },

    description:
      `Motorcycle air freight and logistics services from ${airport.city || "Unknown City"} Airport (${(airport.code || "")}). JetMyMoto provides secure motorcycle air transport worldwide.`,

    provider: {
      "@type": "Organization",
      name: "JetMyMoto",
      url: "https://jetmymoto.com"
    }
  }

}