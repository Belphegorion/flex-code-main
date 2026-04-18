import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import cache from "../utils/cache";

// Get base URL from environment or default to localhost for development
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.195.237.232:3000";
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Cache GET requests for 5 minutes by default
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Add caching for GET requests
  if (config.method === "get") {
    const cachedData = await cache.get(config.url.replace(API_URL, ""));
    if (cachedData) {
      // Return cached data directly
      return Promise.resolve({
        data: cachedData,
      });
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    // Cache successful GET responses
    if (res.config.method === "get" && res.data) {
      cache.set(res.config.url.replace(API_URL, ""), res.data);
    }
    return res.data;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = res.data;
        await AsyncStorage.setItem("accessToken", accessToken);
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

export default api;
