import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { vectorStore } from "@/config";
import { agentNos } from "@/agents/agent-nos/nos-agent";
import { cryptoAnalyzerWorkflow } from "./agents/crypto-analyzer/workflows/crypto-analyzer-workflow";
import { cryptoAnalyzerAgent } from "./agents/crypto-analyzer/crypto-analyzer-agent";
import { sentimentAnalysisAgent } from "./agents/crypto-analyzer/sentiment-analysis-agent";

export const mastra = new Mastra({
  vectors: {
    vectorStore,
  },
  agents: { agentNos, cryptoAnalyzerAgent },
  workflows: { cryptoAnalyzerWorkflow },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    port: 8080,
    timeout: 10000,
  },
});
