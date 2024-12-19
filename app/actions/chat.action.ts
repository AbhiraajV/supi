import { getOpenAIInstance } from "./openai.instance.action"

export const createAThread = async () => (await (await getOpenAIInstance()).beta.threads.create()).id;


export const getMessagesInThread = async (threadId:string) => (await (await getOpenAIInstance()).beta.threads.messages.list(threadId)).data;

export const addMessageToThread = async (threadId:string,content:string) =>(await (await getOpenAIInstance()).beta.threads.messages
                                                                                                                    .create(threadId,{
                                                                                                                        role: 'user',
                                                                                                                        content
                                                                                                                    }))
export const deleteAThread = async (threadId:string) => (await (await getOpenAIInstance()).beta.threads.del(threadId)).deleted;

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
    return run.status
}