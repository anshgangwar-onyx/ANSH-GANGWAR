
import { GoogleGenAI } from "@google/genai";
import { RESUME_PARSER_PROMPT, REPORT_GENERATOR_PROMPT } from "../constants";
import { ResumeData, FinalReport } from "../types";

export const getGeminiClient = () => {
  // Always fetch the latest key from process.env to ensure freshness
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseResume = async (text: string): Promise<ResumeData> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${RESUME_PARSER_PROMPT}\n\nResume Text:\n${text}`,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse resume JSON", e);
    throw e;
  }
};

export const generateFinalReport = async (resume: ResumeData, history: {question: string, answer: string}[]): Promise<FinalReport> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: REPORT_GENERATOR_PROMPT(resume, history),
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to generate report JSON", e);
    throw e;
  }
};

// Audio Helpers
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
