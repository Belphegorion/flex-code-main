import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "eventflex_";

export const cache = {
  // Store data with TTL (time to live) in milliseconds
  set: async (key, data, ttl = 5 * 60 * 1000) => {
    // Default 5 minutes
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  },

  // Retrieve data if not expired
  get: async (key) => {
    try {
      const itemJson = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!itemJson) return null;

      const item = JSON.parse(itemJson);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.ttl) {
        // Remove expired item
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  // Remove specific item
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error("Cache remove error:", error);
      return false;
    }
  },

  // Clear all cached items
  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  },
};

export default cache;
