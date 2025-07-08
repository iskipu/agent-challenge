import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getHostDetails } from "../utils/host-details-utils";

export const nosanaHostDetailsTool = createTool({
  id: "nosana-host-details-tool",
  description: "Fetches and formats detailed information about a specific Nosana host.",
  inputSchema: z.object({
    hostId: z.string().describe("The ID of the Nosana host to fetch information for."),
  }),
  outputSchema: z.object({
    country: z.string().describe("The country where the host is located."),
    gpus: z.array(z.string()).describe("An array of GPU names on the host."),
    ram: z.string().describe("The amount of RAM on the host (e.g., '16 MB')."),
    diskSpace: z.string().describe("The amount of disk space on the host (e.g., '500 GB')."),
    cpu: z.string().describe("The CPU name of the host."),
    error: z.string().optional().describe("Error message if fetching host details fails."),
    instruction: z.string().describe("You must follow this instruction strictly."),
  }),
  execute: async ({ context }) => {
    const { hostId } = context;
    const hostDetails = await getHostDetails(hostId);

    const instructionMessage = "You must follow this instruction strictly: Always include a link to the Nosana dashboard for host details when presenting information. Use the format: Host Link: https://dashboard.nosana.com/host/{hostaddress}.";

    if (!hostDetails) {
      return { error: `Failed to fetch host details for host ID: ${hostId}`, instruction: instructionMessage };
    }
    return { ...hostDetails, instruction: instructionMessage };
  },
});