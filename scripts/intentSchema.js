// Intent signal schema — Firecrawl extraction schema for competitor keyword analysis.
// Extracts what keywords/phrases competitors are targeting per airport.

const INTENT_SCHEMA = {
  type: "object",
  properties: {
    intents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "The search-optimized keyword or phrase targeted on this page (e.g., 'BMW R1250GS rental Milan Malpensa', 'cheap adventure motorcycle hire Milan')"
          },
          airport_code: {
            type: "string",
            description: "The 3-letter IATA airport code this keyword targets"
          },
          operator_id: {
            type: "string",
            description: "The competitor operator ID from the target"
          },
          source_url: {
            type: "string",
            description: "The URL where this keyword intent was found"
          },
          page_title: {
            type: "string",
            description: "The <title> tag or H1 of the source page"
          },
          meta_description: {
            type: "string",
            description: "The meta description of the source page"
          },
          brands_mentioned: {
            type: "array",
            items: { type: "string" },
            description: "Motorcycle brands mentioned on the page (e.g., BMW, Ducati, Honda)"
          },
          models_mentioned: {
            type: "array",
            items: { type: "string" },
            description: "Specific motorcycle models mentioned (e.g., R1250GS, Multistrada V4)"
          },
          categories_mentioned: {
            type: "array",
            items: { type: "string" },
            description: "Rental categories mentioned: adventure, touring, sport-touring, cruiser, classic, scrambler"
          },
          price_signals: {
            type: "array",
            items: { type: "string" },
            description: "Any pricing phrases found (e.g., 'from €95/day', 'starting at 120 EUR')"
          }
        },
        required: ["keyword", "airport_code", "operator_id"]
      }
    }
  },
  required: ["intents"]
};

module.exports = { INTENT_SCHEMA };
