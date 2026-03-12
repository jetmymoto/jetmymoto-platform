import React from 'react';
import { motion } from 'framer-motion';
import DeploymentCard from '@/components/airport/DeploymentCard';
import { CloudSnow, Sun, Wind, CloudRain } from 'lucide-react';
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet

const mockMissions = [
  {
    id: "alps-muc",
    airport_name: "Munich International",
    region_desc: "The Gateway to High Alpine Passes.",
    airport_code: "MUC",
    country_code: "DE",
    coords: { lat: "48.3537° N", long: "11.7750° E" },
    weather: { temp: "14°C", condition: "Crisp", Icon: CloudSnow },
    rental: { price: "189", class: "Premium Adventure" }
  },
  {
    id: "med-bcn",
    airport_name: "Barcelona–El Prat",
    region_desc: "Mediterranean Coast Meets Pyrenees.",
    airport_code: "BCN",
    country_code: "ES",
    coords: { lat: "41.2974° N", long: "2.0833° E" },
    weather: { temp: "22°C", condition: "High Sun", Icon: Sun },
    rental: { price: "169", class: "Sport-Touring" }
  },
  {
    id: "hills-flr",
    airport_name: "Florence Peretola",
    region_desc: "The Heart of Tuscan Strade Bianche.",
    airport_code: "FLR",
    country_code: "IT",
    coords: { lat: "43.8100° N", long: "11.2012° E" },
    weather: { temp: "19°C", condition: "Warm", Icon: Wind },
    rental: { price: "199", class: "Heritage / Scrambler" }
  },
  {
    id: "desert-agp",
    airport_name: "Málaga–Costa del Sol",
    region_desc: "Sun-Drenched Sierras & Arid Plains.",
    airport_code: "AGP",
    country_code: "ES",
    coords: { lat: "36.6749° N", long: "4.4991° W" },
    weather: { temp: "28°C", condition: "Arid", Icon: Sun },
    rental: { price: "179", class: "Heavy Cruiser" }
  },
  {
    id: "riviera-nce",
    airport_name: "Nice Côte d'Azur",
    region_desc: "Iconic Cliffs & Glamorous Coastal Runs.",
    airport_code: "NCE",
    country_code: "FR",
    coords: { lat: "43.6653° N", long: "7.2150° E" },
    weather: { temp: "21°C", condition: "Clear", Icon: Wind },
    rental: { price: "199", class: "Naked / Cafe Racer" }
  },
  {
    id: "highland-inv",
    airport_name: "Inverness Airport",
    region_desc: "Rugged Highlands & Isle of Skye Quests.",
    airport_code: "INV",
    country_code: "GB",
    coords: { lat: "57.5425° N", long: "4.0475° W" },
    weather: { temp: "11°C", condition: "Misty", Icon: CloudRain },
    rental: { price: "185", class: "All-Terrain Boxer" }
  }
];

const HomePage = () => {
    return (
        <main className="bg-[#050505] min-h-screen py-20">
            <SeoHelmet
                title="RiderAtlas | Motorcycle Adventures & Global Expeditions"
                description="Discover epic motorcycle routes, plan your next adventure, and explore global riding destinations with RiderAtlas."
                canonicalUrl="https://jetmymoto.com/"
            />
            <div className="container mx-auto max-w-7xl px-6">
                <h1 className="text-5xl font-bold text-white mb-12">Deployment Sectors</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockMissions.map((mission) => (
                        <DeploymentCard key={mission.id} mission={mission} />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default HomePage;
