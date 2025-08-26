
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Resource, Case, LearningProgress } from "@/api/entities";
import { User } from "@/api/entities";
import { UserProgress } from "@/api/entities";
import { knowledgeRetriever } from "@/api/functions";
import { knowledgeHarvester } from "@/api/functions";
import {
    BookOpen,
    Stethoscope,
    Clock,
    TrendingUp,
    Play,
    Star,
    Calendar,
    Target,
    BookHeart,
    Scissors,
    HeartPulse,
    Phone,
    Bot,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Database,
    ChevronRight,
    Activity,
    Zap,
    BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProgressTracker from "@/components/shared/ProgressTracker";
import LearningJourney from "@/components/dashboard/LearningJourney";
import SystemIntegrationMonitor from "@/components/utils/SystemIntegrationMonitor";
import UserGamificationCard from "@/components/gamification/UserGamificationCard";
import AchievementSystem from "@/components/gamification/AchievementSystem";
import RewardsBanner from "@/components/gamification/RewardsBanner";

// PERFORMANCE MONITORING SYSTEM
class DashboardPerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTimes: [],
            renderTimes: [],
            cacheHits: 0,
            cacheMisses: 0,
            apiCalls: 0,
            errors: 0
        };
        this.observers = [];
        this.startTime = performance.now();
    }

    recordLoadTime(operation, duration) {
        this.metrics.loadTimes.push({ operation, duration, timestamp: Date.now() });
        if (this.metrics.loadTimes.length > 100) {
            this.metrics.loadTimes = this.metrics.loadTimes.slice(-50);
        }
        this.notifyObservers();
    }

    recordCacheEvent(isHit) {
        if (isHit) {
            this.metrics.cacheHits++;
        } else {
            this.metrics.cacheMisses++;
        }
        this.notifyObservers();
    }

    recordApiCall() {
        this.metrics.apiCalls++;
        this.notifyObservers();
    }

    recordError(error) {
        this.metrics.errors++;
        console.error('Dashboard Performance Error:', error);
        this.notifyObservers();
    }

    getPerformanceStats() {
        const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
        const avgLoadTime = this.metrics.loadTimes.length > 0
            ? this.metrics.loadTimes.reduce((sum, item) => sum + item.duration, 0) / this.metrics.loadTimes.length
            : 0;

        return {
            avgLoadTime: Math.round(avgLoadTime),
            cacheEfficiency: totalCacheRequests > 0 ? Math.round((this.metrics.cacheHits / totalCacheRequests) * 100) : 0,
            totalApiCalls: this.metrics.apiCalls,
            errorRate: this.metrics.errors,
            uptime: Math.round((performance.now() - this.startTime) / 1000),
            recentOperations: this.metrics.loadTimes.slice(-5)
        };
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    unsubscribe(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.getPerformanceStats());
            } catch (error) {
                console.warn('Observer notification failed:', error);
            }
        });
    }
}

