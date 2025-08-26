// مانیتور عملکرد و بهینه‌ساز خودکار
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      cacheHits: 0,
      cacheMisses: 0,
      slowQueries: [],
      errorCount: 0
    };
    this.thresholds = {
      maxRenderTime: 16, // 60fps
      maxMemoryUsage: 100, // MB
      maxSlowQueryTime: 2000 // 2 seconds
    };
  }

  // ثبت زمان رندر کامپوننت
  recordRenderTime(componentName, duration) {
    this.metrics.renderTimes.push({
      component: componentName,
      duration,
      timestamp: Date.now()
    });

    // نگهداری آخرین ۵۰ رکورد
    if (this.metrics.renderTimes.length > 50) {
      this.metrics.renderTimes = this.metrics.renderTimes.slice(-50);
    }

    // هشدار در صورت کندی
    if (duration > this.thresholds.maxRenderTime) {
      console.warn(`Slow render detected: ${componentName} took ${duration}ms`);
    }
  }

  // ثبت مصرف حافظه
  recordMemoryUsage() {
    if (performance.memory) {
      const usage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      this.metrics.memoryUsage.push({
        usage,
        timestamp: Date.now()
      });

      // نگهداری آخرین ۳۰ رکورد
      if (this.metrics.memoryUsage.length > 30) {
        this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-30);
      }

      if (usage > this.thresholds.maxMemoryUsage) {
        console.warn(`High memory usage detected: ${usage}MB`);
        this.suggestOptimizations();
      }
    }
  }

  // ثبت کوئری کند
  recordSlowQuery(query, duration) {
    this.metrics.slowQueries.push({
      query,
      duration,
      timestamp: Date.now()
    });

    if (this.metrics.slowQueries.length > 20) {
      this.metrics.slowQueries = this.metrics.slowQueries.slice(-20);
    }
  }

  // ثبت عملکرد کش
  recordCacheEvent(isHit) {
    if (isHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  // پیشنهاد بهینه‌سازی‌ها
  suggestOptimizations() {
    const suggestions = [];

    // بررسی کارایی کش
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheEfficiency = totalCacheRequests > 0 
      ? (this.metrics.cacheHits / totalCacheRequests) * 100 
      : 0;

    if (cacheEfficiency < 60) {
      suggestions.push("Cache efficiency is low. Consider increasing cache size or TTL.");
    }

    // بررسی کامپوننت‌های کند
    const slowComponents = this.metrics.renderTimes
      .filter(rt => rt.duration > this.thresholds.maxRenderTime)
      .reduce((acc, rt) => {
        acc[rt.component] = (acc[rt.component] || 0) + 1;
        return acc;
      }, {});

    Object.entries(slowComponents).forEach(([component, count]) => {
      if (count > 3) {
        suggestions.push(`Component ${component} is frequently slow. Consider React.memo() or useMemo().`);
      }
    });

    // بررسی کوئری‌های کند
    const frequentSlowQueries = this.metrics.slowQueries
      .reduce((acc, sq) => {
        acc[sq.query] = (acc[sq.query] || 0) + 1;
        return acc;
      }, {});

    Object.entries(frequentSlowQueries).forEach(([query, count]) => {
      if (count > 2) {
        suggestions.push(`Query "${query}" is frequently slow. Consider caching or optimization.`);
      }
    });

    return suggestions;
  }

  // دریافت گزارش عملکرد
  getPerformanceReport() {
    const avgRenderTime = this.metrics.renderTimes.length > 0
      ? this.metrics.renderTimes.reduce((sum, rt) => sum + rt.duration, 0) / this.metrics.renderTimes.length
      : 0;

    const avgMemoryUsage = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage.reduce((sum, mu) => sum + mu.usage, 0) / this.metrics.memoryUsage.length
      : 0;

    const cacheEfficiency = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
      : 0;

    return {
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      averageMemoryUsage: Math.round(avgMemoryUsage),
      cacheEfficiency: Math.round(cacheEfficiency),
      slowQueriesCount: this.metrics.slowQueries.length,
      errorCount: this.metrics.errorCount,
      suggestions: this.suggestOptimizations()
    };
  }

  // شروع مانیتورینگ خودکار
  startMonitoring() {
    // مانیتور حافظه هر ۱۰ ثانیه
    setInterval(() => {
      this.recordMemoryUsage();
    }, 10000);

    // مانیتور خطاهای عمومی
    window.addEventListener('error', () => {
      this.metrics.errorCount++;
    });

    window.addEventListener('unhandledrejection', () => {
      this.metrics.errorCount++;
    });
  }
}

// سینگلتون instance
const performanceOptimizer = new PerformanceOptimizer();

// Hook برای استفاده در کامپوننت‌ها
export const usePerformanceMonitor = (componentName) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      performanceOptimizer.recordRenderTime(componentName, duration);
    };
  }, [componentName]);

  return {
    recordSlowQuery: (query, duration) => performanceOptimizer.recordSlowQuery(query, duration),
    recordCacheEvent: (isHit) => performanceOptimizer.recordCacheEvent(isHit),
    getReport: () => performanceOptimizer.getPerformanceReport()
  };
};

// شروع مانیتورینگ
performanceOptimizer.startMonitoring();

export default performanceOptimizer;