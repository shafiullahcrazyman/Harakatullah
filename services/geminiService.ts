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
      // Updated to Gemini 3 and 2.0/2.5 series
      models: ['gemini-3-flash-preview', 'gemini-2.0-flash-exp']
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
    const errors: string[] = [];

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
          const msg = error.message?.toLowerCase() || "";
          const errorLog = `Model ${model} (Key ${currentKeyIndex}): ${error.message}`;
          console.warn(errorLog);
          
          // Check for quota/rate limit or auth errors -> Rotate Key
          if (msg.includes("429") || msg.includes("quota") || msg.includes("limit") || msg.includes("key")) {
            console.warn(`Rotating key due to quota/limit...`);
            this.rotateKey();
            // Don't record this as a hard failure yet, try next key
            continue; 
          }
          
          // If we are here, the model failed with the current key.
          // We break the key loop to try the next model.
          errors.push(errorLog);
          break; 
        }
      }
    }
    
    // If we get here, all models failed. Throw a combined error message.
    throw new Error(`All attempts failed.\nDetails:\n${errors.join('\n')}`);
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

    // Priority:
    // 1. gemini-3-flash-preview (Latest basic text model)
    // 2. gemini-2.0-flash-exp (Modern experimental flash)
    const response = await this.generateWithFallback(
      { contents: prompt },
      ['gemini-3-flash-preview', 'gemini-2.0-flash-exp']
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
      ['gemini-3-flash-preview', 'gemini-2.0-flash-exp']
    );

    return response.text?.trim() || "Error extracting text";
  }
}