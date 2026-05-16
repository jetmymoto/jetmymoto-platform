import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/airport/AirportTemplate.jsx', 'utf8');
content = content.replace(/<\/AnimatePresence>(\s*)<\/div>/g, '</AnimatePresence>');
content = content.replace(/<\/AnimatePresence>(\s*)<\/div>\s*<\/div>\s*\);\s*}\s*$/g, '</AnimatePresence>\n      </div>\n    </div>\n  );\n}');
fs.writeFileSync('frontend/rideratlas/src/features/airport/AirportTemplate.jsx', content);
