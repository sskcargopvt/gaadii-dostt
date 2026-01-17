
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client using the API key directly from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calculates a logistics estimate for transporting materials using Gemini 3 Pro.
 * Gemini 3 Pro is selected for its superior reasoning capabilities in logistics and STEM tasks.
 */
export const getLoadEstimation = async (material: string, weight: number, distance: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Calculate a logistics estimate for transporting ${weight} tons of ${material} over a distance of ${distance} km in India. 
      Return the data in JSON format with estimated values for: 
      - Recommended truck type
      - Total estimated cost (in INR)
      - Fuel estimate (in INR)
      - Toll estimate (in INR)
      - Reasoning for the truck type.`,
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
          required: ["truckType", "estimatedCost", "fuelEstimate", "tollEstimate"]
        }
      }
    });

    // Access the text property directly as per latest SDK documentation.
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback static calculation if API fails
    return {
      truckType: weight > 15 ? "Heavy Duty Trailer" : "Multi-Axle Truck",
      estimatedCost: distance * 40 * (weight / 10),
      fuelEstimate: distance * 15,
      tollEstimate: distance * 5,
      reasoning: "Estimated based on standard Indian logistics rates."
    };
  }
};
