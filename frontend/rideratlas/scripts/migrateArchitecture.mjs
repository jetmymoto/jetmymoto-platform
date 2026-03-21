import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, '../data/routes/northAmericaRoutes.csv');
const DESTINATIONS_FILE = path.join(__dirname, '../src/features/routes/data/rideDestinations.js');
const POI_FILE = path.join(__dirname, '../src/features/poi/poiIndex.js');
const EXISTING_POI_JSON = path.join(__dirname, '../src/features/poi/poiIndex.json');

const MACRO_DESTINATIONS = {
  "alps": {
    slug: "alps",
    name: "European Alps",
    region: "alps",
    continent: "europe",
    coords: { lat: 46.5, lng: 10.0 }
  },
  "dolomites": {
    slug: "dolomites",
    name: "Dolomites",
    region: "alps",
    continent: "europe",
    coords: { lat: 46.5, lng: 12.1 }
  },
  "pyrenees": {
    slug: "pyrenees",
    name: "Pyrenees",
    region: "mountain",
    continent: "europe",
    coords: { lat: 42.6, lng: 1.0 }
  },
  "scottish-highlands": {
    slug: "scottish-highlands",
    name: "Scottish Highlands",
    region: "highlands",
    continent: "europe",
    coords: { lat: 57.1, lng: -4.3 }
  },
  "norwegian-fjords": {
    slug: "norwegian-fjords",
    name: "Norwegian Fjords",
    region: "fjords",
    continent: "europe",
    coords: { lat: 61.0, lng: 6.5 }
  },
  "wasatch-front": {
    slug: "wasatch-front",
    name: "Wasatch Front",
    region: "rockies",
    continent: "north-america",
    coords: { lat: 40.7, lng: -111.9 }
  },
  "mid-atlantic": {
    slug: "mid-atlantic",
    name: "Mid-Atlantic",
    region: "appalachians",
    continent: "north-america",
    coords: { lat: 39.0, lng: -77.0 }
  },
  "pacific-northwest": {
    slug: "pacific-northwest",
    name: "Pacific Northwest",
    region: "cascades",
    continent: "north-america",
    coords: { lat: 49.2, lng: -123.0 }
  },
  "socal-coast": {
    slug: "socal-coast",
    name: "Southern California",
    region: "coastal",
    continent: "north-america",
    coords: { lat: 33.0, lng: -116.5 }
  },
  "florida-gulf": {
    slug: "florida-gulf",
    name: "Florida Gulf Coast",
    region: "coastal",
    continent: "north-america",
    coords: { lat: 28.5, lng: -82.4 }
  },
  "tennessee-valley": {
    slug: "tennessee-valley",
    name: "Tennessee Valley",
    region: "appalachians",
    continent: "north-america",
    coords: { lat: 36.1, lng: -86.7 }
  },
  "quebec-laurentians": {
    slug: "quebec-laurentians",
    name: "Quebec & Laurentians",
    region: "laurentians",
    continent: "north-america",
    coords: { lat: 45.5, lng: -73.5 }
  },
  "hawaii-oahu": {
    slug: "hawaii-oahu",
    name: "Oahu",
    region: "pacific",
    continent: "north-america",
    coords: { lat: 21.4, lng: -157.9 }
  },
  "texas-hill-country": {
    slug: "texas-hill-country",
    name: "Texas Hill Country",
    region: "hill-country",
    continent: "north-america",
    coords: { lat: 30.2, lng: -98.0 }
  },
  "midwest-lakes": {
    slug: "midwest-lakes",
    name: "Midwest Lakes",
    region: "great-lakes",
    continent: "north-america",
    coords: { lat: 42.0, lng: -88.0 }
  }
};

const HUB_TO_DESTINATION = {
  "SLC": "wasatch-front",
  "BWI": "mid-atlantic",
  "DCA": "mid-atlantic",
  "IAD": "mid-atlantic",
  "YVR": "pacific-northwest",
  "SAN": "socal-coast",
  "TPA": "florida-gulf",
  "BNA": "tennessee-valley",
  "YUL": "quebec-laurentians",
  "HNL": "hawaii-oahu",
  "AUS": "texas-hill-country",
  "MDW": "midwest-lakes"
};

async function run() {
  const existingPoiData = JSON.parse(fs.readFileSync(EXISTING_POI_JSON, 'utf8'));
  const newPois = { ...existingPoiData };

  // Fix existing POI destinations based on 'region' if they don't have 'destination'
  for (const key in newPois) {
    const poi = newPois[key];
    if (!poi.destination) {
      if (poi.region?.toLowerCase() === 'alps') {
        poi.destination = 'alps';
      } else if (poi.region?.toLowerCase() === 'dolomites') {
        poi.destination = 'dolomites';
      } else {
        poi.destination = 'alps'; // Default fallback for old POIs
      }
    }
  }

  const csvRows = [];
  await new Promise((resolve) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => csvRows.push(row))
      .on('end', resolve);
  });

  for (const row of csvRows) {
    if (row.Slug && row['Mission Name'] && row['Hub Code']) {
      const destSlug = HUB_TO_DESTINATION[row['Hub Code']] || 'mid-atlantic';
      newPois[row.Slug] = {
        slug: row.Slug,
        name: row['Mission Name'],
        destination: destSlug,
        coords: {
          lat: parseFloat(row.Lat),
          lng: parseFloat(row.Lng)
        },
        description: row.Description || '',
        category: 'RIDE_ROUTE'
      };
    }
  }

  // Also add the stragglers from the old RIDE_DESTINATIONS list
  const stragglers = [
    { slug: "natchez-trace", name: "Natchez Trace", destination: "tennessee-valley" },
    { slug: "snake-421", name: "Snake 421", destination: "tennessee-valley" },
    { slug: "cumberland-plateau", name: "Cumberland Plateau", destination: "tennessee-valley" }
  ];
  for (const s of stragglers) {
    if (!newPois[s.slug]) {
        newPois[s.slug] = {
            slug: s.slug,
            name: s.name,
            destination: s.destination,
            category: 'RIDE_ROUTE'
        };
    }
  }

  // Write rideDestinations.js
  const destOutput = `export const RIDE_DESTINATIONS = ${JSON.stringify(MACRO_DESTINATIONS, null, 2)};\n`;
  fs.writeFileSync(DESTINATIONS_FILE, destOutput);

  // Write poiIndex.js (exporting POI_INDEX directly to avoid the JSON file if we want, or overwrite JSON. Let's overwrite JSON and export from JS).
  fs.writeFileSync(EXISTING_POI_JSON, JSON.stringify(newPois, null, 2));
  
  const poiJsOutput = `import POI_DATA from "./poiIndex.json";\nexport const POI_INDEX = POI_DATA;\n`;
  fs.writeFileSync(POI_FILE, poiJsOutput);

  console.log("Migration complete.");
}

run().catch(console.error);
