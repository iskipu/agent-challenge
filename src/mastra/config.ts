import dotenv from "dotenv";
import { createOllama, ollama } from "ollama-ai-provider";
import { MongoDBVector } from "@mastra/mongodb";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

dotenv.config();

export const modelName = process.env.MODEL_NAME_AT_ENDPOINT ?? "qwen3:0.6b ";
export const baseURL = process.env.API_BASE_URL ?? "http://127.0.0.1:11434";

export const reasoningModel = createOllama({ baseURL }).chat(modelName, {
  simulateStreaming: true,
});

export const embedModel = ollama.embedding("nomic-embed-text");

export const vectorStore = new MongoDBVector({
  uri: process.env.MONGO_URL!,
  dbName: "nosana_db",
});

await vectorStore.createIndex({
  indexName: "docs",
  dimension: 768,
});

export const libSQLMemory = new Memory({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
});
