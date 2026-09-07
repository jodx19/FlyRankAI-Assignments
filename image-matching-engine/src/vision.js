import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const imageMetadataSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: "The main subject of the image (e.g., 'red fox', 'gray wolf')" },
    category: { type: Type.STRING, description: "The broad category (e.g., 'animal', 'landscape', 'city')" },
    attributes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of visual attributes (e.g., 'orange fur', 'wild', 'forest', 'snow')" 
    },
    caption: { type: Type.STRING, description: "A detailed descriptive caption of the image" },
    confidence: { type: Type.NUMBER, description: "Confidence score in the classification from 0.0 to 1.0" }
  },
  required: ["subject", "category", "attributes", "caption", "confidence"]
};

export async function analyzeImage(imagePath, mimeType = 'image/jpeg') {
  try {
    const imageBytes = fs.readFileSync(imagePath);
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this image and describe exactly what is in it. Be precise about animal species if applicable." },
            { inlineData: { data: imageBytes.toString("base64"), mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: imageMetadataSchema,
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error(`Error analyzing image ${imagePath}:`, error);
    throw error;
  }
}
