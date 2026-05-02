const { admin } = require('../../lib/firebaseAdmin');
const path = require('path');
const fs = require('fs');

/**
 * Uploads Mission Dossier artifacts to Firebase Storage.
 * 
 * @param {string} missionId The Mission ID (e.g., RA033)
 * @param {string} pdfPath Local path to the generated PDF
 * @param {string} htmlPath Local path to the generated HTML snapshot
 * @returns {Promise<{pdfUrl: string, htmlUrl: string}>}
 */
async function uploadMissionDossier(missionId, pdfPath, htmlPath) {
    const bucketName = 'factory1';
    const bucket = admin.storage().bucket(bucketName);

    const pdfTarget = `mission_dossiers/${missionId}/${missionId}-mission-dossier.pdf`;
    const htmlTarget = `mission_dossiers/${missionId}/${missionId}-mission-dossier.html`;

    console.log(`[Dossier] Uploading to gs://${bucketName}/${pdfTarget}...`);

    const commonMetadata = {
        cacheControl: 'public, max-age=3600',
        metadata: {
            missionId: missionId,
            documentType: 'mission_dossier',
            version: 'wave3'
        }
    };

    // Upload PDF
    await bucket.upload(pdfPath, {
        destination: pdfTarget,
        metadata: {
            ...commonMetadata,
            contentType: 'application/pdf'
        }
    });

    // Upload HTML
    await bucket.upload(htmlPath, {
        destination: htmlTarget,
        metadata: {
            ...commonMetadata,
            contentType: 'text/html'
        }
    });

    // Generate Signed URLs (preferred if private, but user also said "return a usable URL")
    // We'll generate a signed URL with a long expiration for verification.
    const [pdfUrl] = await bucket.file(pdfTarget).getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future
    });

    const [htmlUrl] = await bucket.file(htmlTarget).getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
    });

    return { pdfUrl, htmlUrl, pdfTarget, htmlTarget };
}

module.exports = {
    uploadMissionDossier
};
