import { Storage } from '@google-cloud/storage';

async function generateSignedUrl() {
  try {
    // We try to use the environment's credentials
    const storage = new Storage();
    const bucketName = 'movie-chat-factory.firebasestorage.app';
    const filePath = 'assetgeatherer1/mission-001-e2e_46.6187_12.3054.mp4';
    
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl(options);
    console.log("SIGNED URL:", url);
  } catch (error) {
    console.error("Error generating URL:", error.message);
  }
}

generateSignedUrl();
