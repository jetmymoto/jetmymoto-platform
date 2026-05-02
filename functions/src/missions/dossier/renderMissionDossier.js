const fs = require('fs');
const path = require('path');
const { generateDossierPdf } = require('../../lib/generateDossierPdf');
const { uploadMissionDossier } = require('./uploadMissionDossier');

const MISSION_ID = 'RA033';
const OUTPUT_DIR = '/tmp/jetmymoto/mission-dossiers';

// Check for --upload flag
const SHOULD_UPLOAD = process.argv.includes('--upload');

async function render() {
    console.log(`[Dossier] Starting local render for ${MISSION_ID}...`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Load Fixture
    const fixturePath = path.join(__dirname, 'fixtures', `${MISSION_ID}.json`);
    if (!fs.existsSync(fixturePath)) {
        throw new Error(`Fixture not found: ${fixturePath}`);
    }
    const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

    // Load Template
    const templatePath = path.join(__dirname, 'mission-dossier-template.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
    }
    let html = fs.readFileSync(templatePath, 'utf8');

    // Simple Template Engine (Variable Replacement)
    // Supports {{variable}} and {{#each list}}...{{/each}}
    
    // Handle {{#each ...}}
    const eachRegex = /\{\{#each\s+([^\}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(eachRegex, (match, key, content) => {
        const list = data[key];
        if (!Array.isArray(list)) return '';
        return list.map(item => {
            if (typeof item === 'string') {
                return content.replace(/\{\{this\}\}/g, item);
            }
            // Add object property support if needed
            return content;
        }).join('');
    });

    // Handle {{variable}} (including nested paths like operator_info.name)
    const varRegex = /\{\{([^\}]+)\}\}/g;
    html = html.replace(varRegex, (match, key) => {
        const parts = key.trim().split('.');
        let value = data;
        for (const part of parts) {
            value = value ? value[part] : undefined;
        }
        return value !== undefined ? value : match;
    });

    // Save HTML
    const htmlPath = path.join(OUTPUT_DIR, `${MISSION_ID}.html`);
    fs.writeFileSync(htmlPath, html);
    const htmlSize = fs.statSync(htmlPath).size;
    console.log(`[Dossier] HTML generated: ${htmlPath} (${htmlSize} bytes)`);

    // Generate PDF
    console.log(`[Dossier] Generating PDF (Isolated Pipeline)...`);
    const pdfBuffer = await generateDossierPdf(html);

    let pdfPath;
    if (pdfBuffer) {
        pdfPath = path.join(OUTPUT_DIR, `${MISSION_ID}.pdf`);
        fs.writeFileSync(pdfPath, pdfBuffer);
        const pdfSize = fs.statSync(pdfPath).size;
        console.log(`[Dossier] PDF generated: ${pdfPath} (${pdfSize} bytes)`);
    } else {
        console.error(`[Dossier] PDF generation failed (buffer empty or exceeded cap)`);
        process.exit(1);
    }

    // Storage Upload (Wave 3)
    if (SHOULD_UPLOAD) {
        console.log(`[Dossier] Uploading artifacts to Firebase Storage...`);
        try {
            const { pdfUrl, pdfTarget, expiryDate } = await uploadMissionDossier(MISSION_ID, pdfPath, htmlPath);
            console.log(`[Dossier] Upload Success!`);
            console.log(`[Dossier] Internal GCS Path: gs://factory1/${pdfTarget}`);
            console.log(`[Dossier] Browser URL: ${pdfUrl}`);
            console.log(`[Dossier] URL Expiry: ${expiryDate.toISOString()}`);
        } catch (uploadErr) {
            console.error(`[Dossier] Upload Failed:`, uploadErr.message);
            // Don't exit(1) if local render was successful, but log the error
        }
    }

    console.log(`[Dossier] Pipeline complete for ${MISSION_ID}.`);
}

render().catch(err => {
    console.error(`[Dossier] FATAL ERROR:`, err);
    process.exit(1);
});
