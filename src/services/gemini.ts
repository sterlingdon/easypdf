import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini AI Client
// Using process.env.API_KEY as strictly required by instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to the Gemini model with optional image context.
 * Uses gemini-3-flash-preview as the default reasoning model for text tasks
 * which also supports multimodal inputs efficiently.
 */
export const sendMessageToGemini = async (
  prompt: string,
  imageBase64?: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview'; 

    let contents;

    if (imageBase64) {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageBase64.split(',')[1];
      
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      };
    } else {
      contents = {
        parts: [{ text: prompt }]
      };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        // Thinking budget is optional, defaulting to 0 for standard chat speed
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Streaming version of the chat for better UX.
 */
export async function* sendMessageStream(
  prompt: string,
  imageBase64?: string,
  mimeType: string = 'image/jpeg'
) {
  const modelId = 'gemini-3-flash-preview';
  
  let contents;
  if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      contents = {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      };
  } else {
      contents = { parts: [{ text: prompt }] };
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: contents,
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
}