// ADVANCED LRU CACHE WITH PERFORMANCE METRICS
class OptimizedDashboardCache {
    constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
        this.cache = new Map();
        this.accessTimes = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.hitCount = 0;
        this.missCount = 0;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.missCount++;
            return null;
        }

        // TTL validation
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            this.accessTimes.delete(key);
            this.missCount++;
            return null;
        }

        // Update access time for LRU
        this.accessTimes.set(key, Date.now());
        this.hitCount++;
        return item.data;
    }

    set(key, data) {
        // Eviction policy: remove oldest accessed item
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            let oldestKey = null;
            let oldestTime = Infinity;
            
            for (const [k, time] of this.accessTimes) {
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

    getStats() {
        const total = this.hitCount + this.missCount;
        return {
            size: this.cache.size,
            hitRate: total > 0 ? Math.round((this.hitCount / total) * 100) : 0,
            totalRequests: total
        };
    }

    clear() {
        this.cache.clear();
        this.accessTimes.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }
}

// SINGLETON INSTANCES
const performanceMonitor = new DashboardPerformanceMonitor();
const dashboardCache = new OptimizedDashboardCache(150, 8 * 60 * 1000);

export default function Dashboard() {
    const [resources, setResources] = useState([]);
    const [cases, setCases] = useState([]);
    const [progress, setProgress] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [knowledgeHarvestStatus, setKnowledgeHarvestStatus] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [performanceStats, setPerformanceStats] = useState(null);
    const [realTimeMetrics, setRealTimeMetrics] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    
    const mountedRef = useRef(true);
    const loadStartTime = useRef(0);

    // PERFORMANCE METRICS SUBSCRIPTION
    useEffect(() => {
        const handlePerformanceUpdate = (stats) => {
            if (mountedRef.current) {
                setPerformanceStats(stats);
            }
        };

        performanceMonitor.subscribe(handlePerformanceUpdate);

        return () => {
            mountedRef.current = false;
            performanceMonitor.unsubscribe(handlePerformanceUpdate);
        };
    }, []);

    // REAL-TIME METRICS UPDATER
    useEffect(() => {
        const interval = setInterval(() => {
            if (mountedRef.current) {
                setRealTimeMetrics({
                    timestamp: Date.now(),
                    cacheStats: dashboardCache.getStats(),
                    memoryUsage: performance.memory ? {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                    } : null
                });
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // OPTIMIZED DATA LOADING WITH O(1) COMPLEXITY WHERE POSSIBLE
    const loadData = useCallback(async (forceRefresh = false) => {
        loadStartTime.current = performance.now();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        try {
            // Check cache first - O(1) operation
            const cacheKey = `dashboard_data_${user?.id || 'anonymous'}`;
            
            if (!forceRefresh && now - lastUpdateTime < CACHE_DURATION) {
                const cachedData = dashboardCache.get(cacheKey);
                if (cachedData) {
                    performanceMonitor.recordCacheEvent(true);
                    
                    if (mountedRef.current) {
                        setResources(cachedData.resources || []);
                        setCases(cachedData.cases || []);
                        setProgress(cachedData.progress || []);
                        setUser(cachedData.user || null);
                        setIsLoading(false);
                    }
                    
                    const loadTime = performance.now() - loadStartTime.current;
                    performanceMonitor.recordLoadTime('cached_load', loadTime);
                    return;
                }
            }

            performanceMonitor.recordCacheEvent(false);
            
            if (mountedRef.current) {
                setIsLoading(true);
            }

            // Parallel loading with error isolation - O(1) relative to total data size
            const loadPromises = [
                Resource.list('-created_date', 10).catch(err => {
                    performanceMonitor.recordError(err);
                    return [];
                }),
                Case.list('-created_date', 5).catch(err => {
                    performanceMonitor.recordError(err);
                    return [];
                }),
                LearningProgress.list('-updated_date', 20).catch(err => {
                    performanceMonitor.recordError(err);
                    return [];
                }),
                User.me().catch(err => {
                    performanceMonitor.recordError(err);
                    return null;
                })
            ];

            performanceMonitor.recordApiCall();
            const [resourcesData, casesData, progressData, userData] = await Promise.all(loadPromises);

            // Validate and sanitize data - O(n) but with small n
            const validatedData = {
                resources: Array.isArray(resourcesData) ? resourcesData.slice(0, 10) : [],
                cases: Array.isArray(casesData) ? casesData.slice(0, 5) : [],
                progress: Array.isArray(progressData) ? progressData.slice(0, 20) : [],
                user: userData
            };

            // Cache the results
            dashboardCache.set(cacheKey, validatedData);

            if (mountedRef.current) {
                setResources(validatedData.resources);
                setCases(validatedData.cases);
                setProgress(validatedData.progress);
                setUser(validatedData.user);
                setLastUpdateTime(now);
                setIsLoading(false);
            }

            const totalLoadTime = performance.now() - loadStartTime.current;
            performanceMonitor.recordLoadTime('full_load', totalLoadTime);

        } catch (error) {
            performanceMonitor.recordError(error);
            console.error('Dashboard data loading failed:', error);
            
            if (mountedRef.current) {
                setResources([]);
                setCases([]);
                setProgress([]);
                setUser(null);
                setIsLoading(false);
            }
        }
    }, [user?.id, lastUpdateTime]);

    // OPTIMIZED STATISTICS CALCULATION - O(n) single pass
    const statsCalculations = useMemo(() => {
        const startCalcTime = performance.now();
        
        if (!Array.isArray(progress) || progress.length === 0) {
            return {
                totalStudyMinutes: 0,
                totalStudyHours: 0,
                completedCases: 0,
                averageScore: 0,
                performanceMetrics: {
                    consistency: 0,
                    improvement: 0,
                    efficiency: 0
                }
            };
        }

        // Single-pass algorithm for O(n) complexity
        let totalMinutes = 0;
        let scoreSum = 0;
        let scoreCount = 0;
        const recentScores = [];

        // Process all progress items in one pass
        for (const p of progress) {
            if (!p || typeof p !== 'object') continue;

            // Safe time calculation
            const timeSpent = parseFloat(p.time_spent);
            if (!isNaN(timeSpent) && timeSpent >= 0) {
                totalMinutes += Math.min(timeSpent, 600); // Cap outliers
            }

            // Score aggregation
            if (Array.isArray(p.quiz_scores)) {
                for (const score of p.quiz_scores) {
                    if (score?.score !== undefined && score?.max_score > 0) {
                        const normalizedScore = Math.min(100, Math.max(0, (score.score / score.max_score) * 100));
                        scoreSum += normalizedScore;
                        scoreCount++;

                        if (score.date) {
                            recentScores.push({
                                score: normalizedScore,
                                timestamp: new Date(score.date).getTime()
                            });
                        }
                    }
                }
            }
        }

        // Calculate derived metrics
        const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
        const completedCases = Array.isArray(cases) ? cases.filter(c => c?.status === 'completed').length : 0;

        // Performance trend analysis (limited to recent scores for efficiency)
        const sortedScores = recentScores
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-10);

        let improvement = 0;
        if (sortedScores.length >= 3) {
            const firstThird = sortedScores.slice(0, Math.ceil(sortedScores.length / 3));
            const lastThird = sortedScores.slice(-Math.ceil(sortedScores.length / 3));
            
            if (firstThird.length > 0 && lastThird.length > 0) {
                const firstAvg = firstThird.reduce((sum, s) => sum + s.score, 0) / firstThird.length;
                const lastAvg = lastThird.reduce((sum, s) => sum + s.score, 0) / lastThird.length;
                improvement = lastAvg - firstAvg;
            }
        }

        const calcTime = performance.now() - startCalcTime;
        performanceMonitor.recordLoadTime('stats_calculation', calcTime);

        return {
            totalStudyMinutes: Math.round(totalMinutes),
            totalStudyHours: Math.round(totalMinutes / 60),
            completedCases,
            averageScore: avgScore,
            performanceMetrics: {
                consistency: sortedScores.length >= 5 ? Math.round(100 - (
                    Math.sqrt(sortedScores.reduce((sum, s) => sum + Math.pow(s.score - avgScore, 2), 0) / sortedScores.length)
                )) : 0,
                improvement: Math.round(improvement),
                efficiency: totalMinutes > 0 && avgScore > 0 ? Math.round(avgScore / (totalMinutes / 60)) : 0
            }
        };
    }, [progress, cases]);

    // Initial load
    useEffect(() => {
        loadData();
        checkKnowledgeHarvesting();
        loadUserProgress();
    }, [loadData]);

    const checkKnowledgeHarvesting = useCallback(async () => {
        try {
            const statsResponse = await knowledgeRetriever({
                action: 'getStats'
            });

            if (mountedRef.current) {
                if (statsResponse.data && statsResponse.data.totalSources === 0) {
                    setKnowledgeHarvestStatus('needs_initial');
                } else {
                    setKnowledgeHarvestStatus('ready');
                }
            }
        } catch (error) {
            performanceMonitor.recordError(error);
            if (mountedRef.current) {
                setKnowledgeHarvestStatus('error');
            }
        }
    }, []);

    const loadUserProgress = useCallback(async () => {
        try {
            const upList = await UserProgress.list();
            const userFromFetch = await User.me().catch(() => null);
            const mine = (upList || []).find(u => u.created_by === userFromFetch?.email);
            
            if (mountedRef.current) {
                setUserProgress(mine || null);
            }
        } catch (error) {
            performanceMonitor.recordError(error);
            if (mountedRef.current) {
                setUserProgress(null);
            }
        }
    }, []);

    const startKnowledgeHarvesting = useCallback(async () => {
        try {
            if (mountedRef.current) {
                setKnowledgeHarvestStatus('harvesting');
            }

            const harvestResponse = await knowledgeHarvester({
                action: 'harvestAll'
            });

            if (harvestResponse.data) {
                setTimeout(async () => {
                    try {
                        const processResponse = await knowledgeHarvester({
                            action: 'processPending'
                        });
                        
                        if (mountedRef.current) {
                            if (processResponse.data) {
                                setKnowledgeHarvestStatus('ready');
                            } else {
                                setKnowledgeHarvestStatus('error');
                            }
                        }
                    } catch (processError) {
                        performanceMonitor.recordError(processError);
                        if (mountedRef.current) {
                            setKnowledgeHarvestStatus('error');
                        }
                    }
                }, 5000);
            } else {
                if (mountedRef.current) {
                    setKnowledgeHarvestStatus('error');
                }
            }
        } catch (error) {
            performanceMonitor.recordError(error);
            if (mountedRef.current) {
                setKnowledgeHarvestStatus('error');
            }
        }
    }, []);

    const weeklyGoalMinutes = userProgress?.weekly_goals?.total_study_hours 
        ? (userProgress.weekly_goals.total_study_hours * 60) 
        : 300;

    // Enhanced stats with performance indicators
    const stats = [
        {
            title: "منابع مطالعه شده",
            value: resources.length,
            emptyText: "هنوز منبعی ثبت نشده",
            icon: BookOpen,
            gradient: "from-blue-200 to-purple-200",
            detail: `${resources.filter(r => r.summary?.length > 100).length} منبع تحلیل شده`,
            trend: resources.length > 5 ? "positive" : "neutral"
        },
        {
            title: "کیس‌های تحلیل شده",
            value: statsCalculations.completedCases,
            emptyText: "هنوز کیسی تحلیل نشده",
            icon: Stethoscope,
            gradient: "from-green-200 to-teal-200",
            detail: `${cases.length} کیس در مجموع`,
            trend: statsCalculations.completedCases > 3 ? "positive" : "neutral"
        },
        {
            title: "ساعات مطالعه",
            value: statsCalculations.totalStudyHours,
            emptyText: "ساعتی ثبت نشده",
            icon: Clock,
            gradient: "from-orange-200 to-pink-200",
            detail: `راندمان: ${statsCalculations.performanceMetrics.efficiency}%`,
            trend: statsCalculations.performanceMetrics.efficiency > 50 ? "positive" : "neutral"
        },
        {
            title: "میانگین نمرات",
            value: statsCalculations.averageScore,
            emptyText: "نمره‌ای ثبت نشده",
            icon: TrendingUp,
            gradient: "from-purple-200 to-pink-200",
            detail: `${statsCalculations.performanceMetrics.improvement > 0 ? '↗' : '↘'} ${Math.abs(statsCalculations.performanceMetrics.improvement)}% تغییر`,
            trend: statsCalculations.performanceMetrics.improvement > 0 ? "positive" : "negative"
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gradient-to-r from-purple-200 to-blue-200 rounded-3xl w-64 mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-purple-200 rounded-2xl w-96"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-purple-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* سیستم خودکار نشان‌ها (invisible) */}
            <AchievementSystem />

            {/* System Integration Monitor - اولویت بالا برای بارگذاری */}
            <React.Suspense fallback={
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
                    <CardContent className="p-6 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-700">در حال بارگذاری نظارت سیستم...</p>
                    </CardContent>
                </Card>
            }>
                <SystemIntegrationMonitor />
            </React.Suspense>

            {/* Performance Monitoring Dashboard */}
            {performanceStats && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <Activity className="w-5 h-5" />
                                آمار عملکرد سیستم
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${performanceStats.errorRate === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-600">
                                    {performanceStats.errorRate === 0 ? 'سالم' : 'خطا'}
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Zap className="w-4 h-4 text-emerald-600" />
                                    <div className="text-lg font-bold text-emerald-600">
                                        {performanceStats.avgLoadTime}ms
                                    </div>
                                </div>
                                <div className="text-gray-600">میانگین بارگیری</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Database className="w-4 h-4 text-blue-600" />
                                    <div className="text-lg font-bold text-blue-600">
                                        {performanceStats.cacheEfficiency}%
                                    </div>
                                </div>
                                <div className="text-gray-600">راندمان کش</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <BarChart3 className="w-4 h-4 text-purple-600" />
                                    <div className="text-lg font-bold text-purple-600">
                                        {performanceStats.totalApiCalls}
                                    </div>
                                </div>
                                <div className="text-gray-600">درخواست‌های API</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <div className="text-lg font-bold text-orange-600">
                                        {performanceStats.uptime}s
                                    </div>
                                </div>
                                <div className="text-gray-600">زمان فعالیت</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <div className="text-lg font-bold text-red-600">
                                        {performanceStats.errorRate}
                                    </div>
                                </div>
                                <div className="text-gray-600">تعداد خطا</div>
                            </div>
                        </div>

                        {realTimeMetrics?.memoryUsage && (
                            <div className="mt-4 pt-4 border-t border-emerald-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">مصرف حافظه</span>
                                    <span className="text-sm font-medium">
                                        {realTimeMetrics.memoryUsage.used}MB / {realTimeMetrics.memoryUsage.total}MB
                                    </span>
                                </div>
                                <Progress 
                                    value={(realTimeMetrics.memoryUsage.used / realTimeMetrics.memoryUsage.total) * 100} 
                                    className="h-2"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Knowledge Harvesting Status */}
            {knowledgeHarvestStatus === 'needs_initial' && (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Database className="w-8 h-8 text-orange-600" />
                                <div>
                                    <h3 className="font-bold text-orange-800">کتابخانه هوشمند آماده‌سازی</h3>
                                    <p className="text-sm text-orange-600">
                                        صنم جان، بیا کتابخانه هوشمند رو با هزاران منبع معتبر دامپزشکی پر کنیم!
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={startKnowledgeHarvesting}
                                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-2xl"
                            >
                                شروع جمع‌آوری منابع
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {knowledgeHarvestStatus === 'harvesting' && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <div>
                                <h3 className="font-bold text-blue-800">در حال جمع‌آوری منابع...</h3>
                                <p className="text-sm text-blue-600">
                                    داریم منابع معتبر دامپزشکی رو از بهترین مجلات و دانشگاه‌ها جمع‌آوری می‌کنیم
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header */}
            <div className="text-center lg:text-right">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    صنم یار
                </h1>
                <p className="text-gray-600">
                    دستیار فوق تخصصی و هوشمند
                </p>
            </div>

            <LearningJourney />
            <ProgressTracker 
                studyMinutes={statsCalculations.totalStudyMinutes} 
                casesCompleted={statsCalculations.completedCases} 
                weeklyGoal={weeklyGoalMinutes} 
            />

            {/* NEW: Gamification summary */}
            <UserGamificationCard />

            {/* بنر پاداش‌ها و پیشرفت گامیفیکیشن */}
            <RewardsBanner />

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const hasValue = stat.value !== null && stat.value !== undefined && stat.value !== 0;
                    return (
                        <Card 
                            key={index} 
                            className={`bg-gradient-to-br ${stat.gradient} border-0 overflow-hidden transition-all duration-300 hover:scale-105`}
                            style={{
                                boxShadow: `inset -4px -4px 12px rgba(139, 92, 246, 0.2), inset 4px 4px 12px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.1)`
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                        {hasValue ? (
                                            <div>
                                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                                <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-600">{stat.emptyText}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 rounded-2xl bg-white/50"
                                             style={{
                                                 boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.2), inset 2px 2px 6px rgba(255, 255, 255, 0.8)'
                                             }}>
                                            <stat.icon className="w-6 h-6 text-gray-600" />
                                        </div>
                                        {hasValue && (
                                            <div className={`w-2 h-2 rounded-full ${
                                                stat.trend === 'positive' ? 'bg-green-500' :
                                                stat.trend === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                                            }`}></div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Content Sections */}
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">آخرین کتاب‌های خونده شده</h2>
                            <Link to={createPageUrl("academicAssistant")}>
                                <Button variant="ghost" size="sm" className="rounded-2xl text-purple-600 hover:bg-purple-100">
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                    مشاهده همه
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {resources.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    هیچ منبعی ثبت نشده است.
                                </div>
                            ) : (
                                resources.map((resource) => (
                                    <div key={resource.id}
                                         className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer"
                                         style={{
                                             boxShadow: 'inset -2px -2px 8px rgba(59, 130, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)'
                                         }}
                                         onClick={() => window.open(createPageUrl("academicAssistant"), '_self')}
                                    >
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200"
                                             style={{
                                                 boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                             }}>
                                            <BookOpen className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800 mb-1">{resource.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {resource.category?.replace(/_/g, ' ')} • {resource.species?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="rounded-2xl hover:bg-white/50">
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">کیس‌های اخیر</h2>
                            <Link to={createPageUrl("AnimalTreatment")}>
                                <Button variant="ghost" size="sm" className="rounded-2xl text-green-600 hover:bg-green-100">
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                    مشاهده همه
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {cases.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    هیچ کیسی ثبت نشده است.
                                </div>
                            ) : (
                                cases.map((caseItem) => (
                                    <div key={caseItem.id}
                                         className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 transition-all duration-300 cursor-pointer"
                                         style={{
                                             boxShadow: 'inset -2px -2px 8px rgba(34, 197, 94, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)'
                                         }}
                                         onClick={() => window.open(createPageUrl("AnimalTreatment"), '_self')}
                                    >
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-200 to-teal-200"
                                             style={{
                                                 boxShadow: 'inset -2px -2px 6px rgba(34, 197, 94, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                             }}>
                                            <Stethoscope className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800 mb-1">{caseItem.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {caseItem.species} • {caseItem.chief_complaint?.substring(0, 50)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {caseItem.status === 'completed' && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <Star className="w-4 h-4 fill-current" />
                                                </div>
                                            )}
                                            <Button size="icon" variant="ghost" className="rounded-2xl hover:bg-white/50">
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Grid */}
            <Card className="bg-gradient-to-r from-pink-100 via-rose-100 to-fuchsia-100 border-0"
                  style={{
                      boxShadow: 'inset -6px -6px 20px rgba(236, 72, 153, 0.15), inset 6px 6px 20px rgba(255, 255, 255, 0.9), 0 12px 40px rgba(236, 72, 153, 0.1)'
                  }}>
                <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">چی کار می‌خوای بکنی صنم جان؟</h2>
                    <p className="text-center text-gray-600 mb-6">هر کدوم رو که دوست داری انتخاب کن، من کنارتم! 💕</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "مطالعه کتاب", icon: BookHeart, url: "academicAssistant", color: "pink", desc: "کتابت رو آپلود کن" },
                            { title: "تمرین جراحی", icon: Scissors, url: "VirtualSurgeryLab", color: "rose", desc: "مهارت‌هات رو تقویت کن" },
                            { title: "تحلیل کیس", icon: HeartPulse, url: "AnimalTreatment", color: "fuchsia", desc: "کیس جدید بسازیم" },
                            { title: "صحبت با من", icon: Phone, url: "ContactAssistant", color: "purple", desc: "بیا باهم حرف بزنیم" }
                        ].map((action, index) => (
                            <Link key={index} to={createPageUrl(action.url)}>
                                <Button
                                    variant="ghost"
                                    className="w-full h-24 flex flex-col gap-2 rounded-3xl bg-white/50 hover:bg-white/70 transition-all duration-300 group"
                                    style={{
                                        boxShadow: 'inset -3px -3px 10px rgba(236, 72, 153, 0.2), inset 3px 3px 10px rgba(255, 255, 255, 0.8)'
                                    }}
                                >
                                    <action.icon className={`w-6 h-6 text-${action.color}-600 group-hover:scale-110 transition-transform`} />
                                    <div className="text-center">
                                        <span className="text-sm font-medium text-gray-700 block">{action.title}</span>
                                        <span className="text-xs text-gray-500">{action.desc}</span>
                                    </div>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
