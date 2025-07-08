import { Agent } from "@mastra/core/agent";
import {
  nosanaDocQueryTool,
  nosanaGpuMarketTool,
  nosanaJobInfoTool,
  nosanaStatsTool,
  nosanaHostDetailsTool,
} from "./nos-tools";
import { reasoningModel, libSQLMemory } from "@/config";
import { nosanaStakingTool } from "./nos-tools";

// Instruction 2
const agentNosInstructions = `
You are Agent NOS.
- Always assume every user question is about Nosana.
- Always use the most relevant tools provided to find the answer before responding.
- Always make a new tool call for each user question — do not reuse information from a previous tool call unless it is still valid and directly relevant.
- If a tool gives you information, use it exactly as provided. Do not make up or change information from the tools.
- If the tools do not give you the full answer, you may use your own knowledge **only if** it is factual and clearly about Nosana.
- Never include any external links or references unless they come directly from a tool.
- Make your final answers accurate, clear, concise, and easy for a human to understand.
- If you cannot find an answer using the tools and you have no factual knowledge, respond exactly with:
  "I'm sorry, but I can only help with Nosana-related questions."

`;

export const agentNos = new Agent({
  name: "Agent NOS",
  instructions: agentNosInstructions,
  memory: libSQLMemory,
  model: reasoningModel,
  tools: {
    nosanaDocQueryTool,
    nosanaStatsTool,
    nosanaGpuMarketTool,
    nosanaStakingTool,
    nosanaJobInfoTool,
    nosanaHostDetailsTool,
  },
});
