const THEATER_MEDIA = {
  alpine: {
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1594914141274-12822be740ef?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Alpine mountain pass",
    overlayTone: "alpine",
    fallbackGradient: "linear-gradient(to bottom, #1a1a1a, #0d0d0d)"
  },
  "alpine-bavarian": {
    heroImage: "https://images.unsplash.com/photo-1533512930330-4ac35a519721?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Bavarian Alpine corridor",
    overlayTone: "alpine",
    fallbackGradient: "linear-gradient(to bottom, #1a1a1a, #0d0d0d)"
  },
  "mediterranean-iberian": {
    heroImage: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1504150559633-2175bc9ba99f?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Mediterranean coastal riding corridor",
    overlayTone: "coastal",
    fallbackGradient: "linear-gradient(to bottom, #1c3d5a, #0d0d0d)"
  },
  "british-gateway": {
    heroImage: "https://images.unsplash.com/photo-1473800447596-01729482b8eb?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1469013078759-d97a9178028e?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "British countryside riding corridor",
    overlayTone: "urban",
    fallbackGradient: "linear-gradient(to bottom, #2d3748, #0d0d0d)"
  },
  "nordic-fjord": {
    heroImage: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1533451515234-58a49ba82194?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Nordic fjord riding corridor",
    overlayTone: "nordic",
    fallbackGradient: "linear-gradient(to bottom, #1a202c, #0d0d0d)"
  },
  "aegean-balkan": {
    heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Aegean mountain riding corridor",
    overlayTone: "coastal",
    fallbackGradient: "linear-gradient(to bottom, #2b6cb0, #0d0d0d)"
  },
  "adriatic": {
    heroImage: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: "https://images.unsplash.com/photo-1563811771046-ba984ff30900?auto=format&fit=crop&q=80&w=1600",
    backgroundAlt: "Adriatic coastal riding corridor",
    overlayTone: "coastal",
    fallbackGradient: "linear-gradient(to bottom, #2c5282, #0d0d0d)"
  },
  fallback: {
    heroImage: "https://images.unsplash.com/photo-1542296332-2b4473faf563?auto=format&fit=crop&q=80&w=1600",
    backgroundImage: null,
    backgroundAlt: "Regional riding corridor",
    overlayTone: "dark",
    fallbackGradient: "linear-gradient(to bottom, #111111, #000000)"
  }
};

export function resolveAirportTheaterMedia(airport, theater) {
  const theaterId = theater?.theaterId || "fallback";
  return THEATER_MEDIA[theaterId] || THEATER_MEDIA.fallback;
}
