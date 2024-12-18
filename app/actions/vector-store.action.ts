'use server'

import { getOpenAIInstance } from "./openai.instance.action"
import fs from 'fs';

export const createAVectorStore = async ({name}:{name:string}) => {
    const openai = await getOpenAIInstance();
    const vectorStore = await openai.beta.vectorStores.create({
        name
    });
    return vectorStore.id;
}

import path from "path";
import { VectorStoreFileBatch } from "openai/resources/beta/vector-stores/file-batches.mjs";
export const uploadToVectorStore = async (
  files: File[],
  vectorStoreId: string
): Promise<VectorStoreFileBatch> => {
  const openai = await getOpenAIInstance();

  const baseDir = `/public/${vectorStoreId}`;
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true }); 
  }

  const fileStreams = await Promise.all(
    files.map(async (file) => {
      const tempPath = path.join(baseDir, file.name);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
      return fs.createReadStream(tempPath);
    })
  );
  return await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
    files: fileStreams,
  });
};
export const pollVS = async (vectorStoreId:string,batchId:string) => {
  const openai = await getOpenAIInstance();

  return openai.beta.vectorStores.fileBatches.poll(vectorStoreId,batchId); 
}

export const retrieveVSFiles = async (vsId: string) => {
  const openai = await getOpenAIInstance();
  const files = await openai.beta.vectorStores.files.list(vsId);
  const retrievedFiles = await Promise.all(
    files.data.map((f) => openai.files.retrieve(f.id))
  );
  return retrievedFiles.map((file) => ({filename:file.filename,bytes:file.bytes}));
};
