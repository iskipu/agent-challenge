function formatTimestampToUTC(
  timestampInSeconds: number | undefined
): string | null {
  if (timestampInSeconds === undefined || timestampInSeconds === null) {
    return null;
  }
  const date = new Date(timestampInSeconds * 1000); // Convert seconds to milliseconds
  return date.toISOString().replace("T", " ").substring(0, 19);
}

function getJobStateString(stateVal: string | number): string {
  if (stateVal === "QUEUED" || stateVal === 0) return "QUEUED";
  if (stateVal === "RUNNING" || stateVal === 1) return "RUNNING";
  if (stateVal === "COMPLETED" || stateVal === 2) return "COMPLETED";
  if (stateVal === "STOPPED" || stateVal === 3) return "STOPPED";
  return "UNKNOWN";
}

function formatSecondsToReadable(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export async function fetchJobInfo(jobId: string): Promise<any | null> {
  const API_URL = `https://dashboard.k8s.prd.nos.ci/api/jobs/${jobId}`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.error(
        `Error fetching job info: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const jobData = await response.json();

    // Determine jobStatus based on API's jobStatus field
    const jobStatus =
      jobData.jobStatus === null ? "job not completed yet" : jobData.jobStatus;

    // Format timeEnd
    const formattedTimeEnd =
      jobData.timeEnd === 0
        ? "job not completed yet"
        : formatTimestampToUTC(jobData.timeEnd);

    // Calculate durationRan
    let durationRanSeconds: number | null = null;
    if (jobData.timeStart) {
      if (jobData.timeEnd === 0) {
        // Job is still running or not completed
        durationRanSeconds = Math.floor(Date.now() / 1000) - jobData.timeStart;
      } else {
        // Job has completed
        durationRanSeconds = jobData.timeEnd - jobData.timeStart;
      }
    }

    return {
      node: jobData.node,
      jobDefinition: jobData.jobDefinition,
      jobState: getJobStateString(jobData.state), // Renamed from jobStatus
      jobStatus: jobStatus, // New field based on API's jobStatus
      timeEnd: formattedTimeEnd,
      timeStart: formatTimestampToUTC(jobData.timeStart),
      timeout: formatSecondsToReadable(jobData.timeout), // Convert timeout to readable format
      durationRan:
        durationRanSeconds !== null
          ? formatSecondsToReadable(durationRanSeconds)
          : "-",
    };
  } catch (error) {
    console.error("Error fetching job info:", error);
    return null;
  }
}
