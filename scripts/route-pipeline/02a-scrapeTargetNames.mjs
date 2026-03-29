import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FirecrawlApp from "@mendable/firecrawl-js";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.resolve(__dirname, "../../data/target_alpine_pois.json");

async function main() {
  console.log("[Stage 2a] Scraping top Alpine passes from Wikipedia via Firecrawl...");
  
  if (!process.env.FIRECRAWL_API_KEY) {
    console.error("Missing FIRECRAWL_API_KEY in .env");
    process.exit(1);
  }

  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  
  try {
    const scrapeResult = await app.scrapeUrl('https://en.wikipedia.org/wiki/List_of_highest_paved_roads_in_Europe', {
      formats: ['extract'],
      extract: {
        schema: {
          type: "object",
          properties: {
            target_names: {
              type: "array",
              items: { type: "string" },
              description: "The names of the highest paved roads and mountain passes listed in the article."
            }
          },
          required: ["target_names"]
        }
      }
    });

    let targetNames = [];
    if (scrapeResult.success) {
      targetNames = scrapeResult.extract?.target_names || [];
    } else if (scrapeResult.data && scrapeResult.data.extract) {
      targetNames = scrapeResult.data.extract.target_names || [];
    } else {
      console.log("Scrape success flag was false or format mismatch.", scrapeResult);
    }

    if (!targetNames || targetNames.length === 0) {
      console.log("[Stage 2a] Firecrawl returned empty. Using fallback targets.");
      targetNames = [
        "Pico Veleta", "Col de l'Iseran", "Stelvio Pass", "Passo dello Stelvio", 
        "Col Agnel", "Col de la Bonette", "Col du Galibier", "Timmelsjoch", 
        "Passo Rombo", "Grossglockner", "Col d'Izoard", "Furka Pass", 
        "Susten Pass", "Grimsel Pass", "Klausen Pass", "San Bernardino Pass", 
        "Julier Pass", "Nufenen Pass", "Gotthard Pass", "Col de Turini", 
        "Mont Ventoux", "Passo Pordoi", "Passo Giau", "Passo di Fedaia", "Bernina Pass"
      ];
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify({ target_names: targetNames }, null, 2));
    console.log(`[Stage 2a] Successfully saved ${targetNames.length} targets to ${OUT_FILE}`);
  } catch (err) {
    console.error("Error scraping:", err.message);
    const targetNames = [
      "Pico Veleta", "Col de l'Iseran", "Stelvio Pass", "Passo dello Stelvio", 
      "Col Agnel", "Col de la Bonette", "Col du Galibier", "Timmelsjoch", 
      "Grossglockner", "Col d'Izoard", "Furka Pass", "Susten Pass", 
      "Grimsel Pass", "Klausen Pass", "San Bernardino Pass", "Julier Pass", 
      "Nufenen Pass", "Gotthard Pass", "Col de Turini", "Mont Ventoux"
    ];
    fs.writeFileSync(OUT_FILE, JSON.stringify({ target_names: targetNames }, null, 2));
    console.log(`[Stage 2a] Used fallback list of ${targetNames.length} targets due to error.`);
  }
}

main();
