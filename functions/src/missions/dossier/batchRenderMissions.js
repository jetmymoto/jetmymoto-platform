const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const admin = require('../../lib/firebaseAdmin').admin;
const db = admin.firestore();
const bucket = admin.storage().bucket('factory1');

const OUTPUT_DIR = '/tmp/jetmymoto/mission-dossiers';
const REPORT_PATH = path.join(OUTPUT_DIR, 'batch-render-report.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkMissionAssets(missionId) {
    const metaPath = `mission_dossiers/${missionId}/visuals/metadata.json`;
    const posterPath = `mission_dossiers/${missionId}/visuals/hero-poster.jpg`;
    
    try {
        const [metaFile] = await bucket.file(metaPath).get();
        const [posterExists] = await bucket.file(posterPath).exists();
        
        if (!posterExists) return { ready: false, reason: 'hero-poster.jpg missing' };
        
        const metadata = JSON.parse((await metaFile.download())[0].toString());
        const heroApproved = metadata.assets?.find(a => a.assetType === 'hero')?.approvedForPdf === true;
        
        if (!heroApproved) {
            return { ready: false, reason: 'Hero poster not approved for PDF' };
        }
        
        return { ready: true, metadata };
    } catch (err) {
        return { ready: false, reason: `GCS Check Failed: ${err.message}` };
    }
}

async function validatePdf(missionId) {
    const pdfPath = path.join(OUTPUT_DIR, `${missionId}.pdf`);
    const htmlPath = path.join(OUTPUT_DIR, `${missionId}.html`);
    
    const results = {
        valid: true,
        errors: []
    };

    // 1. PDF Size Check
    if (!fs.existsSync(pdfPath)) {
        results.valid = false;
        results.errors.push('PDF file not found locally');
    } else {
        const stats = fs.statSync(pdfPath);
        if (stats.size > 1024 * 1024) {
            results.valid = false;
            results.errors.push(`PDF exceeds 1MB (${Math.round(stats.size / 1024)}KB)`);
        }
    }

    // 2. Placeholder Leakage Check
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const placeholders = html.match(/\{\{[^\}]+\}\}/g);
        if (placeholders) {
            results.valid = false;
            results.errors.push(`Placeholders detected: ${placeholders.join(', ')}`);
        }

        // 3. Remote Image Check
        if (html.includes('src="http') && !html.includes('src="data:image')) {
            results.valid = false;
            results.errors.push('Remote image URLs detected in HTML');
        }
    }

    // 4. GCS Verification
    const gcsPath = `mission_dossiers/${missionId}/${missionId}-mission-dossier.pdf`;
    const [exists] = await bucket.file(gcsPath).exists();
    if (!exists) {
        results.valid = false;
        results.errors.push('Final PDF not found in GCS');
    }

    return results;
}

async function runBatch() {
    const args = process.argv.slice(2);
    const limitArg = args.find(a => a.startsWith('--limit='));
    const missionArg = args.find(a => a.startsWith('--missions='));
    
    let missionIds = [];
    if (missionArg) {
        missionIds = missionArg.split('=')[1].split(',');
    }

    const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
    
    console.log(`[Batch] Starting Dossier Production Run...`);
    if (missionIds.length > 0) {
        console.log(`[Batch] Targeting specific missions: ${missionIds.join(', ')}`);
    } else {
        console.log(`[Batch] Using Firestore limit: ${limit}`);
    }

    const report = {
        startTime: new Date().toISOString(),
        processed: 0,
        successful: 0,
        skipped: 0,
        failed: 0,
        missions: []
    };

    let missions = [];
    if (missionIds.length > 0) {
        for (const id of missionIds) {
            const doc = await db.collection('missions_v1').doc(id).get();
            if (doc.exists) {
                missions.push({ id: doc.id, ...doc.data() });
            } else {
                console.warn(`[Batch] Mission ${id} not found in Firestore. Skipping.`);
                report.skipped++;
                report.missions.push({ id, status: 'skipped', reason: 'Not found in Firestore' });
            }
        }
    } else {
        const snapshot = await db.collection('missions_v1').limit(limit).get();
        missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    for (const mission of missions) {
        const missionId = mission.id;
        console.log(`\n[Batch] >>> Processing ${missionId}...`);
        
        // 1. CHECK MODE
        const assetCheck = await checkMissionAssets(missionId);
        if (!assetCheck.ready) {
            console.log(`[Batch] SKIP: ${assetCheck.reason}`);
            report.skipped++;
            report.missions.push({ id: missionId, status: 'skipped', reason: assetCheck.reason });
            continue;
        }

        // 2. RENDER MODE
        try {
            console.log(`[Batch] RENDER: Triggering pipeline...`);
            const cmd = `node functions/src/missions/dossier/renderMissionDossier.js --mission=${missionId} --hydrate --upload`;
            execSync(cmd, { stdio: 'inherit' });
            
            // 3. VALIDATION
            const validation = await validatePdf(missionId);
            if (validation.valid) {
                console.log(`[Batch] SUCCESS: ${missionId} produced and validated.`);
                report.successful++;
                report.missions.push({ id: missionId, status: 'success' });
            } else {
                console.error(`[Batch] VALIDATION FAILED: ${validation.errors.join('; ')}`);
                report.failed++;
                report.missions.push({ id: missionId, status: 'failed_validation', errors: validation.errors });
            }
        } catch (err) {
            console.error(`[Batch] RENDER FAILED: ${err.message}`);
            report.failed++;
            report.missions.push({ id: missionId, status: 'failed_render', error: err.message });
        }

        report.processed++;
        
        console.log(`[Batch] Cooling down (10s)...`);
        await sleep(10000);
    }

    report.endTime = new Date().toISOString();
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    
    console.log(`\n[Batch] ======================================`);
    console.log(`[Batch] Run Complete.`);
    console.log(`[Batch] Total: ${report.processed}`);
    console.log(`[Batch] Success: ${report.successful}`);
    console.log(`[Batch] Skipped: ${report.skipped}`);
    console.log(`[Batch] Failed: ${report.failed}`);
    console.log(`[Batch] Report saved to: ${REPORT_PATH}`);
    console.log(`[Batch] ======================================\n`);
}

runBatch().catch(err => {
    console.error(`[Batch] FATAL ERROR:`, err);
    process.exit(1);
});
