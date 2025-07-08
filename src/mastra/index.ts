import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { vectorStore } from "@/config";
import { agentNos } from "@/agents/agent-nos/nos-agent";

export const mastra = new Mastra({
  vectors: {
    vectorStore,
  },
  agents: { agentNos },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    port: 8080,
    timeout: 10000,
  },
});
