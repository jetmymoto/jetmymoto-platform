#!/usr/bin/env node

// Search Firestore visualAssets collection for card background images
const admin = require("firebase-admin");

// Initialize Firebase Admin (uses default credentials)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function searchCardBackgroundImages() {
  console.log("🔍 Searching Firestore 'visualAssets' collection for card background images...");
  console.log("📍 Storage path filter: gs://movie-chat-factory.firebasestorage.app/15rentalimagesx1");

  try {
    // Query for images suitable for card backgrounds
    const query = db.collection('visualAssets')
      .where('orientation', '==', 'landscape')  // Landscape for card backgrounds
      .where('storagePath', '>=', 'gs://movie-chat-factory.firebasestorage.app/15rentalimagesx1')
      .where('storagePath', '<', 'gs://movie-chat-factory.firebasestorage.app/15rentalimagesx2')
      .orderBy('storagePath')
      .orderBy('cinematicScore', 'desc')
      .limit(20);

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log("❌ No matching images found in collection");

      // Try broader search without storage path filter
      console.log("\n🔍 Trying broader search...");
      const broaderQuery = db.collection('visualAssets')
        .where('orientation', '==', 'landscape')
        .orderBy('cinematicScore', 'desc')
        .limit(10);

      const broaderSnapshot = await broaderQuery.get();

      if (broaderSnapshot.empty) {
        console.log("❌ No landscape images found in collection at all");
        return;
      }

      console.log(`\n📋 Found ${broaderSnapshot.size} landscape images (broader search):`);
      broaderSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. ${data.storagePath || 'No storage path'}`);
        console.log(`   🏍️  Brand: ${data.brand || 'Unknown'} | Model: ${data.model || 'Unknown'}`);
        console.log(`   📐 Dimensions: ${data.width}x${data.height} (${data.aspectRatio})`);
        console.log(`   🎬 Cinematic Score: ${data.cinematicScore || 0}`);
        console.log(`   🖼️  Image Type: ${data.imageType || 'Unknown'}`);
        console.log(`   🎨 Background: ${data.background || 'Unknown'}`);
      });

      return;
    }

    console.log(`\n📋 Found ${snapshot.size} potential card background images:\n`);

    snapshot.forEach((doc, index) => {
      const data = doc.data();

      console.log(`${index + 1}. 🏍️ ${data.brand || 'Unknown'} ${data.model || 'Unknown'}`);
      console.log(`   📸 ${data.storagePath}`);
      console.log(`   📐 ${data.width}x${data.height} (${data.aspectRatio}) - ${data.orientation}`);
      console.log(`   🎬 Cinematic: ${data.cinematicScore || 0} | Quality: ${data.qualityScore || 0}`);
      console.log(`   🎨 Type: ${data.imageType || 'N/A'} | Background: ${data.background || 'N/A'}`);
      console.log(`   💡 Context: ${data.context || 'N/A'} | Lighting: ${data.lighting || 'N/A'}`);

      if (data.tags && data.tags.length > 0) {
        console.log(`   🏷️  Tags: ${data.tags.join(', ')}`);
      }

      console.log(`   🔗 Source: ${data.sourceUrl || 'N/A'}\n`);
    });

    // Also show top candidates by cinematic score
    console.log("\n🏆 TOP CANDIDATES by cinematic score:");
    const topCandidates = snapshot.docs
      .sort((a, b) => (b.data().cinematicScore || 0) - (a.data().cinematicScore || 0))
      .slice(0, 5);

    topCandidates.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.storagePath} (Score: ${data.cinematicScore || 0})`);
    });

  } catch (error) {
    console.error("❌ Error querying Firestore:", error);

    // If the query fails, try a simpler approach
    console.log("\n🔍 Attempting simpler query...");
    try {
      const simpleQuery = db.collection('visualAssets').limit(5);
      const simpleSnapshot = await simpleQuery.get();

      console.log(`\nFound ${simpleSnapshot.size} documents in visualAssets collection`);
      simpleSnapshot.forEach(doc => {
        console.log(`- Document ID: ${doc.id}`);
        console.log(`  Storage Path: ${doc.data().storagePath || 'N/A'}`);
        console.log(`  Brand: ${doc.data().brand || 'N/A'}`);
      });

    } catch (simpleError) {
      console.error("❌ Simple query also failed:", simpleError);
    }
  }
}

// Run the search
searchCardBackgroundImages()
  .then(() => {
    console.log("\n✅ Search complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });