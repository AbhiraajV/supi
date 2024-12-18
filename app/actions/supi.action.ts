'use server'
import prisma from "@/prisma/prisma"
import { getAssistants } from "./assistant.action"
export const getSupis = async (userId:number) => {
    const supis = await prisma?.supi.findMany({
        where:{
            userId:userId
        },
        select:{
            assistantId:true,
            id:true
        }
    })
    const assistants = await getAssistants(supis.map(supi=>supi.assistantId));
    const assistantsWithSupiId = assistants.map(a=>{
        return {...a,supiId:supis.find(s=>s.assistantId === a.id)?.id}
    })
    return assistantsWithSupiId;   
}

export const __createSupiDb = async ({userId,assistantId,instruction}:{userId:number,assistantId:string,instruction:string}) => {
    return await prisma.supi.create({
        data:{
            assistantId,
            userId,
            instruction
        }
    })
}