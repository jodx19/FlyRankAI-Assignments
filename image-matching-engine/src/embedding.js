import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: text,
    });
    
    // Handle the response structure from the Gemini SDK
    if (response.embeddings && response.embeddings.length > 0) {
        return response.embeddings[0].values;
    }
    throw new Error("No embedding returned");
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
