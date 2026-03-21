// src/utils/siteConfig.js

const SITE_CONFIGS = {
  jmm: {
    id: 'jmm',
    name: 'JetMyMoto',
  },
  atlas: {
    id: 'atlas',
    name: 'Rider Atlas',
  }
};

export function getSiteConfig() {
  const params = new URLSearchParams(window.location.search)
  const ctx = params.get("ctx")

  if (import.meta.env.DEV) {
    console.log("🔎 URL SEARCH:", window.location.search)
    console.log("🔎 ctx param:", ctx)
  }

  const site = ctx === "jet"
    ? { id: "jmm", name: "JetMyMoto" }
    : { id: "atlas", name: "RiderAtlas" }

  if (import.meta.env.DEV) {
    console.log("🚀 getSiteConfig returning:", site)
  }

  return site
}
