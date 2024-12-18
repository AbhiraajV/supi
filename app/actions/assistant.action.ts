'use server'

import { getOpenAIInstance } from "./openai.instance.action";

export const createAssistant = async ({name,instructions,vector_store_ids}:{name:string,instructions:string,vector_store_ids:string[]}) => {
    const openai = await getOpenAIInstance();
    const assistant = await openai.beta.assistants.create({
        name,
        instructions,
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
        tool_resources:{
            file_search:{
                vector_store_ids
            }
        }
    });
    
    return assistant;
}


export const getAssistant = async (assistantId:string) => {
    const openai = await getOpenAIInstance();
    return await openai.beta.assistants.retrieve(assistantId)
}

export const getAssistants = async (assistantIds: string[]) => {
    const assistantData = await Promise.all(
        assistantIds.map(async (id) => {
            try {
                return await getAssistant(id);
            } catch (error) {
                console.error(`Error retrieving assistant with ID ${id}:`, error);
                return null;
            }
        })
    );
    return assistantData.filter((data) => data !== null);
};