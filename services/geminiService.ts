
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const typeTranslation: Record<string, string> = {
  'Anel': 'Ring',
  'Pulseira': 'Bracelet',
  'Colar': 'Necklace',
  'Brincos': 'Earrings'
};

const getEffectiveApiKey = () => {
  return localStorage.getItem('LUMINA_API_KEY') || process.env.API_KEY || "";
};

export const generateEditorialPrompt = async (
  jewelryTypes: string[],
  settings: any,
  language: 'pt' | 'en',
  aspectRatio: string,
  additionalContext: string = ""
): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const englishTypes = jewelryTypes.map(t => typeTranslation[t] || t);
  
  const isBanner = aspectRatio === '16:9';
  const bannerInstruction = isBanner 
    ? `LAYOUT: Horizontal High-End Commercial Banner. 
       COMPOSITION: Professional advertisement photography layout. The model must be in a sophisticated pose specifically designed to showcase and highlight the ${englishTypes.join(", ")}. 
       FOCUS: Poses should be elegant (e.g., hand near face for rings/earrings, neck elongated for necklaces). 
       STRICT RULE: Absolutely NO TEXT, NO LOGOS, NO GRAPHICS. Pure photography.`
    : "";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a hyper-realistic high-end commercial photography prompt for jewelry. 
    Product: ${englishTypes.join(", ")}. 
    Model Details: ${settings.gender}, ${settings.ethnicity}, ${settings.ageRange}. 
    Style: ${settings.editorialStyle}.
    Context: ${additionalContext}
    ${bannerInstruction}
    Requirements: 
    1. Luxury magazine editorial style (Vogue/Cartier style). 
    2. Focus on the physical jewelry pieces with macro detail and perfect focus.
    3. Ensure jewelry fits the body perfectly (rings snugly on fingers, necklaces following neck contours).
    4. Soft professional studio lighting that highlights metal luster and gemstone brilliance.
    5. High-fidelity craftsmanship preservation. 
    6. Extremely clean composition, no watermarks, no text.
    
    CRITICAL: The final response must be written in ${language === 'pt' ? 'Portuguese' : 'English'}.
    The response must be only the prompt text.`,
    config: {
      thinkingConfig: { thinkingBudget: 4096 }
    }
  });
  return response.text || "";
};

export const generateJewelryImage = async (
  prompt: string,
  jewelryItems: { base64: string; type: string }[],
  modelBase64: string | undefined,
  aspectRatio: "1:1" | "9:16" | "16:9" | "4:5"
): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const apiRatio = aspectRatio === '4:5' ? '3:4' : aspectRatio;

  const jewelryParts = jewelryItems.map(item => ({
    inlineData: {
      mimeType: 'image/png',
      data: item.base64
    }
  }));

  const modelPart = modelBase64 ? [{
    inlineData: {
      mimeType: 'image/png',
      data: modelBase64
    }
  }] : [];

  const englishTypes = jewelryItems.map(i => typeTranslation[i.type] || i.type);

  const textPart = {
    text: `ULTRA-PREMIUM RETOUCHING & COMPOSITION:
    1. ABSOLUTE FIDELITY: Use the provided jewelry images as the ONLY reference. Keep every stone and curve identical.
    2. SEAMLESS INTEGRATION: The jewelry must look physically present on the skin. Natural shadows, realistic skin pressure, and perfect reflections of the environment on the metal.
    3. HIGH-END FINISH: 8k resolution look, professional color grading.
    4. ADVERTISEMENT FOR: ${englishTypes.join(", ")}.
    ${prompt}
    
    NO LOGOS, NO TEXT. The final image must be indistinguishable from a real luxury photograph.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [...jewelryParts, ...modelPart, textPart]
    },
    config: {
      imageConfig: {
        aspectRatio: apiRatio as any,
        imageSize: "2K"
      }
    }
  });

  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  if (!imageUrl) throw new Error("Failed to generate image.");
  return imageUrl;
};

export const generateJewelryVideo = async (
  imagePrompt: string,
  baseImageBase64: string
): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic high-end jewelry commercial. Slow macro panning and gentle bokeh shifts. Focus on the glimmer of the jewels. Elegant movements. ${imagePrompt}. No text.`,
    image: {
      imageBytes: baseImageBase64.split(',')[1],
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const downloadResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await downloadResponse.blob();
  return URL.createObjectURL(blob);
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'test',
    });
    return true;
  } catch (e) {
    return false;
  }
};
