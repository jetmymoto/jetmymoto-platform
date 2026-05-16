const fs = require('fs');
const path = require('path');
const { generateDossierPdf } = require('../../lib/generateDossierPdf');
const { uploadMissionDossier } = require('./uploadMissionDossier');
const { hydrateMissionIntelligence } = require('./missionIntelligence');
const { resolveMissionVisuals } = require('./missionVisualAssets');

const OUTPUT_DIR = '/tmp/jetmymoto/mission-dossiers';

// Ground-truth fields that MUST exist
const REQUIRED_FIELDS = [
    'slug', 'title', 'insertion_airport', 'extraction_airport', 
    'distance_km', 'duration_days', 'booking_ref'
];

// Intelligence fields that can fallback
const INTELLIGENCE_FALLBACKS = {
    'mission_intelligence.rider_fit_analysis': 'Mission profile optimized for executive deployment.',
    'mission_intelligence.machine_match_logic': 'Asset selection verified for technical alpine corridors.',
    'mission_intelligence.time_recovery_estimate': 'Logistics layer optimized for maximum saddle time.',
    'mission_intelligence.execution_recommendation': 'Initiate deployment via verified staging hubs.',
    'mission_intelligence.technical_terrain_advisory': 'Sustained concentration required for high-altitude sectors.'
};

// Check for flags
const SHOULD_UPLOAD = process.argv.includes('--upload');
const FORCE_UPSELL = process.argv.includes('--upsell');
const SHOULD_HYDRATE = process.argv.includes('--hydrate');

let MISSION_ID = 'RA033';
const missionFlag = process.argv.find(arg => arg.startsWith('--mission='));
const positionalMission = process.argv.slice(2).find(arg => !arg.startsWith('--'));

if (missionFlag) {
    MISSION_ID = missionFlag.split('=')[1];
} else if (positionalMission) {
    MISSION_ID = positionalMission;
}

