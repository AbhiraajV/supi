'use server'
import OpenAI from "openai";
let openaiInstance: OpenAI | null = null;

export const getOpenAIInstance = async (): Promise<OpenAI> => {
  if (!openaiInstance) {
    
    openaiInstance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

  }
  return openaiInstance;
};
