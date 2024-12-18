'use server'

import { createAssistant } from "./assistant.action";
import { __createSupiDb } from "./supi.action";
import { createAVectorStore } from "./vector-store.action";
export const createASupi = async ({userId,name,instructions}:{userId:number,name:string,instructions:string}) => {
    const vectorStoreId = await createAVectorStore({name})
    
    const assistantId = await createAssistant({name,instructions,vector_store_ids:[vectorStoreId]})
    
    const createdSupi = await __createSupiDb({userId,assistantId:assistantId.id,instruction:JSON.stringify({name,instructions})})
    return {...assistantId,supiId:createdSupi.id}
}