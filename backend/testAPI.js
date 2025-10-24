import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
  // First check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ No API key found in environment variables");
    return;
  }
  
  console.log("✅ API key found, testing models...");
  
  const modelsToTry = [
    "models/gemini-pro", 
    "models/gemini-1.5-flash", 
    "models/gemini-1.5-pro",
    "gemini-pro", 
    "gemini-1.5-flash", 
    "gemini-1.5-pro",
    "text-bison-001"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
      const result = await model.generateContent("Hello, can you respond with just 'API working!'?");
      const response = result.response.text();
      console.log(`✅ SUCCESS with ${modelName}:`, response);
      return modelName; // Return the working model name
    } catch (error) {
      console.error(`❌ Failed with ${modelName}:`, error.message.split('\n')[0]);
    }
  }
  console.error("❌ All models failed - API key might be invalid or restricted");
}

testAPI();
