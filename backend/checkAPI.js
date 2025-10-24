import dotenv from "dotenv";
dotenv.config();

// Test basic API connectivity
async function checkAPIKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "Not found");
  
  try {
    // Try a direct HTTP request to check if the API key is valid
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Key is valid!");
      console.log("Available models:", data.models?.map(m => m.name) || "No models found");
    } else {
      console.error("❌ API Key validation failed:");
      console.error("Status:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error:", errorText);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

checkAPIKey();
