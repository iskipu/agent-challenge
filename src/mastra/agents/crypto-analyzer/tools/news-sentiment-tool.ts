import { createTool } from "@mastra/core";
import { z } from "zod";
import { sentimentAnalysisAgent } from "../sentiment-analysis-agent";

export const newsSentimentTool = createTool({
  id: "news-sentiment",
  description: "Gets news articles and performs sentiment analysis.",
  inputSchema: z.object({
    query: z.string().describe("The query to search for news articles."),
  }),
  outputSchema: z.string().describe("The query to search for news articles."),
  execute: async ({ context, mastra }) => {
    const { query } = context;
    // NOTE: You'll need to add your News API key to your .env file
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      throw new Error("NEWS_API_KEY is not set in the environment variables.");
    }
    const fromDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&from=${fromDate}&sortBy=popularity&apiKey=${newsApiKey}`
    );
    if (!newsResponse.ok) {
      throw new Error(`Failed to fetch news: ${newsResponse.statusText}`);
    }
    const newsData = await newsResponse.json();
    const articles = newsData.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
    }));
    if (!mastra) {
      throw new Error("Mastra instance is not available.");
    }
    const result = await sentimentAnalysisAgent.generate(
      `Analyze the sentiment of the following news articles and provide a short-term and long-term outlook: ${JSON.stringify(
        articles
      )}`
    );
    return result.text;
  },
});
