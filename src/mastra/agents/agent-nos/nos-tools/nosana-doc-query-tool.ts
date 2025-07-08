import { embedModel, reasoningModel, vectorStore } from "@/config";
import { createTool } from "@mastra/core/tools";
import { rerank } from "@mastra/rag";
import { embed } from "ai";
import { z } from "zod";

export const nosanaDocQueryTool = createTool({
  id: "nosana-query-tool",
  description:
    "Always use this tool to answer any question related to Nosana. This tool searches the official Nosana documentation for accurate information, instructions, and examples. Do not guess — always call this tool for Nosana-related queries.",

  inputSchema: z.object({
    queryText: z
      .string()
      .describe("A detailed query string to search within the Nosana docs."),
  }),
  outputSchema: z.object({
    results: z
      .array(
        z.object({
          relevanceScore: z
            .number()
            .describe("Relevance score for this document snippet."),
          source: z.string().describe("URL of the source document."),
          document: z
            .string()
            .describe("Snippet of text retrieved from the documentation."),
        })
      )
      .describe(
        "Reranked list of results with scores, sources, and content snippets."
      ),
    instruction: z
      .string()
      .describe("Guidelines you must always follow when using these results."),
  }),
  execute: async ({ context }) => {
    const queryResult = await rerankedQueryResult(context.queryText);
    return {
      results: queryResult,
      instruction: `Always follow these steps when using documents:
      1. Cite sources: At the end of your response, add a paragraph titled "Reference sources:" listing each unique URL in the order first cited.
      2. Use unique listings: Do not repeat a source more than once.
      3. Handle missing info: If the docs do not answer the query, reply clearly:
    "I’m sorry, but I couldn’t find any relevant information in the Nosana docs for your query."`,
    };
  },
});

async function rerankedQueryResult(queryText: string) {
  // Step 1: Embed the query text
  const { embedding: embeddedQuery } = await embed({
    model: embedModel,
    value: queryText,
  });

  // Step 2: Query top K results from vector store
  const queryResult = await vectorStore.query({
    indexName: "docs",
    queryVector: embeddedQuery,
    topK: 25,
  });

  // Step 3: Rerank the results
  const rerankedResult = await rerank(queryResult, queryText, reasoningModel, {
    queryEmbedding: embeddedQuery,
    topK: 12,
  });

  return rerankedResult.map((item) => ({
    relevanceScore: item.score,
    source: item.result.metadata?.source as string,
    document: item.result.document as string,
  }));
}