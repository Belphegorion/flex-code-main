// Simple in-memory cache with TTL
class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttl = 300000) { // Default 5 minutes
    const expiry = Date.now() + ttl;
    this.store.set(key, { value, expiry });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiry) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new Cache();

// Cleanup expired entries every 10 minutes
setInterval(() => cache.cleanup(), 600000);

export default cache;
