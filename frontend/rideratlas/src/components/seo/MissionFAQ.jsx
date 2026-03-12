import React from 'react';

const MissionFAQ = ({ mission }) => {
  if (!mission) return null;

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How difficult is the ${mission.title} mission?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The ${mission.title} mission is rated as ${mission.meta?.difficulty || 'Expert'} difficulty. It covers approximately ${mission.meta?.distance_km || 'varied'} km over ${mission.meta?.days || 'multiple'} days.`
        }
      },
      {
        "@type": "Question",
        "name": "What motorcycle types are recommended?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `For this terrain in ${mission.region_id}, we recommend ${mission.recommended_bike_types || 'Adventure or Sport-Touring'} motorcycles.`
        }
      },
      {
        "@type": "Question",
        "name": "Is a GPX file included?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every Rider Atlas mission includes a verified GPX dossier with primary routes, alternate weather paths, and emergency extraction nodes."
        }
      }
    ]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(faqData)}
    </script>
  );
};

export default MissionFAQ;
