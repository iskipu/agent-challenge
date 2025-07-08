import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const nosanaStatsTool = createTool({
  id: "nosana-stats-tool",
  description:
    "This tool helps to get Price of NOS, Number of People staked in NOS etc.., Basically every stat regarding NOS",
  inputSchema: z.object({}),
  outputSchema: z.object({
    summary: z.object({
      stakers: z.string().describe("Number of stakers, formatted with commas"),
      usdValueStaked: z
        .string()
        .describe(
          "Total USD value staked, formatted with dollar sign and commas"
        ),
      marketCap: z
        .string()
        .describe(
          "Current NOS market cap, formatted with dollar sign and commas"
        ),
      price: z.string().describe("Current NOS price with two decimals"),
      dailyPriceChange: z
        .string()
        .describe("Daily price change percentage with sign and two decimals"),
    }),
    raw: z.object({
      date: z.string(),
      usdValueStaked: z.string(),
      nosStaked: z.string(),
      totalXNosStaked: z.string(),
      stakers: z.number(),
      price: z.number(),
      marketCap: z.number(),
      dailyVolume: z.number(),
      totalSupply: z.number(),
      circulatingSupply: z.number(),
      fullyDilutedMarketCap: z.number(),
      dailyPriceChange: z.number(),
    }),
    instruction: z
      .string()
      .describe("You must follow this instruction specifically."),
  }),
  execute: async () => {
    const res = await fetch("https://dashboard.k8s.prd.nos.ci/api/stats/");
    const data = await res.json();

    // Format numbers
    const fmt = (num: number) =>
      Number(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
    const fmtFloat = (num: number, digits = 2) => Number(num).toFixed(digits);
    const summary = {
      stakers: fmt(data.stakers),
      usdValueStaked: `${fmt(data.usdValueStaked)}`,
      marketCap: `${fmt(data.marketCap)}`,
      price: `${fmtFloat(data.price)}`,
      dailyPriceChange: `${data.dailyPriceChange >= 0 ? "+" : ""}${fmtFloat(data.dailyPriceChange)}%`,
    };

    const instructionMessage = "You must follow this instruction specifically: For the latest network data, direct the user to scroll to the 'Network Summary' section on https://nosana.com/.";

    return {
      summary,
      raw: {
        date: data.date,
        usdValueStaked: data.usdValueStaked,
        nosStaked: data.nosStaked,
        totalXNosStaked: data.totalXNosStaked,
        stakers: data.stakers,
        price: data.price,
        marketCap: data.marketCap,
        dailyVolume: data.dailyVolume,
        totalSupply: data.totalSupply,
        circulatingSupply: data.circulatingSupply,
        fullyDilutedMarketCap: data.fullyDilutedMarketCap,
        dailyPriceChange: data.dailyPriceChange,
      },
      instruction: instructionMessage,
    };
  },
});
