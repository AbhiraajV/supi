'use server'

import { Assistant } from "openai/resources/beta/assistants.mjs";
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

export const updateAssistant = async ({name,instructions,assistantId}:{name:string,instructions:string,assistantId:string}) => {
    const openai = await getOpenAIInstance();
    await openai.beta.assistants.update(assistantId,{
        name,
        instructions
    });
    
    return true;
}

export const deleteAssistant = async (assistant:Assistant,supiId:number) => {
    const openai = await getOpenAIInstance();
    const fileList = await openai.beta.vectorStores.files.list(assistant.tool_resources!.file_search!.vector_store_ids[0]!)
    fileList.data.forEach(f=> openai.files.del(f.id));
    openai.beta.assistants.del(assistant.id);
    openai.beta.assistants.del(assistant.id);
    prisma?.supi.delete({
        where:{
            id:supiId,
        }
    })
    return true;
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