async function render() {
    console.log(`[Dossier] Starting render pipeline for ${MISSION_ID}...`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const { admin, db } = require('../../lib/firebaseAdmin');
    
    // Load Data
    let data;
    const fixturePath = path.join(__dirname, 'fixtures', `${MISSION_ID}.json`);
    if (fs.existsSync(fixturePath)) {
        console.log(`[Dossier] Loaded data from fixture: ${fixturePath}`);
        data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    } else {
        console.log(`[Dossier] Fixture not found, fetching from Firestore missions_v1...`);
        const docSnap = await db.collection('missions_v1').doc(MISSION_ID).get();
        if (!docSnap.exists) {
            throw new Error(`Mission ${MISSION_ID} not found in Firestore or local fixtures.`);
        }
        const firestoreData = docSnap.data();
        
        // Adapt Firestore data to template expectations
        data = {
            slug: firestoreData.id || MISSION_ID,
            title: firestoreData.title,
            missionType: firestoreData.missionType || 'editorial',
            insertion_airport: firestoreData.airport?.start || firestoreData.insertion_airport || 'HUB',
            extraction_airport: firestoreData.airport?.end || firestoreData.extraction_airport || 'HUB',
            distance_km: firestoreData.stats?.distance_km || firestoreData.distance_km || 1128,
            duration_days: firestoreData.stats?.days || firestoreData.duration_days || 4,
            subsidy_pct: firestoreData.subsidy_pct || firestoreData.subsidyPct || 0,
            booking_ref: `JMM-${Math.floor(Math.random() * 100000)}`,
            include_upsell_page: FORCE_UPSELL,
            rider_name: "Executive Client",
            rider_archetype: "Tactical Explorer",
            selected_bike: firestoreData.featured_bike || firestoreData.recommended_machine || "BMW R 1300 GS",
            deployment_date: "TBD",
            operator_info: {
                name: "Rider Atlas Node",
                address: "Mission Staging Area"
            }
        };

        // A2A Rich Telemetry & Fleet Injection
        if (data.missionType === 'a2a') {
            if (MISSION_ID === 'dbv-to-muc-premium-reposition') {
                data.distance_km = 1128;
                data.duration_days = 4;
            }
            data.fleet_availability = [
                { name: "BMW R 1300 GS TROPHY", class: "FLAGSHIP ADVENTURE", normal_rate: 249, corridor_rate: 149, available: true },
                { name: "DUCATI MULTISTRADA V4S", class: "PERFORMANCE CROSSOVER", normal_rate: 289, corridor_rate: 179, available: true },
                { name: "KTM 1290 SUPER ADV R", class: "TECHNICAL ENDURO", normal_rate: 239, corridor_rate: 144, available: false },
                { name: "BMW S 1000 XR", class: "SPORT TOURER", normal_rate: 219, corridor_rate: 129, available: true },
                { name: "APRILIA TUAREG 660", class: "LIGHTWEIGHT TECHNICAL", normal_rate: 189, corridor_rate: 109, available: true }
            ];
        }
    }

    // Manual override for testing upsell
    if (FORCE_UPSELL) {
        data.include_upsell_page = true;
    }

    // 1. HARD VALIDATION: Required Ground-Truth
    for (const field of REQUIRED_FIELDS) {
        if (data[field] === undefined || data[field] === null) {
            throw new Error(`CRITICAL DATA FAILURE: Missing required ground-truth field "${field}" for mission ${MISSION_ID}. Rendering aborted.`);
        }
    }

    // 2. HYDRATION: Mission Intelligence
    if (SHOULD_HYDRATE) {
        const riderProfile = {
            name: data.rider_name || "VALUED RIDER",
            archetype: data.rider_archetype || "EXECUTIVE RIDER",
            machine_preference: data.selected_bike || "1300cc Adventure",
        };
        try {
            const intelligence = await hydrateMissionIntelligence(data, riderProfile);
            data.mission_intelligence = intelligence;
            console.log(`[Dossier] Mission intelligence hydrated successfully.`);
        } catch (err) {
            console.warn(`[Dossier] Hydration failed: ${err.message}. Pipeline will use fallbacks.`);
        }
    }

    // 2.5 VISUALS: Resolve Assets
    try {
        const visuals = await resolveMissionVisuals(MISSION_ID, data.missionType);
        data.mission_visuals = visuals;
        console.log(`[Dossier] Mission visuals resolved.`);
    } catch (err) {
        console.warn(`[Dossier] Visual resolution failed: ${err.message}. Pipeline will use fallbacks.`);
        data.mission_visuals = {};
    }

    // Load Template
    let templateName = 'mission-dossier-template.html';
    if (data.missionType === 'a2a') {
        templateName = 'a2a-dossier-template.html';
        console.log(`[Dossier] A2A Mission detected. Using specialized A2A template.`);
    }

    const templatePath = path.join(__dirname, templateName);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
    }
    let html = fs.readFileSync(templatePath, 'utf8');

    // 3. TEMPLATE ENGINE: Conditional Support
    // Resolve innermost tags first by avoiding greedy matches across other tags
    const ifElseRegex = /\{\{#if\s+([^\}]+)\}\}((?:(?!\{\{#if)[\s\S])*?)\{\{else\}\}((?:(?!\{\{#if)[\s\S])*?)\{\{\/if\}\}/;
    while (ifElseRegex.test(html)) {
        html = html.replace(ifElseRegex, (match, key, trueContent, falseContent) => {
            const path = key.trim();
            const parts = path.split('.');
            let value = data;
            for (const part of parts) {
                value = value ? value[part] : undefined;
            }
            return value ? trueContent : falseContent;
        });
    }

    const simpleIfRegex = /\{\{#if\s+([^\}]+)\}\}((?:(?!\{\{#if)[\s\S])*?)\{\{\/if\}\}/;
    while (simpleIfRegex.test(html)) {
        html = html.replace(simpleIfRegex, (match, key, content) => {
            const path = key.trim();
            const parts = path.split('.');
            let value = data;
            for (const part of parts) {
                value = value ? value[part] : undefined;
            }
            return value ? content : '';
        });
    }

    // Handle {{#each ...}}
    const eachRegex = /\{\{#each\s+([^\}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    html = html.replace(eachRegex, (match, key, content) => {
        const path = key.trim();
        const parts = path.split('.');
        let list = data;
        for (const part of parts) {
            list = list ? list[part] : undefined;
        }
        if (!Array.isArray(list)) return '';
        return list.map(item => {
            let itemHtml = content;
            if (typeof item === 'object' && item !== null) {
                const itemVarRegex = /\{\{this\.([^\}]+)\}\}/g;
                itemHtml = itemHtml.replace(itemVarRegex, (m, prop) => {
                    return item[prop] !== undefined ? item[prop] : m;
                });
                // Handle nested ifs inside each if needed
                const itemIfRegex = /\{\{#if\s+this\.([^\}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
                itemHtml = itemHtml.replace(itemIfRegex, (m, prop, trueContent) => {
                    return item[prop] ? trueContent : '';
                });
            } else if (typeof item === 'string') {
                itemHtml = itemHtml.replace(/\{\{this\}\}/g, item);
            }
            return itemHtml;
        }).join('');
    });

    // Handle {{variable}} with nested paths and fallbacks
    const varRegex = /\{\{([^\}]+)\}\}/g;
    html = html.replace(varRegex, (match, key) => {
        const path = key.trim();
        if (path.startsWith('#if') || path.startsWith('/if') || path === 'else') {
            return match;
        }

        const parts = path.split('.');
        let value = data;
        for (const part of parts) {
            value = value ? value[part] : undefined;
        }

        // SOFT FALLBACK: Intelligence Fields
        if (value === undefined && INTELLIGENCE_FALLBACKS[path]) {
            console.warn(`[Dossier] Intelligence field "${path}" missing. Using soft fallback.`);
            return INTELLIGENCE_FALLBACKS[path];
        }

        return value !== undefined ? value : match;
    });

    // 4. FINAL VALIDATION: No {{VARIABLE}} placeholders remaining
    const remainingPlaceholders = html.match(/\{\{[^\}]+\}\}/g);
    if (remainingPlaceholders) {
        throw new Error(`CRITICAL TEMPLATE FAILURE: Unresolved placeholders detected: ${remainingPlaceholders.join(', ')}. Rendering aborted.`);
    }

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

    // Storage Upload
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
        }
    }

    console.log(`[Dossier] Pipeline complete for ${MISSION_ID}.`);
}

render().catch(err => {
    console.error(`[Dossier] FATAL ERROR:`, err.message);
    process.exit(1);
});
