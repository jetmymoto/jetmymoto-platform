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

  const hostname = window.location.hostname
  const isJmmDomain = [
    "jetmymoto.com",
    "www.jetmymoto.com",
    "jetmymoto-marketing.web.app",
    "jetmymoto-marketing.firebaseapp.com"
  ].includes(hostname)

  if (import.meta.env.DEV) {
    console.log("🔎 URL SEARCH:", window.location.search)
    console.log("🔎 ctx param:", ctx)
    console.log("🔎 hostname:", hostname)
  }

  const site = (ctx === "jet" || isJmmDomain)
    ? SITE_CONFIGS.jmm
    : SITE_CONFIGS.atlas

  if (import.meta.env.DEV) {
    console.log("🚀 getSiteConfig returning:", site)
  }

  return site
}
