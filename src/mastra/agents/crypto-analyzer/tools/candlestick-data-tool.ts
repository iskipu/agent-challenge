import { createTool } from "@mastra/core";
import { z } from "zod";

export const candlestickDataTool = createTool({
  id: "candlestick-data",
  description: "Gets candlestick data for a given crypto ticker.",
  inputSchema: z.object({
    symbol: z.string().describe("The crypto ticker symbol (e.g., BTCUSDT)."),
    interval: z
      .enum(["15m", "1h", "1d"])
      .describe("The interval for the candlestick data."),
    limit: z
      .number()
      .default(200)
      .describe("The number of candlesticks to retrieve."),
  }),
  outputSchema: z.object({
    candlesticks: z.array(z.any()).describe("The candlestick data."),
  }),
  execute: async ({ context }) => {
    const { symbol, interval, limit } = context;
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch candlestick data: ${response.statusText}`
      );
    }
    const candlesticks = await response.json();
    return { candlesticks };
  },
});
