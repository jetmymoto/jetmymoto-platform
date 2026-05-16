import { describe, it, expect } from "vitest";

import {
  getRentalPosterUrl,
  getRentalBrand,
  getRentalModelName,
} from "./rentalFormatters.js";
import {
  RENTAL_HERO_IMAGE_MAP,
  buildRentalHeroImageId,
} from "../data/rentalHeroImageMap.js";

const CATEGORY_FALLBACK_URL = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80";

describe("rental poster resolution", () => {
  it("resolves known model to generated Vertex hero image", () => {
    const rental = {
      brand: "BMW",
      model: "R 1300 GS",
      category: "adventure",
    };

    const url = getRentalPosterUrl(rental);
    expect(url).toContain("/o/ai%2Frental-heroes%2Fbmw-r-1300-gs.png?alt=media");
  });

  it("normalizes aliases and spacing before hero map lookup", () => {
    const rental = {
      brand: "HOND",
      model: "  Transalp   750  ",
      category: "adventure",
    };

    const heroId = buildRentalHeroImageId(rental.brand, rental.model);
    expect(heroId).toBe("honda-transalp-750");

    const expectedUrl = RENTAL_HERO_IMAGE_MAP[heroId];
    expect(expectedUrl).toBeTruthy();
    expect(getRentalPosterUrl(rental)).toBe(expectedUrl);
  });

  it("prefers imageGraph when a scored storageUrl match is available", () => {
    const rental = {
      brand: "BMW",
      model: "R 1300 GS",
      category: "adventure",
    };

    const imageGraph = {
      images: {
        a: {
          storageUrl: "https://cdn.example.com/graph-best.jpg",
          brand: "BMW",
          model: "R 1300 GS",
          category: "adventure",
          usableFor: ["rental"],
          type: "studio",
          composition: "side_profile",
          lighting: "studio_soft",
          emotion: "power",
          score: 0.5,
          brandRecognizable: true,
        },
      },
    };

    const url = getRentalPosterUrl(rental, imageGraph);
    expect(url).toBe("https://cdn.example.com/graph-best.jpg");
  });

  it("falls back to rental.imageUrl when hero map has no match", () => {
    const rental = {
      brand: "Acme",
      model: "Prototype 9000",
      category: "adventure",
      imageUrl: "https://example.com/source.jpg",
    };

    const url = getRentalPosterUrl(rental);
    expect(url).toBe("https://example.com/source.jpg");
  });

  it("falls back to deterministic 15rentalimagesx1 URL when no explicit images exist", () => {
    const rental = {
      brand: "Unknown Brand",
      model: "R 1300 GS",
      category: "adventure",
    };

    const url = getRentalPosterUrl(rental);
    expect(url).toBe(
      "https://firebasestorage.googleapis.com/v0/b/movie-chat-factory.firebasestorage.app/o/15rentalimagesx1%2Funknown-brand-r1300gs.jpg?alt=media"
    );
  });

  it("returns category fallback when deterministic URL cannot be built", () => {
    const rental = {
      category: "adventure",
    };

    const brand = getRentalBrand(rental);
    const model = getRentalModelName(rental);
    expect(brand).toBe("Unknown");
    expect(model).toBe("Mission Spec");

    const url = getRentalPosterUrl(rental);
    expect(url).toBe(CATEGORY_FALLBACK_URL);
  });

  it("resolves all production rentals to non-empty URLs", async () => {
    const { RENTALS } = await import("../data/rentals.js");
    const rentals = Object.values(RENTALS);

    for (const rental of rentals) {
      const url = getRentalPosterUrl(rental);
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(10);
    }
  });
});
