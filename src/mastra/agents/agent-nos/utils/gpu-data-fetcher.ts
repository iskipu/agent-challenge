import { Client, type Market } from "@nosana/sdk";

// Type definitions for the various API endpoints
interface ApiMarketInfo {
  address: string;
  name?: string;
  type?: string;
  client?: boolean;
}

interface RunningJobs {
  [marketAddress: string]: { running: number };
}

interface MarketStats {
  price: number;
}

const API_BASE = "https://dashboard.k8s.prd.nos.ci";

//  Fetches and processes GPU market data from the Nosana network.
export async function getGpuMarketData() {
  try {
    const sdk = new Client("mainnet"); // Initialize SDK with mainnet

    // Fetch all required data sources in parallel
    const [baseMarkets, apiMarkets, runningJobs, stats] = await Promise.all([
      sdk.jobs.allMarkets(),
      fetch(`${API_BASE}/api/markets`).then(
        (res) => res.json() as Promise<ApiMarketInfo[]>
      ),
      fetch(`${API_BASE}/api/jobs/running`).then(
        (res) => res.json() as Promise<RunningJobs>
      ),
      fetch(`${API_BASE}/api/stats`).then(
        (res) => res.json() as Promise<MarketStats>
      ),
    ]);

    const gpuData = baseMarkets
      .map((market: Market) => {
        const apiMarketInfo = apiMarkets.find(
          (m) => m.address === market.address.toString()
        );

        if (!apiMarketInfo || apiMarketInfo.client) {
          return null;
        }

        const jobPriceLamports = parseInt(String(market.jobPrice));
        const hourlyPrice = (jobPriceLamports / 1e6) * 3600 * stats.price * 1.1;

        const runningJobCount =
          runningJobs[market.address.toString()]?.running || 0;
        const availability =
          market.queueType === 1
            ? `${market.queue.length} / ${market.queue.length + runningJobCount} hosts`
            : `0 / ${runningJobCount} hosts`;

        return {
          gpu: apiMarketInfo.name || market.address.toString(),
          price: parseFloat(hourlyPrice.toFixed(3)), // Store as number for sorting
          availability: parseInt(availability.split("/")[0].trim()), // Store as number for sorting
          availabilityString: availability, // Keep original string for display
          link: `https://dashboard.nosana.com/markets/${market.address.toString()}`,
        };
      })
      .filter(Boolean) as {
      gpu: string;
      price: number;
      availability: number;
      availabilityString: string;
      link: string;
    }[]; // Add type assertion

    return gpuData;
  } catch (error) {
    console.error("Failed to generate GPU market data:", error);
    return []; // Return an empty array on failure
  }
}
