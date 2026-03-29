const FirecrawlApp = require("@mendable/firecrawl-js").default;
const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("[Enrich] FIRECRAWL_API_KEY is not set in .env");
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey });

const WAIT_FOR_MS = Number(process.env.FIRECRAWL_WAIT_FOR || 10000);
const TIMEOUT_MS = Number(process.env.FIRECRAWL_TIMEOUT || 120000);

const targets = [
  { operator_name: "Hertz Ride", url: "https://www.hertzride.com/" },
  { operator_name: "IMTBIKE", url: "https://www.imtbike.com/" }
];

const EXECUTIVE_SCHEMA = {
  type: "object",
  properties: {
    contacts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          operator_name: { type: "string" },
          executive_name: { type: "string" },
          executive_title: {
            type: "string",
            description: "Must be Founder, CEO, or Partnerships Manager. Reject all others."
          },
          contact_email: { type: "string" },
          linkedin_profile: { type: "string" }
        },
        required: [
          "operator_name",
          "executive_name",
          "executive_title",
          "contact_email",
          "linkedin_profile"
        ]
      }
    }
  },
  required: ["contacts"]
};

const TITLE_RANKINGS = [
  { pattern: /\b(founder\b|\bco-?founder\b)/i, canonical: "Founder", rank: 3 },
  { pattern: /\b(ceo|chief executive)\b/i, canonical: "CEO", rank: 2 },
  {
    pattern: /\b(partnerships manager|head of partnerships|partnerships lead|partnerships director)\b/i,
    canonical: "Partnerships Manager",
    rank: 1
  }
];

function normalizeUrl(value) {
  return (value || "")
    .trim()
    .replace(/\/+$/, "")
    .toLowerCase();
}

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
}

function classifyTitle(title) {
  const cleanTitle = (title || "").trim();

  for (const entry of TITLE_RANKINGS) {
    if (entry.pattern.test(cleanTitle)) {
      return {
        allowed: true,
        canonicalTitle: entry.canonical,
        rank: entry.rank
      };
    }
  }

  return {
    allowed: false,
    canonicalTitle: cleanTitle,
    rank: 0
  };
}

function chooseBetterRecord(existing, candidate) {
  if (!existing) {
    return candidate;
  }

  const existingTitle = classifyTitle(existing.executive_title);
  const candidateTitle = classifyTitle(candidate.executive_title);

  if (candidateTitle.rank !== existingTitle.rank) {
    return candidateTitle.rank > existingTitle.rank ? candidate : existing;
  }

  const existingSignals = Number(Boolean(normalizeEmail(existing.contact_email))) + Number(Boolean(normalizeUrl(existing.linkedin_profile)));
  const candidateSignals = Number(Boolean(normalizeEmail(candidate.contact_email))) + Number(Boolean(normalizeUrl(candidate.linkedin_profile)));

  if (candidateSignals !== existingSignals) {
    return candidateSignals > existingSignals ? candidate : existing;
  }

  return existing;
}

function purifyContacts(contacts) {
  const byIdentity = new Map();
  const standalone = [];

  for (const contact of contacts) {
    const titleInfo = classifyTitle(contact.executive_title);
    if (!titleInfo.allowed) {
      continue;
    }

    const normalized = {
      operator_name: (contact.operator_name || "").trim(),
      executive_name: (contact.executive_name || "").trim(),
      executive_title: titleInfo.canonicalTitle,
      contact_email: normalizeEmail(contact.contact_email),
      linkedin_profile: normalizeUrl(contact.linkedin_profile)
    };

    if (!normalized.executive_name) {
      continue;
    }

    const emailKey = normalized.contact_email ? `email:${normalized.contact_email}` : "";
    const linkedinKey = normalized.linkedin_profile ? `linkedin:${normalized.linkedin_profile}` : "";
    const keys = [emailKey, linkedinKey].filter(Boolean);

    if (keys.length === 0) {
      standalone.push(normalized);
      continue;
    }

    let winner = normalized;
    for (const key of keys) {
      winner = chooseBetterRecord(byIdentity.get(key), winner);
    }
    for (const key of keys) {
      byIdentity.set(key, winner);
    }
  }

  const deduped = Array.from(new Set(byIdentity.values()));
  const uniqueStandalone = [];
  const seenStandalone = new Set();

  for (const contact of standalone) {
    const standaloneKey = [
      contact.operator_name.toLowerCase(),
      contact.executive_name.toLowerCase(),
      contact.executive_title.toLowerCase()
    ].join("|");

    if (seenStandalone.has(standaloneKey)) {
      continue;
    }

    if (deduped.some(existing =>
      existing.operator_name.toLowerCase() === contact.operator_name.toLowerCase() &&
      existing.executive_name.toLowerCase() === contact.executive_name.toLowerCase() &&
      existing.executive_title.toLowerCase() === contact.executive_title.toLowerCase()
    )) {
      continue;
    }

    seenStandalone.add(standaloneKey);
    uniqueStandalone.push(contact);
  }

  return [...deduped, ...uniqueStandalone];
}

async function enrichTarget(target) {
  console.error(`[Enrich] Hunting executives for ${target.operator_name}: ${target.url}`);

  try {
    const response = await app.extract({
      urls: [target.url],
      prompt: [
        "Crawl this website to find the ultimate decision-makers.",
        "Extract ONLY individuals holding the exact title of Founder, CEO, or Partnerships Manager (or direct equivalents like Head of Partnerships or Chief Executive).",
        "DO NOT extract customer service staff, regional managers, HR, mechanics, or generic info@ emails.",
        "If a specific executive cannot be found, do not hallucinate a result.",
        "Autonomously navigate the company website and relevant linked pages such as About Us, Contact, Team, Corporate, Partners, or Leadership pages.",
        "Return only people who are clearly associated with this operator and satisfy the allowed-role filter.",
        `The operator name should be exactly \"${target.operator_name}\".`,
        "If a field cannot be verified from available sources, return an empty string for that field."
      ].join(" "),
      schema: EXECUTIVE_SCHEMA,
      allowExternalLinks: true,
      enableWebSearch: true,
      includeSubdomains: true,
      showSources: true,
      scrapeOptions: {
        waitFor: WAIT_FOR_MS,
        timeout: TIMEOUT_MS,
        onlyMainContent: false,
        formats: ["markdown", "html"]
      },
      agent: {
        model: "FIRE-1"
      }
    });

    if (!response.success) {
      throw new Error(response.error || "Unknown Firecrawl extract failure");
    }

    const contacts = Array.isArray(response.data?.contacts) ? response.data.contacts : [];
    const purifiedContacts = purifyContacts(contacts);
    console.error(`[Enrich] ${target.operator_name}: ${purifiedContacts.length} purified contact(s) found`);
    return purifiedContacts;
  } catch (error) {
    console.error(`[Enrich] ${target.operator_name} failed: ${error.message}`);
    return [];
  }
}

async function main() {
  const results = [];

  for (const target of targets) {
    const contacts = await enrichTarget(target);
    results.push(...contacts);
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(error => {
  console.error("[Enrich] Unhandled error:", error.message);
  process.exit(1);
});
