#!/usr/bin/env node

/**
 * generateEntityPages.js
 *
 * Purpose:
 * Turn graph nodes into static luxury page payloads for Destination / Route / Airport templates.
 *
 * Pipeline:
 * GRAPH NODE
 *   -> asset lookup
 *   -> token injection
 *   -> luxury audit
 *   -> output JSON manifest / prerender payloads
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "frontend", "rideratlas", "public", "data", "generated_pages");
const MANIFEST_PATH = path.join(OUT_DIR, "entity_page_manifest.json");

// -----------------------------
// Config
// -----------------------------

const ENTITY_TYPES = new Set(["destination", "route", "airport"]);
const DEFAULT_LIMITS = {
  destination: 20,
  route: 30,
  airport: 10,
};

const DEFAULT_TOKENS = {
  colors: {
    background: "#050505",
    foreground: "#FFFFFF",
    accent: "#CDA755",
  },
  fonts: {
    heading: "serif",
    body: "sans-serif",
  },
  motion: {
    reveal: "fade-up",
    durationMs: 800,
  },
  rules: {
    maxCards: 3,
    showPricingOnInspirationPages: false,
    accentUsage: "micro-only",
  },
};

// -----------------------------
// CLI args
// -----------------------------

function parseArgs(argv) {
  const args = {
    type: "all",
    limit: null,
    strictAudit: true,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--type" && argv[i + 1]) {
      args.type = argv[i + 1];
      i += 1;
    } else if (arg === "--limit" && argv[i + 1]) {
      args.limit = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--no-strict-audit") {
      args.strictAudit = false;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

// -----------------------------
// Directory helpers
// -----------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// -----------------------------
// Mocked data loaders (To be replaced with real adapters)
// -----------------------------

async function loadGraph() {
  console.log("📡 Connecting to Live GRAPH Modules...");
  const entities = [];

  try {
    // 1. Load Destinations
    const { RIDE_DESTINATIONS } = await import('../frontend/rideratlas/src/features/routes/data/rideDestinations.js');
    for (const [key, dest] of Object.entries(RIDE_DESTINATIONS || {})) {
      entities.push({
        id: dest.id || key,
        slug: dest.slug || key,
        type: "destination",
        name: dest.name,
        region: dest.region,
        country: dest.country,
        continent: dest.continent,
        summary: dest.cinematic_pitch || dest.description || "",
        ...dest
      });
    }
    
    // 2. Load Routes
    const { GENERATED_RIDE_ROUTES } = await import('../frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js');
    for (const route of (GENERATED_RIDE_ROUTES || [])) {
      entities.push({
        id: route.id || route.slug,
        slug: route.slug,
        type: "route",
        name: route.name || route.title,
        region: route.destination?.region,
        country: route.destination?.country,
        summary: route.description || route.cinematic_pitch || "",
        ...route
      });
    }

    // 3. Load Airports
    const { AIRPORT_INDEX } = await import('../frontend/rideratlas/src/features/airport/network/airportIndex.js');
    for (const [code, airport] of Object.entries(AIRPORT_INDEX || {})) {
      entities.push({
        id: code,
        slug: code.toLowerCase(),
        type: "airport",
        name: airport.name,
        region: airport.region,
        country: airport.country,
        continent: airport.continent,
        summary: airport.description || `Your gateway to ${airport.region || airport.city}.`,
        ...airport
      });
    }

    console.log(`✅ Loaded ${entities.length} live entities from GRAPH.`);
    return entities;

  } catch (error) {
    console.error("❌ Failed to load live GRAPH data:", error);
    throw error;
  }
}

async function loadAssetLibraryIndex() {
  return {};
}

async function loadDesignTokens() {
  const tokenPath = path.join(ROOT, "shared", "designTokens.js");
  if (fs.existsSync(tokenPath)) {
    // Attempt to parse or just return defaults for now
    return DEFAULT_TOKENS;
  }
  return DEFAULT_TOKENS;
}

// -----------------------------
// Graph helpers
// -----------------------------

function filterEntities(entities, type, limitOverride) {
  let filtered = entities.filter((e) => ENTITY_TYPES.has(e.type));

  if (type !== "all") {
    filtered = filtered.filter((e) => e.type === type);
  }

  if (limitOverride && Number.isFinite(limitOverride)) {
    return filtered.slice(0, limitOverride);
  }

  if (type !== "all") {
    return filtered.slice(0, DEFAULT_LIMITS[type] ?? filtered.length);
  }

  const grouped = [];
  for (const entityType of ["destination", "route", "airport"]) {
    grouped.push(
      ...filtered
        .filter((e) => e.type === entityType)
        .slice(0, DEFAULT_LIMITS[entityType] ?? filtered.length)
    );
  }

  return grouped;
}

function indexById(items) {
  const map = new Map();
  for (const item of items) map.set(item.id, item);
  return map;
}

// -----------------------------
// Curation helpers
// -----------------------------

function takeMax3(items) {
  return Array.isArray(items) ? items.slice(0, 3) : [];
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildLuxuryMetaTitle(entity) {
  if (entity.type === "destination") {
    return `${entity.name} Motorcycle Journeys | Luxury Riding Destination`;
  }
  if (entity.type === "route") {
    return `${entity.name} Motorcycle Route | Luxury Ride Guide`;
  }
  if (entity.type === "airport") {
    return `${entity.name} Airport Transfers & Motorcycle Access | Journey Gateway`;
  }
  return entity.name;
}

function buildLuxuryMetaDescription(entity) {
  if (entity.type === "destination") {
    return `Discover ${entity.name} through cinematic motorcycle travel, curated routes, and premium regional experiences.`;
  }
  if (entity.type === "route") {
    return `Explore ${entity.name}, a curated motorcycle route designed for premium travel, clear planning, and unforgettable riding.`;
  }
  if (entity.type === "airport") {
    return `Begin your motorcycle journey from ${entity.name} with curated routes, destinations, and premium machine access.`;
  }
  return `Explore ${entity.name}.`;
}

function inferTemplateName(type) {
  switch (type) {
    case "destination":
      return "RideDestinationPage";
    case "route":
      return "RideRoutePage";
    case "airport":
      return "AirportTemplate";
    default:
      return "UnknownTemplate";
  }
}

// -----------------------------
// Relationship extraction
// -----------------------------

function getLinkedEntities(entity, allEntities) {
  const byId = indexById(allEntities);

  const linkedDestinations = takeMax3(
    (entity.destinationIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean)
  );

  const linkedRoutes = takeMax3(
    (entity.routeIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean)
  );

  const linkedAirports = takeMax3(
    (entity.airportIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean)
  );

  const linkedRentals = takeMax3(entity.rentals || []);
  const linkedExperiences = takeMax3(entity.experiences || []);
  const linkedPois = takeMax3(entity.pois || []);

  return {
    destinations: linkedDestinations,
    routes: linkedRoutes,
    airports: linkedAirports,
    rentals: linkedRentals,
    experiences: linkedExperiences,
    pois: linkedPois,
  };
}

// -----------------------------
// Asset resolution
// -----------------------------

function resolveAsset(entity, assetIndex) {
  return (
    assetIndex[entity.id] ||
    assetIndex[entity.slug] || {
      hero: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop",
      thumbnail: null,
      gallery: [],
      poster: null,
      alt: entity.name,
      caption: "",
    }
  );
}

function attachAssets(items, assetIndex) {
  return (items || []).map((item) => ({
    ...item,
    asset: resolveAsset(item, assetIndex),
  }));
}

// -----------------------------
// Luxury audit
// -----------------------------

function luxuryAudit(payload) {
  const violations = [];

  const tokenAccent = payload.tokens?.colors?.accent;
  const hasHero = Boolean(payload.assets?.hero);
  const tooManyRoutes = (payload.related?.routes || []).length > 3;
  const tooManyDestinations = (payload.related?.destinations || []).length > 3;
  const tooManyRentals = (payload.related?.rentals || []).length > 3;
  const templateOk = ["RideDestinationPage", "RideRoutePage", "AirportTemplate"].includes(
    payload.template
  );

  if (!templateOk) violations.push("Invalid or missing luxury template.");
  if (!hasHero) violations.push("Missing hero asset.");
  if (!tokenAccent) violations.push("Missing accent token.");
  if (tooManyRoutes) violations.push("Routes exceed luxury max of 3.");
  if (tooManyDestinations) violations.push("Destinations exceed luxury max of 3.");
  if (tooManyRentals) violations.push("Rentals exceed luxury max of 3.");

  if (payload.entity.type === "destination" && (payload.related?.rentals?.length || 0) > 0) {
    violations.push("Destination page should not foreground rentals.");
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// -----------------------------
// Payload builders
// -----------------------------

function buildSchema(entity) {
  if (entity.type === "destination") {
    return {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: entity.name,
      description: sanitizeText(entity.summary || entity.description || ""),
      url: `/${entity.slug}`,
    };
  }

  if (entity.type === "route") {
    return {
      "@context": "https://schema.org",
      "@type": "Trip",
      name: entity.name,
      description: sanitizeText(entity.summary || entity.description || ""),
      url: `/${entity.slug}`,
    };
  }

  if (entity.type === "airport") {
    return {
      "@context": "https://schema.org",
      "@type": "Airport",
      name: entity.name,
      description: sanitizeText(entity.summary || entity.description || ""),
      url: `/${entity.slug}`,
    };
  }

  return null;
}

function buildPagePayload(entity, allEntities, assetIndex, tokens) {
  const related = getLinkedEntities(entity, allEntities);
  const assets = resolveAsset(entity, assetIndex);

  const payload = {
    entity: {
      id: entity.id,
      slug: entity.slug,
      type: entity.type,
      name: entity.name,
      region: entity.region || "",
      country: entity.country || "",
      summary: sanitizeText(entity.summary || entity.description || ""),
    },
    template: inferTemplateName(entity.type),
    tokens,
    assets,
    related: {
      destinations: attachAssets(related.destinations, assetIndex),
      routes: attachAssets(related.routes, assetIndex),
      airports: attachAssets(related.airports, assetIndex),
      rentals: takeMax3(related.rentals),
      experiences: takeMax3(related.experiences),
      pois: takeMax3(related.pois),
    },
    seo: {
      title: buildLuxuryMetaTitle(entity),
      description: buildLuxuryMetaDescription(entity),
      canonicalPath: `/${entity.slug}`,
      schema: buildSchema(entity),
    },
    generatedAt: new Date().toISOString(),
  };

  return payload;
}

// -----------------------------
// Main
// -----------------------------

async function main() {
  const args = parseArgs(process.argv);

  if (args.type !== "all" && !ENTITY_TYPES.has(args.type)) {
    throw new Error(`Invalid --type value: ${args.type}`);
  }

  console.log("⚡ Starting graph-native luxury page generation...");

  const [graph, assetIndex, tokens] = await Promise.all([
    loadGraph(),
    loadAssetLibraryIndex(),
    loadDesignTokens(),
  ]);

  if (!Array.isArray(graph) || graph.length === 0) {
    console.warn("No graph entities found. Nothing to generate.");
    return;
  }

  const selectedEntities = filterEntities(graph, args.type, args.limit);

  if (selectedEntities.length === 0) {
    console.warn("No matching entities found for the selected filters.");
    return;
  }

  ensureDir(OUT_DIR);

  const manifest = {
    generatedAt: new Date().toISOString(),
    totals: {
      requested: selectedEntities.length,
      generated: 0,
      rejected: 0,
    },
    pages: [],
    rejected: [],
  };

  for (const entity of selectedEntities) {
    const payload = buildPagePayload(entity, graph, assetIndex, tokens);
    const audit = luxuryAudit(payload);

    if (!audit.passed && args.strictAudit) {
      manifest.rejected.push({
        id: entity.id,
        slug: entity.slug,
        type: entity.type,
        reason: audit.violations,
      });
      manifest.totals.rejected += 1;

      console.warn(`✗ Rejected ${entity.type}:${entity.slug}`);
      for (const violation of audit.violations) {
        console.warn(`  - ${violation}`);
      }
      continue;
    }

    const outputPath = path.join(OUT_DIR, entity.type, `${entity.slug}.json`);

    if (!args.dryRun) {
      writeJson(outputPath, {
        ...payload,
        audit,
      });
    }

    manifest.pages.push({
      id: entity.id,
      slug: entity.slug,
      type: entity.type,
      template: payload.template,
      path: outputPath,
      auditPassed: audit.passed,
    });

    manifest.totals.generated += 1;
    console.log(`✓ Generated ${entity.type}:${entity.slug} -> ${outputPath}`);
  }

  if (!args.dryRun) {
    writeJson(MANIFEST_PATH, manifest);
  }

  console.log("");
  console.log("🚀 Generation complete");
  console.log(`Generated: ${manifest.totals.generated}`);
  console.log(`Rejected:  ${manifest.totals.rejected}`);
  console.log(`Manifest:  ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error("Generation failed:");
  console.error(error);
  process.exit(1);
});
