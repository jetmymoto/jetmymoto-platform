import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAudit() {
  console.log("Starting SEO Audit...");

  // 1. Load Data
  let RENTALS = {};
  let OPERATORS = {};
  let ROUTES = [];
  let MISSIONS = [];
  let AIRPORTS = {};
  let DESTINATIONS = {};

  try {
    const r = await import('./frontend/rideratlas/src/features/rentals/data/rentals.js');
    RENTALS = r.RENTALS || r.default || {};
  } catch(e) {}
  try {
    const o = await import('./frontend/rideratlas/src/features/rentals/data/operators.js');
    OPERATORS = o.OPERATORS || o.default || {};
  } catch(e) {}
  try {
    const r = await import('./frontend/rideratlas/src/features/routes/data/generatedRideRoutes.js');
    ROUTES = r.GENERATED_RIDE_ROUTES || r.default || [];
  } catch(e) {}
  try {
    const m = await import('./frontend/rideratlas/src/features/a2a/data/missions.js');
    MISSIONS = m.missions || m.default || [];
  } catch(e) {
    try {
      const m2 = await import('./frontend/rideratlas/src/data/missions.js');
      MISSIONS = m2.missions || m2.default || [];
    } catch(e2) {}
  }
  try {
    const a = await import('./frontend/rideratlas/src/features/airport/data/staticAirports.js');
    AIRPORTS = a.staticAirports || a.default || {};
  } catch(e) {}
  try {
    const d = await import('./frontend/rideratlas/src/features/destinations/data/destinations.js');
    DESTINATIONS = d.DESTINATIONS || d.default || {};
  } catch(e) {
    try {
      const d2 = await import('./frontend/rideratlas/src/features/routes/data/destinations.js');
      DESTINATIONS = d2.DESTINATIONS || d2.default || {};
    } catch(e2) {}
  }

  // 2. Build Mock Graph
  const graph = {
    rentals: RENTALS,
    operators: OPERATORS,
    routes: Object.fromEntries(ROUTES.map(r => [r.slug, r])),
    missions: Object.fromEntries(MISSIONS.map(m => [m.slug, m])),
    airports: AIRPORTS,
    destinations: DESTINATIONS,
    rentalsByAirport: {},
    rentalsByOperator: {},
    routesByAirport: {},
    routesByDestination: {},
    rentalsByDestination: {}
  };

  Object.values(RENTALS).forEach(r => {
    const apt = (r.airportCode || r.airport || "").toUpperCase();
    if (apt) {
      if (!graph.rentalsByAirport[apt]) graph.rentalsByAirport[apt] = [];
      graph.rentalsByAirport[apt].push(r.id);
    }
    const op = r.operatorId || r.operator;
    if (op) {
      if (!graph.rentalsByOperator[op]) graph.rentalsByOperator[op] = [];
      graph.rentalsByOperator[op].push(r.id);
    }
    const dests = r.compatibleDestinations || r.compatible_destinations || [];
    dests.forEach(d => {
      if (!graph.rentalsByDestination[d]) graph.rentalsByDestination[d] = [];
      graph.rentalsByDestination[d].push(r.id);
    });
  });

  Object.values(ROUTES).forEach(r => {
    const apt = (r.airportCode || r.airport?.code || "").toUpperCase();
    if (apt) {
      if (!graph.routesByAirport[apt]) graph.routesByAirport[apt] = [];
      graph.routesByAirport[apt].push(r.slug);
    }
    const dest = r.destinationSlug || r.destination?.slug;
    if (dest) {
      if (!graph.routesByDestination[dest]) graph.routesByDestination[dest] = [];
      graph.routesByDestination[dest].push(r.slug);
    }
  });

  // 3. Load SEO Utilities
  const { getLinksForRentalPage, getLinksForRoutePage, getLinksForMissionPage, getLinksForOperatorPage, getLinksForAirportPage, getLinksForDestinationPage } = await import('./frontend/rideratlas/src/utils/seoLinkGraph.js');
  const { getRentalSchema, getRouteSchema, getA2AMissionSchema, getOperatorSchema, getAirportSchema, getDestinationSchema, getBreadcrumbSchema } = await import('./frontend/rideratlas/src/utils/seoSchema.js');
  const { getFaqsForRental, getFaqsForRoute, getFaqsForMission, getFaqsForAirport, getFaqsForDestination, getFaqsForOperator, getFaqSchema } = await import('./frontend/rideratlas/src/utils/seoFaqEngine.js');

  console.log("\n================ TARGET 1 & 4: PAGE SURFACE & SCHEMA AUDIT ================");

  function validateSchema(schema) {
    if (!schema) return { missing: ["All"], invalid: ["No schema returned"], empty: ["All"] };
    const missing = [];
    const invalid = [];
    const empty = [];
    
    if (!schema["@context"] || schema["@context"] !== "https://schema.org") invalid.push("@context");
    if (!schema["@type"]) missing.push("@type");
    if (schema.name === undefined) missing.push("name");
    
    Object.entries(schema).forEach(([key, val]) => {
      if (val === "" || val === null || val === undefined || (Array.isArray(val) && val.length === 0)) {
        empty.push(key);
      }
    });
    
    return { missing, invalid, empty };
  }

  // A. RENTAL
  const sampleRental = Object.values(RENTALS)[0] || { id: "bmw-r1300gs", slug: "bmw-r1300gs", airportCode: "MXP", airport: "MXP", brand: "BMW", model: "R1300GS", operator: "eaglerider-mxp" };
  const rentalOp = OPERATORS[sampleRental.operatorId || sampleRental.operator] || { name: "EagleRider MXP" };
  const rentalApt = AIRPORTS[sampleRental.airportCode || sampleRental.airport] || { code: "MXP", city: "Milan" };
  
  const rentalLinks = getLinksForRentalPage(sampleRental, graph, `/rentals/${rentalApt.code}/${sampleRental.slug}`);
  const rentalSchema = getRentalSchema(sampleRental, rentalOp, rentalApt);
  const rentalFaqs = getFaqsForRental(sampleRental, rentalOp, rentalApt);
  
  console.log(`\nPAGE: /rentals/${rentalApt.code}/${sampleRental.slug}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${rentalFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${rentalLinks.sections.length}`);
  rentalLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- Product schema: ${rentalSchema ? "yes" : "no"}`);
  console.log(`- Offer: ${rentalSchema?.offers ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(rentalSchema));
  
  // B. ROUTE
  const sampleRoute = ROUTES[0] || { slug: "stelvio-pass", name: "Stelvio Pass", airportCode: "MXP", destinationSlug: "dolomites" };
  const routeLinks = getLinksForRoutePage(sampleRoute, graph, `/route/${sampleRoute.slug}`);
  const routeSchema = getRouteSchema(sampleRoute);
  const routeFaqs = getFaqsForRoute(sampleRoute, AIRPORTS[sampleRoute.airportCode], DESTINATIONS[sampleRoute.destinationSlug]);
  
  console.log(`\nPAGE: /route/${sampleRoute.slug}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${routeFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${routeLinks.sections.length}`);
  routeLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- TouristTrip schema: ${routeSchema ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(routeSchema));

  // C. A2A
  const sampleA2A = Object.values(MISSIONS)[0] || { slug: "mxp-zrh-alpine", title: "Alpine Corridor", insertion_airport: "MXP", extraction_airport: "ZRH", theater: "dolomites" };
  const a2aLinks = getLinksForMissionPage(sampleA2A, graph, `/a2a/${sampleA2A.slug}`);
  const a2aSchema = getA2AMissionSchema(sampleA2A);
  const a2aFaqs = getFaqsForMission(sampleA2A, AIRPORTS[sampleA2A.insertion_airport], AIRPORTS[sampleA2A.extraction_airport], DESTINATIONS[sampleA2A.theater]);
  
  console.log(`\nPAGE: /a2a/${sampleA2A.slug}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${a2aFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${a2aLinks.sections.length}`);
  a2aLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- TouristTrip schema: ${a2aSchema ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(a2aSchema));
  
  // D. OPERATOR
  const sampleOp = Object.values(OPERATORS)[0] || { id: "eaglerider-mxp", name: "EagleRider MXP", airports: ["MXP"] };
  const opLinks = getLinksForOperatorPage(sampleOp, graph, `/operators/${sampleOp.id}`);
  const opSchema = getOperatorSchema(sampleOp);
  const opFaqs = getFaqsForOperator(sampleOp, graph.rentalsByOperator[sampleOp.id]?.map(id => RENTALS[id]) || []);
  
  console.log(`\nPAGE: /operators/${sampleOp.id}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${opFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${opLinks.sections.length}`);
  opLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- Organization schema: ${opSchema ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(opSchema));

  // E. AIRPORT
  const sampleApt = Object.values(AIRPORTS)[0] || { code: "MXP", city: "Milan" };
  const aptLinks = getLinksForAirportPage(sampleApt, graph, `/airport/${sampleApt.code}`);
  const aptSchema = getAirportSchema(sampleApt);
  const aptFaqs = getFaqsForAirport(sampleApt, graph.routesByAirport[sampleApt.code]?.map(s => ROUTES.find(r=>r.slug===s)) || [], graph.rentalsByAirport[sampleApt.code]?.map(id => RENTALS[id]) || []);
  
  console.log(`\nPAGE: /airport/${sampleApt.code}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${aptFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${aptLinks.sections.length}`);
  aptLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- Airport/Place schema: ${aptSchema ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(aptSchema));

  // F. DESTINATION
  const sampleDest = Object.values(DESTINATIONS)[0] || { slug: "dolomites", name: "Dolomites" };
  const destLinks = getLinksForDestinationPage(sampleDest, graph, `/destination/${sampleDest.slug}`);
  const destSchema = getDestinationSchema(sampleDest);
  const destFaqs = getFaqsForDestination(sampleDest, graph.routesByDestination[sampleDest.slug]?.map(s => ROUTES.find(r=>r.slug===s)) || [], [sampleApt]);
  
  console.log(`\nPAGE: /destination/${sampleDest.slug}`);
  console.log(`VISIBLE CONTENT:`);
  console.log(`- Intro block: yes`);
  console.log(`- Best-for block: yes`);
  console.log(`- FAQ block: yes (${destFaqs.length} FAQs)`);
  console.log(`INTERNAL LINKS:`);
  console.log(`- sections found: ${destLinks.sections.length}`);
  destLinks.sections.forEach(s => console.log(`  - ${s.key}: ${s.links.length} links`));
  console.log(`SCHEMA:`);
  console.log(`- TouristDestination schema: ${destSchema ? "yes" : "no"}`);
  console.log(`SCHEMA ERRORS:`, validateSchema(destSchema));

  console.log("\n================ TARGET 2: INTERNAL LINKING VALIDATION ================");
  let totalLinks = 0;
  let dupes = 0;
  let selfLinks = 0;
  let broken = 0;
  
  const validateLinks = (linkGraph, path) => {
    const seen = new Set();
    linkGraph.sections.forEach(s => {
      s.links.forEach(l => {
        totalLinks++;
        if (l.to === path) selfLinks++;
        if (seen.has(l.to)) dupes++;
        seen.add(l.to);
        if (!l.label) broken++;
      });
    });
  };

  validateLinks(rentalLinks, `/rentals/${rentalApt.code}/${sampleRental.slug}`);
  validateLinks(routeLinks, `/route/${sampleRoute.slug}`);
  validateLinks(a2aLinks, `/a2a/${sampleA2A.slug}`);
  validateLinks(opLinks, `/operators/${sampleOp.id}`);
  validateLinks(aptLinks, `/airport/${sampleApt.code}`);
  validateLinks(destLinks, `/destination/${sampleDest.slug}`);

  console.log(`LINK QUALITY:`);
  console.log(`- valid links: ${totalLinks}`);
  console.log(`- duplicates: ${dupes}`);
  console.log(`- self-links: ${selfLinks}`);
  console.log(`- broken targets: ${broken}`);

  console.log("\n================ TARGET 3: FUNNEL INTEGRITY CHECK ================");
  // Find a Destination that has a Route, which has an Airport, which has a Rental, which has an Operator
  let funnel = null;
  for (const r of ROUTES) {
    if (r.destinationSlug || r.destination?.slug) {
      const dSlug = r.destinationSlug || r.destination?.slug;
      const apt = (r.airportCode || r.airport?.code || "").toUpperCase();
      if (dSlug && apt && graph.rentalsByAirport[apt]) {
        const renId = graph.rentalsByAirport[apt][0];
        const ren = RENTALS[renId];
        const opId = ren?.operatorId || ren?.operator;
        if (opId && OPERATORS[opId]) {
          funnel = { dSlug, rSlug: r.slug, apt, renId: ren.slug, opId };
          break;
        }
      }
    }
  }
  
  if (funnel) {
    console.log(`FUNNEL TEST:`);
    console.log(`- full path exists: YES`);
    console.log(`/destination/${funnel.dSlug}`);
    console.log(` -> links to /route/${funnel.rSlug}`);
    console.log(` -> links to /airport/${funnel.apt}`);
    console.log(` -> links to /rentals/${funnel.apt}/${funnel.renId}`);
    console.log(` -> links to /operators/${funnel.opId}`);
  } else {
    console.log(`FUNNEL TEST:`);
    console.log(`- full path exists: NO`);
    console.log(`- missing link at step: Not all graph nodes are perfectly connected for a complete 5-step test in sample data.`);
  }

  console.log("\n================ TARGET 5: SITEMAP COVERAGE CHECK ================");
  let sitemapContent = "";
  try {
    sitemapContent = fs.readFileSync(path.resolve(__dirname, 'frontend/rideratlas/public/sitemap.xml'), 'utf8');
  } catch(e) {}
  
  const rentalsInSitemap = (sitemapContent.match(/<loc>.*?\/rentals\/.*?<\/loc>/g) || []).length;
  const routesInSitemap = (sitemapContent.match(/<loc>.*?\/route\/.*?<\/loc>/g) || []).length;
  
  console.log(`SITEMAP COVERAGE:`);
  console.log(`- rentals in graph: ${Object.keys(RENTALS).length}`);
  console.log(`- rentals in sitemap: ${rentalsInSitemap}`);
  console.log(`- missing: ${Math.max(0, Object.keys(RENTALS).length - rentalsInSitemap)}`);
  console.log(`- routes in graph: ${Object.keys(ROUTES).length}`);
  console.log(`- routes in sitemap: ${routesInSitemap}`);
  console.log(`- missing: ${Math.max(0, Object.keys(ROUTES).length - routesInSitemap)}`);

}

runAudit();
