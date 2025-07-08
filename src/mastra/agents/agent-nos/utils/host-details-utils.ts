function formatCountryName(countryCode: string): string {
  if (!countryCode) {
    return "-";
  }
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(countryCode) || countryCode;
  } catch (error) {
    console.error("Error formatting country code:", error);
    return countryCode;
  }
}

export async function getHostDetails(hostId: string): Promise<any | null> {
  const API_URL = `https://dashboard.k8s.prd.nos.ci/api/nodes/${hostId}/specs`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.error(`Error fetching host details: ${response.status} ${response.statusText}`);
      return null;
    }

    const hostData = await response.json();

    return {
      country: formatCountryName(hostData.country),
      gpus: hostData.gpus.map((gpu: any) => gpu.gpu),
      ram: `${hostData.ram} MB`,
      diskSpace: `${hostData.diskSpace} GB`,
      cpu: hostData.cpu,
    };
  } catch (error) {
    console.error("Error fetching host details:", error);
    return null;
  }
}