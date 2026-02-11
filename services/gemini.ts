import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizQuestion, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (difficulty: Difficulty): Promise<QuizQuestion[]> => {
  // Prompt ultra-otimizado para resposta rápida (3s ou menos)
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere 15 perguntas curtíssimas de quiz sobre Angola. JSON: [{question, options:[4], correctAnswer(0-3), curiosity, category}]. Respostas curtas, sem enrolação. Dificuldade: ${difficulty}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: Type.INTEGER },
            curiosity: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "curiosity", "category"]
        }
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text || '[]');
  } catch (e) {
    console.error("Failed to parse quiz questions", e);
    return [];
  }
};

export const getLearningAssistantResponse = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: "Você é um assistente educacional especialista em cultura, história e línguas de Angola. Forneça informações detalhadas, respeitosas e envolventes sobre províncias, figuras históricas como Njinga Mbandi e Agostinho Neto, e línguas nacionais."
    }
  });
  return response.text || "Desculpe, não consegui processar a sua pergunta.";
};

export const speakPronunciation = async (word: string, language: string) => {
  const prompt = `Say in ${language}: ${word}. Just the word clearly.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioData = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}