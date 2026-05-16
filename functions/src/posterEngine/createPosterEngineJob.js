const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");
const { PosterEngineJobSchema } = require("./posterEngineJobSchema");
const { POSTER_LIMITS, getDailyStats } = require("./posterEngineLimits");

const POSTER_ENGINE_ADMIN_KEY = process.env.POSTER_ENGINE_ADMIN_KEY || "jetmymoto-poster-dev-2026";

if (!admin.apps.length) {
    admin.initializeApp();
}

function calculatePayloadHash(data) {
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(serialized).digest("hex");
}

const createPosterEngineJob = onRequest(
    {
        memory: "256MiB",
        cors: true,
    },
    async (req, res) => {
        const adminKey = req.get("x-jetmymoto-admin-key");

        if (adminKey !== POSTER_ENGINE_ADMIN_KEY) {
            return res.status(401).json({ error: "Unauthorized: Invalid admin key" });
        }

        const path = req.path.replace(/\/+$/, "");

        if (req.method === "POST" && (path === "/jobs" || path === "")) {
            try {
                const validatedData = PosterEngineJobSchema.parse(req.body);
                const db = admin.firestore();
                
                // --- Phase 2: Cost Protection Checks ---

                // 1. Max Concurrent Jobs
                const runningJobs = await db.collection("poster_engine_jobs")
                    .where("status", "in", ["running"])
                    .limit(POSTER_LIMITS.MAX_CONCURRENT_JOBS)
                    .get();

                if (!runningJobs.empty) {
                    return res.status(429).json({ 
                        error: "Concurrency limit exceeded", 
                        message: `Max concurrent jobs (${POSTER_LIMITS.MAX_CONCURRENT_JOBS}) reached.` 
                    });
                }

                // 2. Per-Job Asset Count
                const missionCount = validatedData.missionIds?.length || validatedData.limit;
                const assetCount = missionCount * validatedData.styles.length * validatedData.formats.length;
                if (assetCount > POSTER_LIMITS.MAX_ASSETS_PER_JOB) {
                    return res.status(400).json({ 
                        error: "Job too large", 
                        message: `This job would produce ${assetCount} assets, which exceeds the limit of ${POSTER_LIMITS.MAX_ASSETS_PER_JOB}.` 
                    });
                }

                // 3. Daily Render Quota
                const stats = await getDailyStats(db);
                if (stats.renderCount >= POSTER_LIMITS.DAILY_RENDER_LIMIT) {
                    return res.status(403).json({ 
                        error: "Daily quota exceeded", 
                        message: "Daily render limit reached. Please try again tomorrow." 
                    });
                }

                // 1. Calculate Payload Hash for Duplicate Protection
                const payloadHash = calculatePayloadHash(validatedData);
                
                // 2. Check for existing active job with same payload
                const existingJobs = await db.collection("poster_engine_jobs")
                    .where("payloadHash", "==", payloadHash)
                    .where("status", "in", ["queued", "running"])
                    .limit(1)
                    .get();

                if (!existingJobs.empty) {
                    const existingJob = existingJobs.docs[0];
                    return res.status(200).json({
                        ok: true,
                        jobId: existingJob.id,
                        status: existingJob.data().status,
                        message: "Found existing active job with same payload. Returning existing jobId.",
                        duplicate: true
                    });
                }

                const jobRef = db.collection("poster_engine_jobs").doc();
                const jobId = jobRef.id;

                const jobDoc = {
                    jobId,
                    type: "poster_engine_v1",
                    mode: validatedData.mode,
                    status: "queued",
                    missionIds: validatedData.missionIds || [],
                    limit: validatedData.limit,
                    styles: validatedData.styles,
                    formats: validatedData.formats,
                    upload: validatedData.upload,
                    allowAi: validatedData.allowAi,
                    force: validatedData.force,
                    dryRun: validatedData.dryRun,
                    payloadHash,
                    retryCount: 0,
                    outputRoot: "gs://factory1/poster_engine_v1/",
                    progress: {
                        total: 0,
                        completed: 0,
                        failed: 0,
                        needsReview: 0
                    },
                    resultManifest: null,
                    contactSheet: null,
                    errors: [],
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    startedAt: null,
                    completedAt: null
                };

                await jobRef.set(jobDoc);

                return res.status(201).json({
                    ok: true,
                    jobId,
                    status: "queued",
                    message: "Poster engine job created successfully"
                });
            } catch (err) {
                if (err.name === "ZodError") {
                    return res.status(400).json({ error: "Validation failed", details: err.errors });
                }
                console.error("Failed to create poster engine job:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
        }

        if (req.method === "GET" && path.startsWith("/jobs/")) {
            const jobId = path.split("/").pop();
            if (!jobId) {
                return res.status(400).json({ error: "Missing jobId" });
            }

            try {
                const db = admin.firestore();
                const jobSnap = await db.collection("poster_engine_jobs").doc(jobId).get();

                if (!jobSnap.exists) {
                    return res.status(404).json({ error: "Job not found" });
                }

                return res.status(200).json(jobSnap.data());
            } catch (err) {
                console.error("Failed to fetch poster engine job:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
        }

        return res.status(405).json({ error: "Method not allowed or invalid path" });
    }
);

module.exports = {
    createPosterEngineJob
};
