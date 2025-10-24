import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("✅ SakhiAI Gemini backend running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    // Build conversation context
    let contextText = "";
    if (conversationHistory && conversationHistory.length > 0) {
      // Get last 6 messages for context (3 exchanges)
      const recentHistory = conversationHistory.slice(-6);
      contextText = "\n\nPrevious conversation:\n";
      recentHistory.forEach(msg => {
        contextText += `${msg.sender === 'user' ? 'User' : 'SakhiAI'}: ${msg.text}\n`;
      });
      contextText += "\n";
    }

    const prompt = `You are SakhiAI — a friendly, supportive, and safe AI assistant for women.
Be empathetic, respectful, and helpful when answering private or personal questions.

IMPORTANT: Use very simple, easy words that anyone can understand. Write like you're talking to a friend.

Guidelines for simple responses:
- Use **bold text** for important points
- Use short, simple sentences
- Avoid big or complicated words
- Use everyday language that everyone knows
- Create numbered lists (1. 2. 3.) for step-by-step advice
- Use bullet points (- or *) for simple lists
- Keep paragraphs short (2-3 sentences max)
- Be warm, caring, and encouraging
- Explain things in a way that's easy to follow
- Remember what we talked about before and build on it${contextText}
Current message: ${message}
SakhiAI:`;

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    // Generate content using the correct method
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log("AI Response:", response); // Add logging to debug
    res.json({ reply: response });
  } catch (error) {
    console.error("Error:", error);
    
    // Check if it's a network or API key error
    if (error.message && (error.message.includes("fetch failed") || error.message.includes("API key"))) {
      console.error("API Key or Network Error:", error.message);
      return res.status(503).json({ 
        error: "Unable to connect to AI service. Please check your internet connection and API key.",
        details: error.message
      });
    }
    
    // Fallback response when API is unavailable
    console.error("Sending fallback response");
    res.status(200).json({ 
      reply: "I'm sorry, I'm having trouble connecting to my knowledge service right now. Please try again in a moment." 
    });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ SakhiAI Gemini backend running on port ${process.env.PORT || 5000}`);
});
