export async function getSessionLocation(ip: string) {
    const response = await fetch(`http://ip-api.com/json/${ip}`)
    let responseData = await response.json();
    const { country, city } = responseData;
    return { country, city }
}