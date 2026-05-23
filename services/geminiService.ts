
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ReferenceImage } from "../types";
import { SYSTEM_INSTRUCTION, ArtisticStyle } from "../constants";

export class GeminiService {
  /**
   * Generates 3 refined prompts with varying poses but consistent outfit/setting.
   */
  async generatePrompts(
    prompt: string, 
    images: ReferenceImage[], 
    selectedStyle?: ArtisticStyle,
    aiTwinDescription?: string
  ): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let baseContext = `User Core Idea: ${prompt}`;
    if (selectedStyle) {
      baseContext += `\nArtistic Style: ${selectedStyle.name} (${selectedStyle.promptSuffix})`;
    }
    if (aiTwinDescription && images.length === 0) {
      baseContext += `\nSubject Identity Details: ${aiTwinDescription}`;
    }
    
    const parts: any[] = [{ 
      text: `${SYSTEM_INSTRUCTION}
      
      TASK: Create exactly THREE comprehensive image-generation prompts for: "${baseContext}".
      
      Variation Rule: Each prompt must have the same environment and outfit, but a significantly DIFFERENT pose (e.g., standing, sitting, action pose).
      
      Return ONLY a numbered list 1 to 3.` 
    }];
    
    if (images.length > 0) {
      parts.push({
        inlineData: {
          data: images[0].data.split(',')[1],
          mimeType: images[0].mimeType
        }
      });
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: { temperature: 0.7 }
      });

      const text = response.text || '';
      const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => /^\d+\.?\s+/.test(l))
        .map(l => l.replace(/^\d+\.?\s+/, ''));
      
      while (lines.length < 3) {
        lines.push(`${prompt} - Variation ${lines.length + 1}`);
      }
      
      return lines.slice(0, 3);
    } catch (error: any) {
      console.warn("Prompt orchestration failed, using base variations:", error);
      return [
        `${prompt} (Standing pose)`,
        `${prompt} (Dynamic pose)`,
        `${prompt} (Seated pose)`
      ];
    }
  }

  /**
   * Generates a SINGLE image using the specified model.
   */
  async generateImage(prompt: string, referenceImages: ReferenceImage[], aiTwinDescription?: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    
    // Attach reference images to anchor identity
    referenceImages.slice(0, 3).forEach(img => {
      parts.push({
        inlineData: {
          data: img.data.split(',')[1],
          mimeType: img.mimeType
        }
      });
    });

    const identityInst = referenceImages.length > 0 
      ? `STRICT REQUIREMENT: Maintain the subject's identity from the reference photos exactly. Do not change facial features, bone structure, or eye color.` 
      : `STRICT REQUIREMENT: Maintain the following identity: ${aiTwinDescription}.`;

    parts.push({ text: `${identityInst}\n\nSCENE PROMPT: ${prompt}` });

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("EMPTY_RESPONSE");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error("NO_IMAGE_PART");
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes('429') || msg.includes('limit') || msg.includes('quota')) {
        throw new Error("QUOTA_REACHED");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
