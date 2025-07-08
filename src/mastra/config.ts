import dotenv from "dotenv";
import { createOllama } from "ollama-ai-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { MongoDBVector } from "@mastra/mongodb";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

dotenv.config();

export const modelName = process.env.MODEL_NAME_AT_ENDPOINT ?? "qwen3:0.6b ";
export const baseURL = process.env.API_BASE_URL ?? "http://127.0.0.1:11434";
export const google_api_key = process.env.GEMINI_API_KEY;

export const reasoningModel = createOllama({ baseURL }).chat(modelName, {
  simulateStreaming: true,
});

const google = createGoogleGenerativeAI({
  apiKey: google_api_key,
});

export const embedModel = google.textEmbeddingModel("text-embedding-004");

export const vectorStore = new MongoDBVector({
  uri: process.env.MONGO_URL!,
  dbName: "nosana",
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
