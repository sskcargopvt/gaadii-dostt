
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Calculates a logistics estimate for transporting materials using Gemini.
 * Returns both the data and the source of the data ('ai' or 'fallback').
 */
export const getLoadEstimation = async (material: string, weight: number, distance: number) => {
  const fallbackData = {
    truckType: weight > 15 ? "Heavy Duty Trailer" : "Multi-Axle Truck",
    estimatedCost: Math.round(distance * 40 * (weight / 10)),
    fuelEstimate: Math.round(distance * 15),
    tollEstimate: Math.round(distance * 5),
    reasoning: "" // Reasoning will be set based on the failure type.
  };

  if (!process.env.API_KEY) {
    console.warn("Gemini API key not found. Using fallback estimation.");
    fallbackData.reasoning = "Live AI analysis is unavailable. This is a standard estimate based on industry averages.";
    return { data: fallbackData, source: 'fallback' };
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Calculate a logistics estimate for transporting ${weight} tons of ${material} over a distance of ${distance} km in India. 
      Return the data in JSON format with estimated values for: 
      - Recommended truck type (truckType)
      - Total estimated cost in INR (estimatedCost)
      - Fuel estimate in INR (fuelEstimate)
      - Toll estimate in INR (tollEstimate)
      - A brief reasoning for the truck type and cost (reasoning).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            truckType: { type: Type.STRING },
            estimatedCost: { type: Type.NUMBER },
            fuelEstimate: { type: Type.NUMBER },
            tollEstimate: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["truckType", "estimatedCost", "fuelEstimate", "tollEstimate", "reasoning"]
        }
      }
    });

    const text = response.text || '{}';
    return { data: JSON.parse(text), source: 'ai' };
  } catch (error) {
    console.error("Gemini API Error:", error);
    fallbackData.reasoning = "Could not connect to the AI model due to an API error. This is a standard estimate based on industry averages.";
    return { data: fallbackData, source: 'fallback' };
  }
};
