// Curated motorcycle images for mission cards from Firebase Storage
// Based on Firestore motorcycles collection query results

export const MOTORCYCLE_IMAGES = {
  // High-resolution hero images with cinematic scores
  sport: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fg310rr%2F2.jpg?alt=media",
      brand: "BMW",
      model: "G310RR",
      heroScore: 90,
      aspectRatio: 1.5,
      type: "sport"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fm1000rr%2F3.jpg?alt=media",
      brand: "BMW",
      model: "M1000RR",
      heroScore: 110,
      aspectRatio: 1.54,
      type: "sport"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fs1000rr%2F5.jpg?alt=media",
      brand: "BMW",
      model: "S1000RR",
      heroScore: 110,
      aspectRatio: 1.7,
      type: "sport"
    }
  ],

  adventure: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fr1300gs%2F1.jpg?alt=media",
      brand: "BMW",
      model: "R1300GS",
      heroScore: 130,
      aspectRatio: 1.78,
      type: "adventure"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fr1300gs-adventure%2F2.jpg?alt=media",
      brand: "BMW",
      model: "R1300GS Adventure",
      heroScore: 105,
      aspectRatio: 1.6,
      type: "adventure"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Ff900gs%2F2.jpg?alt=media",
      brand: "BMW",
      model: "F900GS",
      heroScore: 100,
      aspectRatio: 1.5,
      type: "adventure"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fducati%2F2025-5-ducati-multistrada-v2%2F2.jpg?alt=media",
      brand: "Ducati",
      model: "Multistrada V2",
      heroScore: 110,
      aspectRatio: 1.43,
      type: "adventure"
    }
  ],

  touring: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fk1600-grand-america%2F4.jpg?alt=media",
      brand: "BMW",
      model: "K1600 Grand America",
      heroScore: 135,
      aspectRatio: 1.78,
      type: "touring"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fk1600gt%2F4.jpg?alt=media",
      brand: "BMW",
      model: "K1600GT",
      heroScore: 135,
      aspectRatio: 1.78,
      type: "touring"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fr18%2F5.jpg?alt=media",
      brand: "BMW",
      model: "R18",
      heroScore: 115,
      aspectRatio: 1.85,
      type: "touring"
    }
  ],

  mountain: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Faprilia%2Ftuareg-660%2F1.jpg?alt=media",
      brand: "Aprilia",
      model: "Tuareg 660",
      heroScore: 70,
      aspectRatio: 2.91,
      type: "mountain"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Ff800gs%2F1.jpg?alt=media",
      brand: "BMW",
      model: "F800GS",
      heroScore: 110,
      aspectRatio: 1.37,
      type: "mountain"
    }
  ],

  naked: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Faprilia%2Ftuono-v4-factory%2F1.jpg?alt=media",
      brand: "Aprilia",
      model: "Tuono V4 Factory",
      heroScore: 110,
      aspectRatio: 1.5,
      type: "naked"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Faprilia%2Ftuono-660%2F1.jpg?alt=media",
      brand: "Aprilia",
      model: "Tuono 660",
      heroScore: 70,
      aspectRatio: 2.91,
      type: "naked"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fm1000r%2F4.jpg?alt=media",
      brand: "BMW",
      model: "M1000R",
      heroScore: 110,
      aspectRatio: 1.71,
      type: "naked"
    }
  ],

  coastal: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fc400x%2F2.jpg?alt=media",
      brand: "BMW",
      model: "C400X",
      heroScore: 110,
      aspectRatio: 1.28,
      type: "coastal"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Fbmw%2Fce04%2F1.jpg?alt=media",
      brand: "BMW",
      model: "CE04",
      heroScore: 105,
      aspectRatio: 1.74,
      type: "coastal"
    }
  ],

  offroad: [
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Faprilia%2Fsx125%2F2.jpg?alt=media",
      brand: "Aprilia",
      model: "SX125",
      heroScore: 105,
      aspectRatio: 1.5,
      type: "offroad"
    },
    {
      url: "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/13clean%2Faprilia%2Frx125%2F3.jpg?alt=media",
      brand: "Aprilia",
      model: "RX125",
      heroScore: 95,
      aspectRatio: 1.3,
      type: "offroad"
    }
  ]
};

// Mapping mission ride types to motorcycle categories
export const MISSION_TO_MOTORCYCLE_TYPE = {
  "Mountain": "mountain",
  "Adventure": "adventure",
  "Touring": "touring",
  "Coastal": "coastal",
  "Off-road": "offroad",
  "Sport": "sport",
  "Naked": "naked"
};

// Get the best motorcycle image for a mission
export function getMotorcycleImageForMission(mission) {
  const rideType = mission.rideType || "Adventure";
  const motorcycleType = MISSION_TO_MOTORCYCLE_TYPE[rideType] || "adventure";

  const availableImages = MOTORCYCLE_IMAGES[motorcycleType] || MOTORCYCLE_IMAGES.adventure;

  // Get a deterministic image based on mission slug to ensure consistency
  const slug = mission.slug || mission.title || "";
  const index = Math.abs(slug.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % availableImages.length;

  return availableImages[index];
}

// Get all high-scoring images (hero score > 100) for premium missions
export function getPremiumMotorcycleImages() {
  return Object.values(MOTORCYCLE_IMAGES)
    .flat()
    .filter(img => img.heroScore > 100)
    .sort((a, b) => b.heroScore - a.heroScore);
}