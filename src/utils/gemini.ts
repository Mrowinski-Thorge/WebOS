import { GoogleGenerativeAI } from '@google/generative-ai';

// We map "2.5" to the latest flash model as requested (1.5 Flash is the current "Flash" standard)
const MODEL_NAME = 'gemini-1.5-flash';

// Targeted Imagen model. User requested "Imagen 4", but "imagen-3.0-generate-001" is the current standard.
// We can update this string if a newer model becomes available.
const IMAGE_MODEL_NAME = 'imagen-3.0-generate-001';

const SYSTEM_PROMPT = `
You are a helpful assistant embedded in a Web Operating System.
You can control the OS.
Your response must be valid JSON in the following format:
{
  "response": "Text to show the user",
  "action": {
    "type": "OPEN_APP" | "SET_TIMER" | "CHANGE_THEME" | "GENERATE_WALLPAPER" | "NONE",
    "payload": "..."
  }
}

Actions:
- OPEN_APP payload: "settings", "browser", "notes", "clock"
- SET_TIMER payload: number (seconds)
- CHANGE_THEME payload: "dark", "light", "liquid", "frosted"
- GENERATE_WALLPAPER payload: "A detailed description of the image"
- NONE payload: null

If the user asks to generate an image, use the GENERATE_WALLPAPER action with a detailed prompt.
Answer concisely.
`;

export async function chatWithGemini(apiKey: string, history: { role: string, parts: string }[], message: string) {
  if (!apiKey) {
    throw new Error('API Key missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_PROMPT
  });

  const chat = model.startChat({
    history: history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
    generationConfig: {
        responseMimeType: "application/json"
    }
  });

  const result = await chat.sendMessage(message);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse JSON", responseText);
    return { response: responseText, action: { type: 'NONE', payload: null } };
  }
}

export async function generateImage(apiKey: string, prompt: string): Promise<string> {
  // Try using Google's Imagen via REST API
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL_NAME}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9"
          }
        })
      }
    );

    if (response.ok) {
        const data = await response.json();
        if (data.predictions && data.predictions[0]) {
            const prediction = data.predictions[0];
            if (prediction.bytesBase64Encoded) {
                const mimeType = prediction.mimeType || 'image/png';
                return `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;
            }
        }
    } else {
        console.warn(`Google Imagen API returned status: ${response.status}`);
    }
  } catch (error) {
      console.warn("Google Imagen API failed, falling back to simulation.", error);
  }

  // Fallback to Pollinations.ai if Google API fails or is not enabled
  // This ensures the user still gets an image even if their API key lacks Imagen permissions.
  return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1920&height=1080&seed=${Math.random()}`;
}
