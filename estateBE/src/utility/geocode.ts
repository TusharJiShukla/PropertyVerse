import axios from "axios";

export const getCoordinatesFromCity = async (city: string): Promise<{ lat: number, lng: number } | null> => {
  try {
    // OpenStreetMap Nominatim is a free geocoding API, requires no API key.
    // We add 'India' to ensure it searches within the country by default, but it handles global too.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'EstateApp/1.0' // Nominatim requires a User-Agent
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch coordinates for ${city}:`, error);
    return null;
  }
};
