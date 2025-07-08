import { Client, type ClientConfig } from "@nosana/sdk";

const SECONDS_PER_DAY = 24 * 60 * 60;

async function fetchStakingData() {
  const network = "mainnet";
  const rpcUrl =
    "https://rpc.ironforge.network/mainnet?apiKey=01HXY5BNJRYXRW05J6NE9YFQ3M";

  const clientConfig: Partial<ClientConfig> = {
    solana: {
      network: rpcUrl,
      priority_fee: 100000,
      dynamicPriorityFee: true,
      priorityFeeStrategy: "medium",
    },
  };

  const nosanaClient = new Client(network, undefined, clientConfig);

  try {
    const rewardsInfo = await nosanaClient.stake.getRewardsInfo();
    const poolInfo = await nosanaClient.stake.getPoolInfo();

    const totalXnos = parseFloat(rewardsInfo!.global.totalXnos);
    const poolEmission = poolInfo.emission.toNumber();

    return {
      totalXnos,
      poolEmission,
    };
  } catch (error) {
    console.error("Error fetching staking data:", error);
    return null;
  }
}

function calculateMultiplier(newUnstakeDays: number): number {
  const unstakeTime = newUnstakeDays * SECONDS_PER_DAY;
  const multiplierSeconds = (SECONDS_PER_DAY * 365) / 3; // 4 months
  const rawMultiplier = unstakeTime / multiplierSeconds + 1;
  return parseFloat(rawMultiplier.toFixed(2));
}

function calculateXNOS(nosAmount: number, unstakeDays: number): number {
  const unstakeTime = unstakeDays * SECONDS_PER_DAY;
  const multiplierSeconds = (SECONDS_PER_DAY * 365) / 3; // 4 months
  const multiplier = unstakeTime / multiplierSeconds + 1;
  const rawXNOS = nosAmount * multiplier;
  return Math.round(rawXNOS);
}

async function calculateExpectedDailyNOSRewards(
  xNOS: number
): Promise<number | null> {
  const stakingData = await fetchStakingData();

  if (!stakingData) {
    console.error("Could not fetch staking data for rewards calculation.");
    return null;
  }

  const { totalXnos, poolEmission } = stakingData;

  if (totalXnos === 0) {
    return 0;
  }

  const rewards =
    ((xNOS * 1e6) / (totalXnos + xNOS * 1e6)) *
    ((poolEmission / 1e6) * SECONDS_PER_DAY);
  return Math.max(0, rewards);
}

function calculateAPY(
  expectedRewards: number,
  nosAmount: number
): number | null {
  if (nosAmount === 0) {
    return null;
  }
  const apy = ((expectedRewards * 365) / nosAmount) * 100;
  return apy;
}

interface StakingMetrics {
  stakedNOS: number;
  multiplier: number;
  xNOS: number;
  expectedDailyNOSRewards: number | null;
  APY: number | null;
}

export async function calculateStakingMetrics(
  nosAmount: number,
  unstakePeriod: number
): Promise<StakingMetrics | null> {
  try {
    const multiplier = calculateMultiplier(unstakePeriod);
    const xNOS = calculateXNOS(nosAmount, unstakePeriod);
    const expectedDailyNOSRewards =
      await calculateExpectedDailyNOSRewards(xNOS);
    const apy =
      expectedDailyNOSRewards !== null
        ? calculateAPY(expectedDailyNOSRewards, nosAmount)
        : null;

    return {
      stakedNOS: nosAmount,
      multiplier: parseFloat(multiplier.toFixed(2)),
      xNOS: xNOS,
      expectedDailyNOSRewards:
        expectedDailyNOSRewards !== null
          ? parseFloat(expectedDailyNOSRewards.toFixed(2))
          : null,
      APY: apy !== null ? parseFloat(apy.toFixed(1)) : null,
    };
  } catch (error) {
    console.error("Error calculating staking metrics:", error);
    return null;
  }
}