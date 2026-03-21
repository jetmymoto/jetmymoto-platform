const fs = require('fs');
const content = fs.readFileSync('frontend/rideratlas/missions-na.csv', 'utf8');
const lines = content.split('\n');
const airports = {};

lines.forEach(line => {
    if (!line || line.startsWith('Hub Code')) return;
    const parts = line.split(',');
    if (parts.length > 2) {
        const code = parts[0].trim();
        const city = parts[1].trim();
        const country = parts[2].trim() === 'USA' ? 'us' : (parts[2].trim() === 'Canada' ? 'ca' : 'mx');
        let region = "North America Hub";
        if (code === 'JFK' || code === 'EWR' || code === 'LGA') region = "Northeast Gateway";
        else if (code === 'LAX' || code === 'SFO') region = "Pacific Hub";
        else if (code === 'SEA') region = "Pacific Northwest";
        else if (code === 'YYZ') region = "Great Lakes Hub";
        
        airports[code] = {
            code,
            city,
            slug: `${city.toLowerCase().replace(/ /g, '-')}-${code.toLowerCase()}`,
            country,
            continent: 'north-america',
            region
        };
    }
});

let out = '';
for (const [code, data] of Object.entries(airports)) {
    out += `  "${code}": {\n    "code": "${data.code}",\n    "city": "${data.city}",\n    "slug": "${data.slug}",\n    "country": "${data.country}",\n    "region": "${data.region}",\n    "continent": "${data.continent}"\n  },\n`;
}
console.log(out);
