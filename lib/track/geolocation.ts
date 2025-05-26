export async function getGeolocation(ip: string) {
  try {
    // TODO: use a more accurate geolocation service
    const response = await fetch(`https://ip-api.com/json/${ip}`);
    const data = await response.json();
    console.log("location", data);
    return data;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}
