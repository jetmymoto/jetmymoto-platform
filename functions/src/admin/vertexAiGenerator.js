const { onRequest } = require("firebase-functions/v2/https");
const { VertexAI } = require("@google-cloud/vertexai");

const vertex = new VertexAI({
  project: "movie-chat-factory",
  location: "us-central1",
});

const model = vertex.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * Basic text generation using Vertex AI (Gemini 1.5 Flash)
 */
exports.generateText = onRequest(async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;

    res.json({ success: true, text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Image classification using Vertex AI
 */
exports.filterImages = onRequest(async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: "Missing or invalid images array" });
    }

    const prompt = `
Classify images.

Return JSON:
[
 { "url": "...", "isMotorcycle": true/false }
]

Images:
${images.join("\n")}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;

    res.json({ success: true, result: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
