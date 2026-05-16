#!/usr/bin/env node

// Search Firestore motorcycles collection for card background images
const { db } = require("./src/lib/firebaseAdmin");
const https = require('https');
const http = require('http');

// Function to check if a URL is alive
async function checkUrlAlive(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      resolve(false);
      return;
    }

    const protocol = url.startsWith('https://') ? https : http;
    const request = protocol.get(url, (response) => {
      resolve(response.statusCode >= 200 && response.statusCode <= 299);
      response.destroy();
    });

    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function searchMotorcycleImages() {
  console.log("🔍 Searching Firestore 'motorcycles' collection for card background images...");
  console.log("🔗 Checking if image links are alive and selecting candidates");

  try {
    // Search all documents in motorcycles collection
    console.log("\n🔍 Searching motorcycles collection...");

    let allDocs = [];
    let lastDoc = null;
    let batchCount = 0;

    // Paginate through all documents
    while (batchCount < 15) {
      let query = db.collection('motorcycles').limit(100);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        break;
      }

      allDocs = allDocs.concat(snapshot.docs);
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      batchCount++;

      console.log(`📊 Batch ${batchCount}: ${snapshot.docs.length} documents, total: ${allDocs.length}`);
    }

    console.log(`\n📊 Total motorcycle documents found: ${allDocs.length}`);

    // Extract motorcycles with image URLs
    const motorcyclesWithImages = [];

    console.log("\n🔍 Processing motorcycle documents...");

    allDocs.forEach((doc, index) => {
      const data = doc.data();

      // Look for image URLs in the motorcycle document structure
      let imageUrl = null;
      let imageType = null;

      // Priority 1: heroImage object
      if (data.heroImage && data.heroImage.url) {
        imageUrl = data.heroImage.url;
        imageType = 'hero';
      }

      // Priority 2: cinematicImages array
      if (!imageUrl && data.cinematicImages && Array.isArray(data.cinematicImages) && data.cinematicImages.length > 0) {
        const cinematicImage = data.cinematicImages[0];
        if (cinematicImage && cinematicImage.url) {
          imageUrl = cinematicImage.url;
          imageType = `cinematic-${cinematicImage.type || 'unknown'}`;
        }
      }

      // Priority 3: gallery array
      if (!imageUrl && data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
        const galleryImage = data.gallery[0];
        if (galleryImage && galleryImage.url) {
          imageUrl = galleryImage.url;
          imageType = 'gallery';
        }
      }

      // Priority 4: images array
      if (!imageUrl && data.images && Array.isArray(data.images) && data.images.length > 0) {
        const image = data.images[0];
        if (image && image.url) {
          imageUrl = image.url;
          imageType = 'images';
        }
      }

      if (imageUrl) {
        motorcyclesWithImages.push({
          id: doc.id,
          brand: data.brand || data.make || 'Unknown',
          model: data.model || data.name || 'Unknown',
          year: data.year || 'Unknown',
          imageUrl: imageUrl,
          imageType: imageType,
          price: data.price || data.msrp || null,
          category: data.category || data.type || 'Unknown',
          description: data.shortDescription || data.description || 'No description',
          hasProfilePair: data.hasProfilePair || false,
          imageCount: data.imageCount || 0,
          heroMeta: data.heroMeta || null,
          data: data
        });
      }

      // Progress indicator
      if ((index + 1) % 100 === 0) {
        console.log(`   Processed ${index + 1}/${allDocs.length} documents...`);
      }
    });

    console.log(`\n🖼️  Found ${motorcyclesWithImages.length} motorcycles with image URLs`);

    if (motorcyclesWithImages.length === 0) {
      console.log("❌ No motorcycles with image URLs found");

      // Show sample document structure
      console.log("\n📋 Sample document structure:");
      if (allDocs.length > 0) {
        const sampleDoc = allDocs[0].data();
        console.log("Fields available:");
        Object.keys(sampleDoc).forEach(key => {
          console.log(`- ${key}: ${typeof sampleDoc[key]} (${JSON.stringify(sampleDoc[key]).slice(0, 100)}...)`);
        });
      }
      return;
    }

    // Check URL alive status and select candidates
    console.log("\n🔗 Checking image URL status...");

    const candidates = [];
    const totalToCheck = Math.min(motorcyclesWithImages.length, 50); // Limit to 50 for performance

    for (let i = 0; i < totalToCheck; i++) {
      const motorcycle = motorcyclesWithImages[i];

      console.log(`Checking ${i + 1}/${totalToCheck}: ${motorcycle.brand} ${motorcycle.model}`);

      const isAlive = await checkUrlAlive(motorcycle.imageUrl);

      if (isAlive) {
        candidates.push({
          ...motorcycle,
          urlStatus: '✅ ALIVE'
        });
      } else {
        // Still include for reference but mark as broken
        if (candidates.length < 20) { // Only show first 20 broken ones
          candidates.push({
            ...motorcycle,
            urlStatus: '❌ BROKEN'
          });
        }
      }
    }

    // Sort by alive URLs first, then by brand/model
    candidates.sort((a, b) => {
      if (a.urlStatus.includes('ALIVE') && b.urlStatus.includes('BROKEN')) return -1;
      if (a.urlStatus.includes('BROKEN') && b.urlStatus.includes('ALIVE')) return 1;
      return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
    });

    console.log(`\n🏍️  MOTORCYCLE CARD BACKGROUND CANDIDATES:\n`);

    candidates.forEach((motorcycle, index) => {
      console.log(`${index + 1}. 🏍️ ${motorcycle.brand} ${motorcycle.model} ${motorcycle.year}`);
      console.log(`   ${motorcycle.urlStatus}`);
      console.log(`   🔗 Image URL: ${motorcycle.imageUrl}`);
      console.log(`   🖼️  Image Type: ${motorcycle.imageType} | Count: ${motorcycle.imageCount}`);
      console.log(`   💰 Price: ${motorcycle.price || 'Not specified'}`);
      console.log(`   📂 Category: ${motorcycle.category}`);
      console.log(`   📝 Description: ${motorcycle.description.substring(0, 80)}${motorcycle.description.length > 80 ? '...' : ''}`);
      console.log(`   📄 Document ID: ${motorcycle.id}`);
      if (motorcycle.heroMeta) {
        console.log(`   🎬 Hero Score: ${motorcycle.heroMeta.score} | Aspect: ${motorcycle.heroMeta.aspectRatio}`);
      }
      console.log('');
    });

    // Summary
    const aliveCount = candidates.filter(c => c.urlStatus.includes('ALIVE')).length;
    const brokenCount = candidates.filter(c => c.urlStatus.includes('BROKEN')).length;

    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Working URLs: ${aliveCount}`);
    console.log(`❌ Broken URLs: ${brokenCount}`);
    console.log(`📚 Total checked: ${candidates.length}`);
    console.log(`🏍️  Total motorcycles with images: ${motorcyclesWithImages.length}`);

    // Show top working candidates for card backgrounds
    const workingCandidates = candidates.filter(c => c.urlStatus.includes('ALIVE')).slice(0, 10);

    if (workingCandidates.length > 0) {
      console.log(`\n🏆 TOP ${workingCandidates.length} WORKING CARD BACKGROUND CANDIDATES:\n`);

      workingCandidates.forEach((motorcycle, index) => {
        console.log(`${index + 1}. ${motorcycle.brand} ${motorcycle.model} ${motorcycle.year}`);
        console.log(`   🔗 ${motorcycle.imageUrl}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error("❌ Error querying Firestore:", error);
    console.log("Error details:", error.message);
  }
}

// Run the search
searchMotorcycleImages()
  .then(() => {
    console.log("\n✅ Search complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });