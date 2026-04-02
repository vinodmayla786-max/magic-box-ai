const { GoogleGenerativeAI } = require("@google/generative-ai");
// Load environment variables directly from .env.local for this test script
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("ERROR: API key not found. Make sure .env.local exists and contains GEMINI_API_KEY.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log("Fetching available models...");
    try {
        // We use the REST API endpoint temporarily just to get the list
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log("\n--- AVAILABLE MODELS ---");
        data.models.forEach(model => {
             // We only care about models that support 'generateContent'
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`Name: ${model.name.replace('models/', '')}`);
                console.log(`Description: ${model.description}`);
                console.log("------------------------");
            }
        });
        console.log("------------------------\n");
        console.log("Copy one of the 'Name' values above and use it in your route.ts file.");

    } catch (error) {
        console.error("Failed to fetch models:", error);
    }
}

listModels();