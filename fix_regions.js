const fs = require('fs');
const file = 'frontend/rideratlas/src/features/routes/destinationRegions.js';
let content = fs.readFileSync(file, 'utf8');

// The file exports DESTINATION_REGIONS. Let's execute it to get the object.
const match = content.match(/export const DESTINATION_REGIONS = (\{[\s\S]*?\});/);
if (match) {
    let obj;
    eval('obj = ' + match[1]);
    
    // Combine usa and canada into north-america
    const na = [...(obj.usa || []), ...(obj.canada || [])];
    // Add the specific ones mentioned by user just in case
    if (!na.includes('natchez-trace')) na.push('natchez-trace');
    if (!na.includes('snake-421')) na.push('snake-421');
    if (!na.includes('cumberland-plateau')) na.push('cumberland-plateau');
    
    // remove usa and canada
    delete obj.usa;
    delete obj.canada;
    obj['north-america'] = na;
    
    // Write back
    const newContent = content.replace(match[0], 'export const DESTINATION_REGIONS = ' + JSON.stringify(obj, null, 2) + ';');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed regions');
} else {
    console.log('Could not parse');
}
