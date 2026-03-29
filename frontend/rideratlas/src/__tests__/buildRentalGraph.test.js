import { describe, it, expect } from "vitest";
import { buildRentalGraph } from "@/core/network/buildRentalGraph";

const graph = buildRentalGraph();

describe("buildRentalGraph — index contract", () => {
  // ── Structural existence ──

  it("returns all required top-level keys", () => {
    const requiredKeys = [
      "operators",
      "rentals",
      "rentalsByAirport",
      "rentalsByOperator",
      "rentalsByType",
      "rentalsByDestination",
      "rentalsByDropoff",
      "rentalsByOperatorByAirport",
      "operatorsByAirport",
      "cheapestByAirport",
      "suitabilityScores",
    ];
    for (const key of requiredKeys) {
      expect(graph).toHaveProperty(key);
      expect(graph[key]).toBeDefined();
      expect(graph[key]).not.toBeNull();
    }
  });

  it("rentals map is non-empty", () => {
    expect(Object.keys(graph.rentals).length).toBeGreaterThan(0);
  });

  it("operators expose normalized legal fallback fields", () => {
    for (const operator of Object.values(graph.operators)) {
      expect(typeof operator.security_deposit_amount).toBe("string");
      expect(operator.security_deposit_amount.length).toBeGreaterThan(0);
      expect(typeof operator.security_deposit_policy).toBe("string");
      expect(operator.security_deposit_policy.length).toBeGreaterThan(0);
      expect(typeof operator.cancellation_policy).toBe("string");
      expect(operator.cancellation_policy.length).toBeGreaterThan(0);
    }
  });

  // ── operatorsByAirport ↔ rentalsByOperatorByAirport cross-reference ──

  it("every airport in operatorsByAirport exists in rentalsByOperatorByAirport", () => {
    for (const airportCode of Object.keys(graph.operatorsByAirport)) {
      expect(graph.rentalsByOperatorByAirport).toHaveProperty(airportCode);
    }
  });

  it("every operator in operatorsByAirport[airport] has a key in rentalsByOperatorByAirport[airport]", () => {
    for (const [airportCode, operatorIds] of Object.entries(graph.operatorsByAirport)) {
      for (const opId of operatorIds) {
        expect(graph.rentalsByOperatorByAirport[airportCode]).toHaveProperty(opId);
        expect(Array.isArray(graph.rentalsByOperatorByAirport[airportCode][opId])).toBe(true);
      }
    }
  });

  // ── Rental ID resolution ──

  it("all rental IDs in compound index exist in canonical rentals map", () => {
    for (const [airportCode, operatorMap] of Object.entries(graph.rentalsByOperatorByAirport)) {
      for (const [opId, rentalIds] of Object.entries(operatorMap)) {
        for (const rentalId of rentalIds) {
          expect(graph.rentals).toHaveProperty(rentalId);
        }
      }
    }
  });

  // ── No duplicate rental IDs in any leaf array ──

  it("no duplicate rental IDs inside any [airport][operator] leaf array", () => {
    for (const [airportCode, operatorMap] of Object.entries(graph.rentalsByOperatorByAirport)) {
      for (const [opId, rentalIds] of Object.entries(operatorMap)) {
        const unique = new Set(rentalIds);
        expect(unique.size).toBe(rentalIds.length);
      }
    }
  });

  it("no duplicate rental IDs inside any rentalsByAirport leaf array", () => {
    for (const [airportCode, rentalIds] of Object.entries(graph.rentalsByAirport)) {
      const unique = new Set(rentalIds);
      expect(unique.size).toBe(rentalIds.length);
    }
  });

  // ── cheapestByAirport contract ──

  it("cheapestByAirport[airport].rentalId belongs to that airport", () => {
    for (const [airportCode, cheapest] of Object.entries(graph.cheapestByAirport)) {
      expect(cheapest).toHaveProperty("rentalId");
      expect(cheapest).toHaveProperty("pricePerDay");
      expect(cheapest).toHaveProperty("currency");
      expect(cheapest).toHaveProperty("bikeName");
      expect(typeof cheapest.pricePerDay).toBe("number");

      // Must appear in at least one operator leaf for this airport
      const airportOps = graph.rentalsByOperatorByAirport[airportCode] || {};
      const allIdsInAirport = Object.values(airportOps).flat();
      expect(allIdsInAirport).toContain(cheapest.rentalId);
    }
  });

  it("cheapestByAirport has no deposit field in public output", () => {
    for (const cheapest of Object.values(graph.cheapestByAirport)) {
      expect(cheapest).not.toHaveProperty("deposit");
    }
  });

  // ── Deterministic cheapest tie-break ──

  it("cheapest tie-break stays deterministic across repeated builds", () => {
    const graph2 = buildRentalGraph();
    for (const airportCode of Object.keys(graph.cheapestByAirport)) {
      expect(graph2.cheapestByAirport[airportCode].rentalId).toBe(
        graph.cheapestByAirport[airportCode].rentalId,
      );
    }
  });

  // ── suitabilityScores contract ──

  it("suitabilityScores[rentalId] contains all 3 required keys", () => {
    for (const [rentalId, scores] of Object.entries(graph.suitabilityScores)) {
      expect(scores).toHaveProperty("alpineScore");
      expect(scores).toHaveProperty("coastalScore");
      expect(scores).toHaveProperty("urbanScore");
      expect(typeof scores.alpineScore).toBe("number");
      expect(typeof scores.coastalScore).toBe("number");
      expect(typeof scores.urbanScore).toBe("number");
    }
  });

  it("all suitability scores are clamped 0..10", () => {
    for (const scores of Object.values(graph.suitabilityScores)) {
      expect(scores.alpineScore).toBeGreaterThanOrEqual(0);
      expect(scores.alpineScore).toBeLessThanOrEqual(10);
      expect(scores.coastalScore).toBeGreaterThanOrEqual(0);
      expect(scores.coastalScore).toBeLessThanOrEqual(10);
      expect(scores.urbanScore).toBeGreaterThanOrEqual(0);
      expect(scores.urbanScore).toBeLessThanOrEqual(10);
    }
  });

  it("every rental in rentals map has a suitabilityScores entry", () => {
    for (const rentalId of Object.keys(graph.rentals)) {
      expect(graph.suitabilityScores).toHaveProperty(rentalId);
    }
  });

  // ── Hub-specific verification ──

  describe("hub verification — MUC", () => {
    it("MUC has operators indexed", () => {
      expect(graph.operatorsByAirport.MUC).toBeDefined();
      expect(graph.operatorsByAirport.MUC.length).toBeGreaterThan(0);
    });

    it("MUC has cheapest entry", () => {
      expect(graph.cheapestByAirport.MUC).toBeDefined();
      expect(graph.cheapestByAirport.MUC.currency).toBe("EUR");
    });
  });

  describe("hub verification — MXP", () => {
    it("MXP has operators indexed", () => {
      expect(graph.operatorsByAirport.MXP).toBeDefined();
      expect(graph.operatorsByAirport.MXP.length).toBeGreaterThan(0);
    });

    it("MXP has cheapest entry", () => {
      expect(graph.cheapestByAirport.MXP).toBeDefined();
    });
  });

  describe("hub verification — LAX", () => {
    it("LAX has operators indexed", () => {
      expect(graph.operatorsByAirport.LAX).toBeDefined();
      expect(graph.operatorsByAirport.LAX.length).toBeGreaterThan(0);
    });

    it("LAX has cheapest entry", () => {
      expect(graph.cheapestByAirport.LAX).toBeDefined();
    });
  });

  // ── No undefined/null leaf arrays ──

  it("operatorsByAirport has no undefined or null leaf arrays", () => {
    for (const [key, val] of Object.entries(graph.operatorsByAirport)) {
      expect(Array.isArray(val)).toBe(true);
    }
  });

  it("rentalsByOperatorByAirport has no undefined or null leaf arrays", () => {
    for (const [apt, opMap] of Object.entries(graph.rentalsByOperatorByAirport)) {
      expect(typeof opMap).toBe("object");
      for (const [op, ids] of Object.entries(opMap)) {
        expect(Array.isArray(ids)).toBe(true);
      }
    }
  });
});
