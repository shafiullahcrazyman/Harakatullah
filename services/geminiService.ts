import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

// Retrieve keys from environment; handle both array (rotation) and string (single) formats
const envKeys = (process.env.API_KEYS as unknown as string[]) || [];
const singleKey = process.env.API_KEY;
const API_KEYS = envKeys.length > 0 ? envKeys : (singleKey ? [singleKey] : []);

let currentKeyIndex = 0;

export class GeminiService {
  
  static getDiagnostics() {
    return {
      keyCount: API_KEYS.length,
      currentKeyIndex: currentKeyIndex,
      models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    };
  }
  
  private static getClient(): GoogleGenAI {
    if (API_KEYS.length === 0) {
      throw new Error("No API Key provided. Please check your settings.");
    }
    const apiKey = API_KEYS[currentKeyIndex];
    return new GoogleGenAI({ apiKey });
  }

  private static rotateKey() {
    if (API_KEYS.length > 1) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      console.warn(`Rotating to API Key index ${currentKeyIndex}`);
    }
  }

  /**
   * Helper to attempt multiple models in order of preference.
   * Handles 429 (Too Many Requests) by rotating keys.
   */
  private static async generateWithFallback(
    params: Omit<GenerateContentParameters, 'model'>,
    models: string[]
  ): Promise<GenerateContentResponse> {
    let lastError: any;

    // Try each model
    for (const model of models) {
      // Retry loop for key rotation on specific errors
      for (let attempt = 0; attempt <= API_KEYS.length; attempt++) {
        try {
          const ai = this.getClient();
          return await ai.models.generateContent({
            ...params,
            model,
          });
        } catch (error: any) {
          lastError = error;
          const msg = error.message?.toLowerCase() || "";
          
          // Check for quota/rate limit or auth errors -> Rotate Key
          if (msg.includes("429") || msg.includes("quota") || msg.includes("limit") || msg.includes("key")) {
            console.warn(`Error with key index ${currentKeyIndex}: ${msg}. Rotating key...`);
            this.rotateKey();
            continue; // Retry same model with new key
          }
          
          // Check for model availability errors -> Try next Model
          if (
            msg.includes("not found") || 
            msg.includes("not enabled") || 
            msg.includes("restricted") || 
            msg.includes("404") ||
            msg.includes("unavailable") ||
            msg.includes("overloaded")
          ) {
            console.warn(`Model ${model} unavailable: ${msg}. Switching model...`);
            break; // Break inner loop to try next model
          }

          throw error; // Other errors (validation, etc)
        }
      }
    }
    throw lastError || new Error("All models and keys failed. Please check your API connectivity in Settings.");
  }

  /**
   * Restores Arabic diacritics (tashkeel) for a given text.
   */
  static async restoreTashkeel(text: string): Promise<string> {
    const prompt = `Restore all Arabic diacritics (tashkīl) for the following text. 
      Use full classical style including vowel marks (Fatha, Kasra, Damma), Shadda, Sukun, Tanween, Madd, and dots.
      Do not change the underlying letters or the meaning.
      Return ONLY the diacritized Arabic text.
      
      Text: ${text}`;

    // Tries Gemini 2.0 first, falls back to 1.5 Flash if 404 or unavailable
    const response = await this.generateWithFallback(
      { contents: prompt },
      ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    );

    return response.text?.trim() || "Error processing text";
  }

  /**
   * Performs OCR on an image and restores tashkeel to the extracted text.
   */
  static async performOCRAndTashkeel(base64Image: string): Promise<string> {
    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract the Arabic text from this image and restore all its diacritics (tashkīl) in full classical style. Return ONLY the diacritized Arabic text."
        }
      ]
    };

    const response = await this.generateWithFallback(
      { contents },
      ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b']
    );

    return response.text?.trim() || "Error extracting text";
  }
}