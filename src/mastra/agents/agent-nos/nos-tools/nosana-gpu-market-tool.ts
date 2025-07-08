import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getGpuMarketData } from "../utils/gpu-data-fetcher";

export const nosanaGpuMarketTool = createTool({
  id: "nosana-gpu-market-tool",
  description:
    "Fetches and sorts Nosana GPU market data by price or availability.",
  inputSchema: z.object({
    sortBy: z
      .enum(["price", "availability"])
      .default("price")
      .describe("Sort by 'price' (default) or 'availability'."),
    sortOrder: z
      .enum(["asc", "desc"])
      .default("asc")
      .describe(
        "Sort order: 'asc' (low to high, default) or 'desc' (high to low)."
      ),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        gpu: z.string(),
        price: z.number().describe("Price in USD/hr."),
        availability: z.number(),
        availabilityString: z.string(),
        link: z
          .string()
          .url()
          .describe("Link to the GPU market on Nosana dashboard."),
      })
    ),
    instruction: z
      .string()
      .describe("Instruction on how to format the GPU market data."),
  }),
  execute: async ({ context }) => {
    const { sortBy, sortOrder } = context;
    const gpuData = await getGpuMarketData();

    const sortedData = gpuData.sort((a, b) => {
      let compareA: number;
      let compareB: number;

      if (sortBy === "price") {
        compareA = a.price;
        compareB = b.price;
      } else {
        // sortBy === "availability"
        compareA = a.availability;
        compareB = b.availability;
      }

      if (sortOrder === "asc") {
        return compareA - compareB;
      } else {
        // sortOrder === "desc"
        return compareB - compareA;
      }
    });

    return {
      results: sortedData,
      instruction:
        "When presenting GPU information, always format the 'gpu' field as a Markdown hyperlink using the 'link' field. For example: [GPU_Name](dashboard_link). Also, always specify that the price is in USD/hr.",
    };
  },
});