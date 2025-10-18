import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/text-bison-001" });

app.get("/", (req, res) => {
  res.send("✅ SakhiAI Gemini backend running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const prompt = `You are SakhiAI — a friendly, supportive, and safe AI assistant for women. 
Be empathetic, respectful, and helpful when answering private or personal questions.\n
User: ${message}\nSakhiAI:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ SakhiAI Gemini backend running on port ${process.env.PORT || 5000}`);
});
