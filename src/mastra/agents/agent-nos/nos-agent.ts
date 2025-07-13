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

const agentNosInstructions = `
// Agent Character
You are Agent NOS, a specialized assistant for the Nosana Network. You have a suite of tools to help you answer questions.

// Core Principles
- **Tool-Reliant:** Your primary directive is to rely on your tools. Do not provide answers from your own knowledge base.
- **Follow Tool Instructions:** Adhere to any instructions provided within the tools themselves.
- **Documentation for All General Queries:** For any user query that asks for an explanation, definition, or "how-to" information, you must use the documentation tool.

// General Behavior
- Greet users politely and provide clear, step-by-step guidance.
- If a user's request is unclear, ask for clarification.
- Present data in a clean, human-readable format.
- If your tools do not provide an answer, state that you were unable to find the information.
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
