import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { candlestickDataTool, newsSentimentTool } from "../tools";

const formatTickerSymbol = createStep({
  id: "format-ticker-symbol",
  inputSchema: z.object({
    ticker: z.string(),
  }),
  outputSchema: z.object({
    formattedTicker: z.string(),
    originalTicker: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { ticker } = inputData;
    const formattedTicker = `${ticker.toUpperCase()}USDT`;
    return { formattedTicker, originalTicker: ticker };
  },
});

const fetch15MinCandlestickDataStep = createStep({
  id: "fetch-15min-candlestick-data",
  inputSchema: z.object({
    formattedTicker: z.string(),
    originalTicker: z.string(),
  }),
  outputSchema: z.object({ candlestickData15m: z.array(z.any()) }),
  execute: async ({ inputData, runtimeContext }) => {
    const { formattedTicker } = inputData;
    const { candlesticks } = await candlestickDataTool.execute({
      context: { symbol: formattedTicker, interval: "15m", limit: 200 },
      runtimeContext,
    });
    return {
      candlestickData15m: candlesticks.map((c: any) => ({
        ...c,
        interval: "15m",
      })),
    };
  },
});

const fetch1HourCandlestickDataStep = createStep({
  id: "fetch-1h-candlestick-data",
  inputSchema: z.object({
    formattedTicker: z.string(),
    originalTicker: z.string(),
  }),
  outputSchema: z.object({ candlestickData1h: z.array(z.any()) }),
  execute: async ({ inputData, runtimeContext }) => {
    const { formattedTicker } = inputData;
    const { candlesticks } = await candlestickDataTool.execute({
      context: { symbol: formattedTicker, interval: "1h", limit: 200 },
      runtimeContext,
    });
    return {
      candlestickData1h: candlesticks.map((c: any) => ({
        ...c,
        interval: "1h",
      })),
    };
  },
});

const fetch1DayCandlestickDataStep = createStep({
  id: "fetch-1d-candlestick-data",
  inputSchema: z.object({
    formattedTicker: z.string(),
    originalTicker: z.string(),
  }),
  outputSchema: z.object({ candlestickData1d: z.array(z.any()) }),
  execute: async ({ inputData, runtimeContext }) => {
    const { formattedTicker } = inputData;
    const { candlesticks } = await candlestickDataTool.execute({
      context: { symbol: formattedTicker, interval: "1d", limit: 200 },
      runtimeContext,
    });
    return {
      candlestickData1d: candlesticks.map((c: any) => ({
        ...c,
        interval: "1d",
      })),
    };
  },
});

const fetchNewsAndSentimentStep = createStep({
  id: "fetch-news-and-sentiment",
  inputSchema: z.object({
    formattedTicker: z.string(),
    originalTicker: z.string(),
  }),
  outputSchema: z.object({ sentimentAnalysis: z.any() }),
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const { originalTicker } = inputData;
    if (!mastra) {
      throw new Error("Mastra instance is not available.");
    }

    const newsSummary = await newsSentimentTool.execute({
      context: { query: `${originalTicker} crypto OR Bitcoin OR Coindesk` },
      mastra: mastra,
      runtimeContext,
    });
    return { sentimentAnalysis: newsSummary };
  },
});

export const cryptoAnalyzerWorkflow = createWorkflow({
  id: "crypto-analyzer",
  description:
    "Analyzes cryptocurrency data and provides trading recommendations.",
  inputSchema: z.object({
    ticker: z.string().describe("The crypto ticker symbol (e.g., ETH)."),
  }),
  outputSchema: z.object({
    analysisResult: z
      .array(z.string())
      .describe("Array of candlestick data for 15m, 1hour and 1day"),
    sentimentAnalysis: z
      .string()
      .describe("Sentiment analysis from the latest crypto news articles."),
  }),
})
  .then(formatTickerSymbol)
  .parallel([
    fetch15MinCandlestickDataStep,
    fetch1HourCandlestickDataStep,
    fetch1DayCandlestickDataStep,
    fetchNewsAndSentimentStep,
  ])
  .map(async ({ getStepResult }) => {
    const candlestickData15m = (
      await Promise.resolve(getStepResult(fetch15MinCandlestickDataStep))
    ).candlestickData15m;
    const candlestickData1h = (
      await Promise.resolve(getStepResult(fetch1HourCandlestickDataStep))
    ).candlestickData1h;
    const candlestickData1d = (
      await Promise.resolve(getStepResult(fetch1DayCandlestickDataStep))
    ).candlestickData1d;

    const candlestickData = [
      ...candlestickData15m,
      ...candlestickData1h,
      ...candlestickData1d,
    ];

    const sentimentAnalysis = (
      await Promise.resolve(getStepResult(fetchNewsAndSentimentStep))
    ).sentimentAnalysis;
    return { candlestickData, sentimentAnalysis };
  })
  .commit();
