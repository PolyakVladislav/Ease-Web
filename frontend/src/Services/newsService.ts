import CONFIG from "../config";
import api from "./axiosInstance";

export const fetchMedicalNews = async (query = "", page = 1, pageSize = 30) => {
  try {
    const healthQuery = query
      ? `${query} OR health OR medicine OR doctor OR disease OR medical`
      : "health";
    const response = await api.get(CONFIG.NEWS_API_URL, {
      withCredentials: false, 
      params: {
        q: healthQuery,
        language: "en",
        pageSize,
        page,
        apiKey: CONFIG.NEWS_API_KEY,
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching medical news:", error);
    return [];
  }
};
