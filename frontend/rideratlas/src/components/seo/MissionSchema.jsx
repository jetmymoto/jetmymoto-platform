import React from 'react';

const MissionSchema = ({ mission }) => {
  if (!mission) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": mission.title,
    "description": mission.subtitle || mission.description_short,
    "image": [
      mission.media?.poster_landscape,
      mission.media?.poster_cinematic
    ].filter(Boolean),
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "category": "Motorcycle Tour"
    },
    "location": {
      "@type": "Place",
      "name": mission.region_id,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": mission.region_id,
        "addressCountry": "Europe"
      }
    },
    "identifier": mission.id,
    "touristType": "Motorcycle Enthusiasts",
    "duration": `P${mission.meta?.days || 5}D`
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default MissionSchema;
