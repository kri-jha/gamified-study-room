const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Use gemini-flash-latest
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are an expert, encouraging study tutor in a virtual study room named "Gamified Productivity Tool". 
A student is studying and has asked you the following question or told you the following:
"${message}"
Please provide a helpful, concise, and guiding response to assist their study session. Use emojis to be friendly. Keep it under 200 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

module.exports = router;
