const fs = require('fs');
const csv = require('csv-parser');
const { RIDE_DESTINATIONS: existingDestinations } = require('../src/features/routes/data/rideDestinations.js');

const newRoutes = [];

fs.createReadStream('data/routes/northAmericaRoutes.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.Slug && row['Mission Name'] && row['Hub Country']) {
      newRoutes.push({
        slug: row.Slug,
        name: row['Mission Name'],
        countries: [row['Hub Country']],
      });
    }
  })
  .on('end', () => {
    const combinedDestinations = [...existingDestinations, ...newRoutes];

    const output = `module.exports.RIDE_DESTINATIONS = ${JSON.stringify(
      combinedDestinations,
      null,
      2
    )};\n`;

    fs.writeFileSync('src/features/routes/data/rideDestinations.js', output);

    console.log('✅ North America routes merged and generated');
  });
