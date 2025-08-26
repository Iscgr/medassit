import React from "react";
import { Resource } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock } from "lucide-react";
import LazyLoadImage from "./LazyLoadImage";
import { getCachedData, setCachedData, hasCachedData } from "../utils/cacheManager";
import { usePerformanceMonitor } from "../utils/performanceOptimizer";

const OptimizedResourceList = React.memo(({ 
  filters = {}, 
  limit = 20, 
  onResourceSelect = null 
}) => {
  const [resources, setResources] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  
  const performanceMonitor = usePerformanceMonitor('OptimizedResourceList');

  // بارگذاری منابع با کش‌بندی
  const loadResources = React.useCallback(async (pageNum = 1, append = false) => {
    const cacheKey = `resources_${JSON.stringify(filters)}_${pageNum}`;
    
    // بررسی کش
    if (hasCachedData('resources', cacheKey)) {
      const cached = getCachedData('resources', cacheKey);
      performanceMonitor.recordCacheEvent(true);
      
      if (append) {
        setResources(prev => [...prev, ...cached]);
      } else {
        setResources(cached);
      }
      setLoading(false);
      return;
    }

    performanceMonitor.recordCacheEvent(false);
    const startTime = performance.now();

    try {
      setLoading(true);
      
      // ساخت کوئری بر اساس فیلترها
      const query = {};
      if (filters.category) query.category = filters.category;
      if (filters.species) query.species = filters.species;
      if (filters.type) query.type = filters.type;

      const result = await Resource.filter(query, '-created_date', limit, (pageNum - 1) * limit);
      const data = result || [];
      
      // ذخیره در کش
      setCachedData('resources', cacheKey, data);
      
      if (append) {
        setResources(prev => [...prev, ...data]);
      } else {
        setResources(data);
      }
      
      setHasMore(data.length === limit);
      
      const duration = performance.now() - startTime;
      if (duration > 2000) {
        performanceMonitor.recordSlowQuery('Resource.filter', duration);
      }
      
    } catch (error) {
      console.error('خطا در بارگذاری منابع:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [filters, limit, performanceMonitor]);

  // بارگذاری اولیه
  React.useEffect(() => {
    setPage(1);
    loadResources(1, false);
  }, [loadResources]);

  // بارگذاری صفحه بعدی
  const loadMore = React.useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadResources(nextPage, true);
    }
  }, [loading, hasMore, page, loadResources]);

  // Intersection Observer برای infinite scroll
  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <div className="space-y-4">
      {/* لیست منابع */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="bg-white/70 border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* تصویر Lazy Load */}
              {resource.thumbnail_url && (
                <div className="w-full h-32 mb-3 rounded-xl overflow-hidden">
                  <LazyLoadImage
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                    placeholder={
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2">{resource.title}</h3>
                
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {resource.category?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {resource.type}
                  </Badge>
                  {resource.species && (
                    <Badge variant="outline" className="text-xs">
                      {resource.species.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                {resource.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {resource.summary.substring(0, 100)}...
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(resource.created_date).toLocaleDateString('fa-IR')}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onResourceSelect?.(resource)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    مطالعه
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نشانگر بارگذاری بیشتر */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              در حال بارگذاری...
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={loadMore}
              className="rounded-xl"
            >
              بارگذاری بیشتر
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

OptimizedResourceList.displayName = 'OptimizedResourceList';

export default OptimizedResourceList;