const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { runPosterEngineV1 } = require("../../../scripts/poster-engine/lib/runPosterEngineV1.cjs");
const { updateDailyStats } = require("./posterEngineLimits");

if (!admin.apps.length) {
    admin.initializeApp();
}

async function processPosterEngineJobDocument(snapshot, overrides = {}) {
    if (!snapshot) return null;

    const database = overrides.admin || admin;
    const jobRef = snapshot.ref;
    const job = snapshot.data();

    // Stability Lock: Reject if not queued or already failed/completed
    if (!job || job.status !== "queued") {
        return null;
    }

    // Retry Protection: Skip if retryCount exceeded
    const MAX_RETRIES = 3;
    if ((job.retryCount || 0) >= MAX_RETRIES) {
        console.warn(`[Worker] Job ${jobRef.id} exceeded max retries. Marking as failed.`);
        await jobRef.update({
            status: "failed",
            errors: admin.firestore.FieldValue.arrayUnion("Max retries exceeded"),
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
    }

    console.log(`[Worker] Starting job: ${jobRef.id}`);

    // Update status to running with a safety lock
    const serverTimestamp = database.firestore.FieldValue.serverTimestamp();
    await jobRef.update({
        status: "running",
        startedAt: serverTimestamp,
        retryCount: admin.firestore.FieldValue.increment(1)
    });

    try {
        const options = {
            mode: job.mode,
            missionIds: job.missionIds,
            limit: job.limit,
            formats: job.formats,
            styles: job.styles,
            upload: job.upload,
            allowAi: job.allowAi,
            force: job.force,
            dryRun: job.dryRun,
            onProgress: async (progress) => {
                await jobRef.update({ 
                    progress,
                    lastHeartbeat: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        };

        const result = await runPosterEngineV1(database, options);

        // Update Phase 2 Stats
        if (!job.dryRun) {
            await updateDailyStats(database, {
                renderCount: admin.firestore.FieldValue.increment(result.summary.completed),
                aiGenCount: admin.firestore.FieldValue.increment(result.totalAiGenCount || 0),
                uploadSizeBytes: admin.firestore.FieldValue.increment(result.totalUploadSizeBytes || 0),
                jobCount: admin.firestore.FieldValue.increment(1)
            });
        }

        // Manifest Validation
        if (job.upload && !job.dryRun && result.resultManifest) {
            const bucket = database.storage().bucket();
            const manifestPath = result.resultManifest.replace(`gs://${bucket.name}/`, "");
            const [exists] = await bucket.file(manifestPath).exists();
            if (!exists) {
                throw new Error("Manifest validation failed: Result manifest not found in GCS");
            }
        }

        // Final Status
        const hasFailures = result.summary.failed > 0;
        const status = hasFailures ? "completed_with_errors" : "completed";

        await jobRef.update({
            status,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            resultManifest: result.resultManifest,
            contactSheet: result.contactSheetUrl,
            progress: result.summary,
            error: admin.firestore.FieldValue.delete()
        });

        console.log(`[Worker] Job ${status}: ${jobRef.id}`);

    } catch (err) {
        console.error(`[Worker] Job failed: ${jobRef.id}`, err);
        await jobRef.update({
            status: "failed",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            errors: admin.firestore.FieldValue.arrayUnion(err.message || "Unknown error")
        });
    }

    return null;
}

const processPosterEngineJob = onDocumentCreated(
    {
        document: "poster_engine_jobs/{jobId}",
        memory: "2GiB",
        timeoutSeconds: 540,
    },
    async (event) => processPosterEngineJobDocument(event.data)
);

module.exports = {
    processPosterEngineJob,
    processPosterEngineJobDocument
};
