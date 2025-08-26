// سیستم کش‌بندی هوشمند با LRU و TTL
class SmartCache {
  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMs;
    this.hitCount = 0;
    this.missCount = 0;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.missCount++;
      return null;
    }

    // بررسی انقضای TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.missCount++;
      return null;
    }

    // به‌روزرسانی زمان دسترسی برای LRU
    this.accessTimes.set(key, Date.now());
    this.hitCount++;
    return item.data;
  }

  set(key, data) {
    // حذف قدیمی‌ترین آیتم در صورت پر بودن کش
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [k, time] of this.accessTimes.entries()) {
        if (time < oldestTime) {
          oldestTime = time;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessTimes.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now() });
    this.accessTimes.set(key, Date.now());
  }

  has(key) {
    const item = this.cache.get(key);
    return item && (Date.now() - item.timestamp <= this.ttl);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? Math.round((this.hitCount / total) * 100) : 0,
      totalRequests: total,
      hitCount: this.hitCount,
      missCount: this.missCount
    };
  }
}

// Cache instances برای موجودیت‌های مختلف
const caches = {
  cases: new SmartCache(50, 10 * 60 * 1000), // ۱۰ دقیقه TTL
  resources: new SmartCache(30, 15 * 60 * 1000), // ۱۵ دقیقه TTL  
  quizResults: new SmartCache(20, 5 * 60 * 1000), // ۵ دقیقه TTL
  userProgress: new SmartCache(10, 2 * 60 * 1000), // ۲ دقیقه TTL
  conversations: new SmartCache(15, 8 * 60 * 1000) // ۸ دقیقه TTL
};

// Helper functions
export const getCachedData = (type, key) => {
  return caches[type]?.get(key) || null;
};

export const setCachedData = (type, key, data) => {
  if (caches[type]) {
    caches[type].set(key, data);
  }
};

export const hasCachedData = (type, key) => {
  return caches[type]?.has(key) || false;
};

export const clearCache = (type) => {
  if (type && caches[type]) {
    caches[type].clear();
  } else {
    // پاک کردن همه کش‌ها
    Object.values(caches).forEach(cache => cache.clear());
  }
};

export const getCacheStats = () => {
  const stats = {};
  for (const [type, cache] of Object.entries(caches)) {
    stats[type] = cache.getStats();
  }
  return stats;
};

// Hook برای استفاده آسان در کامپوننت‌ها
export const useCachedData = (type, key, fetchFunction) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      // بررسی کش ابتدا
      const cached = getCachedData(type, key);
      if (cached && mounted) {
        setData(cached);
        setLoading(false);
        return;
      }

      // بارگذاری از API
      setLoading(true);
      try {
        const result = await fetchFunction();
        if (mounted) {
          setData(result);
          setCachedData(type, key, result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [type, key, fetchFunction]);

  return { data, loading, error };
};