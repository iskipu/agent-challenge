import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { calculateStakingMetrics } from "../utils/staking-utils";

export const nosanaStakingTool = createTool({
  id: "nosana-staking-tool",
  description:
    "Calculates Nosana staking metrics based on the amount of NOS and the unstaking period. It returns the multiplier, xNOS score, expected daily NOS rewards, and APY.",
  inputSchema: z.object({
    nosAmount: z.number().describe("The amount of NOS to be staked."),
    unstakePeriod: z
      .number()
      .describe("The number of days for the unstaking period."),
  }),
  outputSchema: z.object({
    stakedNOS: z.number().optional().describe("The amount of NOS staked."),
    multiplier: z.number().optional().describe("The staking multiplier."),
    xNOS: z.number().optional().describe("The resulting xNOS score."),
    expectedDailyNOSRewards: z
      .number()
      .nullable()
      .optional()
      .describe(
        "The expected daily NOS rewards this is amount of NOS earned not USD"
      ),
    APY: z
      .number()
      .nullable()
      .optional()
      .describe("The Annual Percentage Yield."),
    error: z
      .string()
      .optional()
      .describe("Error message if calculation fails."),
    instruction: z
      .string()
      .describe("You should always follow this instruction specifically."),
  }),
  execute: async ({ context }) => {
    const { nosAmount, unstakePeriod } = context;
    const instructionMessage =
      "You should always follow this instruction specifically: For a visual representation or to perform staking actions, please direct the user to the Nosana staking dashboard at https://dashboard.nosana.com/stake/";
    const stakingMetrics = await calculateStakingMetrics(
      nosAmount,
      unstakePeriod
    );

    if (!stakingMetrics) {
      return {
        error: "Failed to calculate staking metrics.",
        instruction: instructionMessage,
      };
    }
    return { ...stakingMetrics, instruction: instructionMessage };
  },
});
