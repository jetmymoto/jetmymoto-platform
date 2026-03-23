import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Reusable SEO Helmet component for managing meta tags.
 * @param {object} props - Component props.
 * @param {string} props.title - The page title.
 * @param {string} props.description - The page meta description.
 * @param {string} props.canonicalUrl - The canonical URL for the page.
 * @param {boolean} [props.noIndex=false] - Whether to add noindex, nofollow tags.
 */
function SeoHelmet({ title, description, canonicalUrl, noIndex = false }) {
  const robotsContent = noIndex ? 'noindex,nofollow' : 'index,follow';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="robots" content={robotsContent} />
    </Helmet>
  );
}

export default SeoHelmet;
