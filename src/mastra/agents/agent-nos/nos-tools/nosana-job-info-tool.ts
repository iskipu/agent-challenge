import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { fetchJobInfo } from "../utils/job-info-utils";

export const nosanaJobInfoTool = createTool({
  id: "nosana-job-info-tool",
  description:
    "Fetches and formats detailed information about a specific Nosana job.",
  inputSchema: z.object({
    jobId: z
      .string()
      .describe("The ID of the Nosana job to fetch information for."),
  }),
  outputSchema: z.object({
    node: z.string().describe("The node where the job ran."),
    jobDefinition: z.any().describe("The definition of the job."),
    jobState: z
      .string()
      .describe(
        "The current state of the job (e.g., QUEUED, RUNNING, COMPLETED)."
      ),
    jobStatus: z.string().describe("The status of the job."),
    timeEnd: z
      .string()
      .nullable()
      .describe(
        "The UTC timestamp when the job ended, or 'job not completed yet'."
      ),
    timeStart: z
      .string()
      .nullable()
      .describe("The UTC timestamp when the job started."),
    timeout: z
      .string()
      .describe("The timeout duration for the job in a human-readable format."),
    durationRan: z
      .string()
      .describe("The duration the job ran in a human-readable format."),
    error: z
      .string()
      .optional()
      .describe("Error message if fetching job info fails."),
    instruction: z
      .string()
      .describe("You must follow this instruction strictly."),
  }),
  execute: async ({ context }) => {
    const { jobId } = context;
    const jobInfo = await fetchJobInfo(jobId);

    const instructionMessage =
      "You must follow this instruction strictly: Always include links to the Nosana dashboard for job and host details when presenting information. Use the format: Job Link: [Job ID](https://dashboard.nosana.com/jobs/{jobaddress}) and Host Link: [Host ID](https://dashboard.nosana.com/host/{hostaddress})., incase if you are printing the job definition always print it in JSON format in a text block";

    if (!jobInfo) {
      return {
        error: `Failed to fetch job information for job ID: ${jobId}`,
        instruction: instructionMessage,
      };
    }
    return { ...jobInfo, instruction: instructionMessage };
  },
});
