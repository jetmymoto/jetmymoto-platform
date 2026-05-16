const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(__dirname, "..", "..", "serviceAccountKey.json");

  if (fs.existsSync(serviceAccountPath)) {
    // Local scripts run outside GCP; prefer the checked-in service account file.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

module.exports = {
  admin,
  db,
};
