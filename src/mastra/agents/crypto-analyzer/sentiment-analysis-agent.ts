import { Agent } from "@mastra/core/agent";
import { reasoningModel } from "@/config";
import { z } from "zod";
import { cryptoAnalyzerWorkflow } from "./workflows/crypto-analyzer-workflow";

const sentimentAnalysisInstructions = `
You are a sentiment analysis expert. Your task is to analyze the sentiment of news articles and provide a short-term and long-term outlook.
The output should be a JSON object with the following structure:
{
  "shortTerm": {
    "sentiment": "positive" | "negative" | "neutral",
    "rationale": "A brief explanation of the short-term sentiment."
  },
  "longTerm": {
    "sentiment": "positive" | "negative" | "neutral",
    "rationale": "A brief explanation of the long-term sentiment."
  }
}
`;

export const sentimentAnalysisAgent = new Agent({
  name: "sentiment-analysis-agent",
  instructions: sentimentAnalysisInstructions,
  model: reasoningModel,
});
