const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function list() {
  try {
     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
     const data = await response.json();
     data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } catch (err) {
     console.error(err);
  }
}
list();
