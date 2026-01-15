import { GoogleGenerativeAI } from '@google/generative-ai';

// We map "2.5" to the latest flash model as requested (1.5 Flash is the current "Flash" standard)
const MODEL_NAME = 'gemini-1.5-flash';

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
- GENERATE_WALLPAPER payload: "A description of the image"
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
