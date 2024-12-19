'use server'
import { Message } from "openai/resources/beta/threads/messages.mjs";
import { getOpenAIInstance } from "./openai.instance.action"
import { getAssistant } from "./assistant.action";
import { retrieveVSFiles } from "./vector-store.action";

export const createAThread = async () => {
    const openai = await getOpenAIInstance()
    const tid = await openai.beta.threads.create();
    return tid.id;
}
export const getMessagesInThread = async (threadId: string): Promise<Message[]> => {
    const openAIInstance = await getOpenAIInstance();
    const response = await openAIInstance.beta.threads.messages.list(threadId);
    // Ensure the data is JSON-serializable before returning
    return JSON.parse(JSON.stringify(response.data));
};

export const addMessageToThread = async (threadId: string, content: string): Promise<Message> => {
    const openAIInstance = await getOpenAIInstance();
    const response = await openAIInstance.beta.threads.messages.create(threadId, {
        role: 'user',
        content,
    });
    // Ensure the data is JSON-serializable before returning
    return JSON.parse(JSON.stringify(response));
};

export const deleteAThread = async (threadId: string): Promise<boolean> => {
    const openAIInstance = await getOpenAIInstance();
    const response = await openAIInstance.beta.threads.del(threadId);
    // Ensure the result is JSON-serializable
    return !!response.deleted;
};

export const runThread = async (threadId:string,assistantId:string) => {
    const openai = await getOpenAIInstance();
    
    const run = await openai.beta.threads.runs.create(threadId,{  
        assistant_id:assistantId,
    })
   
    return run.id;
}

export const checkRunStatus = async (threadId:string,runId:string):Promise<"queued" | "in_progress" | "requires_action" | "cancelling" | "cancelled" | "failed" | "completed" | "incomplete" | "expired"> => {
    const openai = await getOpenAIInstance();
    const run = await openai.beta.threads.runs.poll(threadId,runId);
    console.log({run:run.usage})
    return run.status
}