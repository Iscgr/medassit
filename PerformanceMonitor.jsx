import React, { useState, useEffect } from "react";
import { cacheManager } from "@/components/utils/cacheManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Database, Zap, Trash2 } from "lucide-react";

// Development component for monitoring performance
export default function PerformanceMonitor() {
    const [cacheStats, setCacheStats] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCacheStats(cacheManager.getStats());
            updatePerformanceMetrics();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const updatePerformanceMetrics = () => {
        const metrics = {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            navigation: performance.getEntriesByType('navigation')[0],
            resources: performance.getEntriesByType('resource').length
        };
        setPerformanceMetrics(metrics);
    };

    const clearCache = () => {
        cacheManager.clear();
        setCacheStats(cacheManager.getStats());
    };

    // Always show in development mode
    const isDevelopment = !window.location.hostname.includes('production');

    if (!isDevelopment && !isVisible) {
        return (
            <Button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 left-4 z-50 rounded-full w-12 h-12 p-0"
                variant="outline"
            >
                <Monitor className="w-4 h-4" />
            </Button>
        );
    }

    if (!isVisible && !isDevelopment) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 w-80">
            <Card className="bg-black/90 text-white border-gray-700">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            مانیتور عملکرد
                        </CardTitle>
                        <Button
                            onClick={() => setIsVisible(false)}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-700"
                        >
                            ×
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                    {/* Cache Statistics */}
                    {cacheStats && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    کش
                                </span>
                                <Button
                                    onClick={clearCache}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-900/20 p-1 h-6"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Badge variant="outline" className="justify-center">
                                    {cacheStats.size} entries
                                </Badge>
                                <Badge variant="outline" className="justify-center">
                                    {cacheStats.usage} usage
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Memory Usage */}
                    {performanceMetrics.memory && (
                        <div>
                            <div className="flex items-center gap-1 mb-2">
                                <Zap className="w-3 h-3" />
                                <span>حافظه (MB)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <Badge variant="outline" className="justify-center text-xs">
                                    {performanceMetrics.memory.used}
                                </Badge>
                                <Badge variant="outline" className="justify-center text-xs">
                                    {performanceMetrics.memory.total}
                                </Badge>
                                <Badge variant="outline" className="justify-center text-xs">
                                    {performanceMetrics.memory.limit}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Navigation Timing */}
                    {performanceMetrics.navigation && (
                        <div>
                            <span>Navigation Timing</span>
                            <div className="mt-1">
                                <Badge variant="outline" className="w-full justify-center">
                                    Load: {Math.round(performanceMetrics.navigation.loadEventEnd)}ms
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Resource Count */}
                    <div>
                        <Badge variant="outline" className="w-full justify-center">
                            {performanceMetrics.resources} resources loaded
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}