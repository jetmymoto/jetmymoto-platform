
import React from 'react';

const JsonLd = ({ schema }) => {
  if (!schema) return null;

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default JsonLd;
