import React from "react";
import { getSiteConfig } from "@/utils/siteConfig";

const MissionBreadcrumbs = ({ mission }) => {
  if (!mission) return null;

  const site = getSiteConfig();
  const region = mission.region_id || 'Global';

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Missions",
        "item": `https://${site.domain}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": region,
        "item": `https://${site.domain}/?region=${encodeURIComponent(region)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": mission.title,
        "item": typeof window !== 'undefined' ? `https://${site.domain}${window.location.pathname}` : ""
      }
    ]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(breadcrumbData)}
    </script>
  );
};

export default MissionBreadcrumbs;
