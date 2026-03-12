import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load Firebase service account manually
const serviceAccountPath = path.resolve(
  __dirname,
  "../firebase-service-account.json"
)

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
)

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

console.log("Fetching POIs from Firestore...")

const snapshot = await db.collection("pois").get()

const poiIndex = {}

snapshot.forEach(doc => {

  const data = doc.data()

  if (!data.slug) return

  poiIndex[data.slug] = {
    name: data.name || "",
    slug: data.slug,
    category: data.category || "",
    region: data.region || "",
    country: data.country || "",
    lat: data.lat || null,
    lng: data.lng || null,
    nearest_airport: data.nearest_airport || "",
    description: data.description || ""
  }

})

// Output file
const outputPath = path.resolve(
  process.cwd(),
  "src/features/poi/poiIndex.json"
)

fs.writeFileSync(
  outputPath,
  JSON.stringify(poiIndex, null, 2)
)

console.log(`✅ Exported ${Object.keys(poiIndex).length} POIs`)
console.log(`Saved to: ${outputPath}`)