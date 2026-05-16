const { admin } = require('../../lib/firebaseAdmin');

const BUCKET_NAME = 'factory1';

/**
 * Resolves visual assets for a mission.
 * Converts to Data URIs for PDF rendering safety.
 */
async function resolveMissionVisuals(missionId, missionType = 'editorial') {
    console.log(`[Visuals] Resolving assets for ${missionId} (${missionType}) from GCS...`);
    
    const visuals = {
        hero: null,
        route_map: null,
        machine_profile: null,
        reel_preview: null,
        offer: null
    };

    const bucket = admin.storage().bucket(BUCKET_NAME);

    // 1. Try to load mission-specific visuals first
    const metadataPath = `mission_dossiers/${missionId}/visuals/metadata.json`;
    try {
        const [metadataContent] = await bucket.file(metadataPath).download();
        const metadata = JSON.parse(metadataContent.toString());

        if (metadata && metadata.assets && Array.isArray(metadata.assets)) {
            for (const asset of metadata.assets) {
                if (
                    asset.approvedForPdf === true &&
                    asset.status === "ready" &&
                    ["jpg", "jpeg", "webp"].includes(asset.format)
                ) {
                    try {
                        const [fileBuffer] = await bucket.file(asset.storagePath).download();
                        const mimeType = asset.format === 'webp' ? 'image/webp' : 'image/jpeg';
                        const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

                        if (asset.assetType === 'hero') visuals.hero = dataUri;
                        if (asset.assetType === 'route') visuals.route_map = dataUri;
                        if (asset.assetType === 'reel') visuals.reel_preview = dataUri;
                        if (asset.assetType === 'machine') visuals.machine_profile = dataUri;
                        if (asset.assetType === 'offer') visuals.offer = dataUri;
                    } catch (fetchErr) {
                         console.warn(`[Visuals] Failed to download asset ${asset.assetType}: ${fetchErr.message}`);
                    }
                }
            }
        }
    } catch (err) {
        console.log(`[Visuals] No mission-specific metadata for ${missionId}.`);
    }

    // 2. A2A Strategy: Resolve shared background if hero is still missing
    if (missionType === 'a2a' && !visuals.hero) {
        console.log(`[Visuals] Resolving shared A2A background for ${missionId}...`);
        try {
            const assignmentPath = 'mission_dossiers/a2a_background_assignment_manifest.json';
            const [assignmentContent] = await bucket.file(assignmentPath).download();
            const assignmentData = JSON.parse(assignmentContent.toString());
            
            const assignment = assignmentData.assignments.find(a => a.mission_id === missionId);
            if (assignment && assignment.gcs_path) {
                console.log(`[Visuals] Found assignment: ${assignment.archetype_name}`);
                const storagePath = assignment.gcs_path.replace(`gs://${BUCKET_NAME}/`, '');
                const [fileBuffer] = await bucket.file(storagePath).download();
                visuals.hero = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
            }
        } catch (err) {
            console.warn(`[Visuals] Shared A2A background resolution failed: ${err.message}`);
        }
    }

    return visuals;
}

module.exports = { resolveMissionVisuals };
