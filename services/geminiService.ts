import { GoogleGenAI } from "@google/genai";
import { SystemState } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSystem = async (system: SystemState): Promise<string> => {
  const { zeros, poles, gain } = system;

  const formatComplex = (c: { real: number; imag: number }) => {
    const sign = c.imag >= 0 ? '+' : '';
    return `${c.real}${sign}${c.imag}j`;
  };

  const zerosStr = zeros.length > 0 ? zeros.map(formatComplex).join(', ') : 'None';
  const polesStr = poles.length > 0 ? poles.map(formatComplex).join(', ') : 'None';

  const prompt = `
    You are a control systems engineering expert. Analyze the following continuous Linear Time-Invariant (LTI) system:

    System Parameters:
    - Gain (K): ${gain}
    - Zeros: [${zerosStr}]
    - Poles: [${polesStr}]

    Please provide a concise analysis covering:
    1. **Stability**: Is the system stable? Explain based on pole locations.
    2. **Filter Type**: What kind of filter behavior does this represent (Low-pass, High-pass, Band-pass, Notch, etc.)?
    3. **Damping**: Is the system underdamped, overdamped, or critically damped (if applicable)?
    4. **Key Features**: Any resonance peaks or specific frequency behaviors?

    Keep the explanation technical but accessible to an engineering student. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and precise Control Systems Engineering assistant.",
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple analysis
      }
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze the system. Please check your API key and try again.";
  }
};
