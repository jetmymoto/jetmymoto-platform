const admin = require("firebase-admin");

const POSTER_LIMITS = {
    DAILY_RENDER_LIMIT: 100,
    DAILY_AI_GEN_LIMIT: 20,
    DAILY_UPLOAD_SIZE_LIMIT_MB: 500,
    MAX_ASSETS_PER_JOB: 30,
    MAX_CONCURRENT_JOBS: 1
};

async function getDailyStats(db) {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = db.collection("poster_engine_stats").doc(today);
    const snap = await statsRef.get();
    
    if (!snap.exists) {
        return {
            renderCount: 0,
            aiGenCount: 0,
            uploadSizeBytes: 0,
            jobCount: 0
        };
    }
    
    return snap.data();
}

async function updateDailyStats(db, data) {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = db.collection("poster_engine_stats").doc(today);
    
    await statsRef.set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

module.exports = {
    POSTER_LIMITS,
    getDailyStats,
    updateDailyStats
};
