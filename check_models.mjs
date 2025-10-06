// check_models.mjs
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY not found in .env.local file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log("Attempting to list available models for your API key...");
  try {
    const result = await genAI.listModels();
    console.log("-----------------------------------------------------");
    console.log("SUCCESS! Here are the models your API key can access:");
    console.log("-----------------------------------------------------");

    for await (const m of result) {
      if (m.supportsGenerateContent) {
        console.log(`- ${m.name} (Display Name: ${m.displayName})`);
      }
    }
    console.log("\nACTION: Copy one of the model names from the list above (e.g., 'models/gemini-pro') and use it in your route.ts file.");

  } catch (error) {
    console.error("\n-----------------------------------------------------");
    console.error("ERROR: Failed to list models. This points to a deeper issue.");
    console.error("-----------------------------------------------------");
    console.error(error.message);
    console.log("\nThis likely means there is a problem with your Google Cloud project setup or API key permissions. Please check the following in your Google Cloud Console:");
    console.log("1. Ensure the 'Generative Language API' (also known as 'aiplatform.googleapis.com') is ENABLED.");
    console.log("2. Ensure billing is enabled for your project (though listing models should be free).");
  }
}

listModels();