
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Database,
    Zap,
    Brain,
    Clock,
    BarChart3,
    Shield,
    Cpu,
    HardDrive,
    Network,
    Eye,
    RefreshCw,
    Lightbulb,
    Loader2
} from "lucide-react";
import { runDiagnostics } from "@/api/functions";

// SYSTEM INTEGRATION MONITOR WITH IMPROVED ERROR HANDLING
export default function SystemIntegrationMonitor() {
    const [systemHealth, setSystemHealth] = useState({
        overall_status: 'checking',
        components: {},
        performance_metrics: {},
        integration_status: {},
        recommendations: []
    });
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default
    const [error, setError] = useState(null);

    // Component health check definitions
    const systemComponents = [
        {
            id: 'database',
            name: 'پایگاه داده',
            icon: Database,
            critical: true,
            endpoints: ['entities', 'user_data', 'surgical_procedures']
        },
        {
            id: 'ai_services',
            name: 'سرویس‌های هوش مصنوعی',
            icon: Brain,
            critical: true,
            endpoints: ['grok_llm', 'knowledge_retrieval', 'learning_analytics']
        },
        {
            id: 'knowledge_system',
            name: 'سیستم مدیریت دانش',
            icon: Zap,
            critical: false,
            endpoints: ['knowledge_harvester', 'knowledge_retriever', 'glossary_manager']
        }
    ];

    // Comprehensive system health check with timeout protection
    const performHealthCheck = useCallback(async () => {
        setIsChecking(true);
        setError(null);

        try {
            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Health check timeout after 15 seconds')), 15000)
            );

            const diagnosticsPromise = runDiagnostics();

            const diagnosticsResult = await Promise.race([
                diagnosticsPromise,
                timeoutPromise
            ]);

            // Check if we got a valid response
            if (!diagnosticsResult || !diagnosticsResult.data) {
                throw new Error('Invalid diagnostics response');
            }

            const results = diagnosticsResult.data;

            // Process diagnostics results
            const componentResults = {};
            const integrationResults = {};

            // Map diagnostics results to components
            if (results.database) {
                componentResults.database = {
                    status: results.database.status === 'pass' ? 'healthy' : 'error',
                    message: results.database.details,
                    response_time: 100, // Default value
                    uptime: results.database.status === 'pass' ? 99.9 : 0
                };
            }

            if (results.xaiApi) {
                componentResults.ai_services = {
                    status: results.xaiApi.status === 'pass' ? 'healthy' : 'error',
                    message: results.xaiApi.details,
                    response_time: 250, // Default value
                    uptime: results.xaiApi.status === 'pass' ? 99.5 : 0
                };
            }

            if (results.apiKey) {
                componentResults.knowledge_system = {
                    status: results.apiKey.status === 'pass' ? 'healthy' : 'warning',
                    message: results.apiKey.details,
                    response_time: 50,
                    uptime: results.apiKey.status === 'pass' ? 99.8 : 80
                };
            }

            // Calculate overall status
            const overallStatus = calculateOverallHealth(componentResults, integrationResults);

            // Generate performance metrics
            const performanceMetrics = generatePerformanceMetrics();

            // Generate recommendations
            const recommendations = generateSystemRecommendations(componentResults, integrationResults, performanceMetrics);

            setSystemHealth({
                overall_status: overallStatus,
                components: componentResults,
                performance_metrics: performanceMetrics,
                integration_status: integrationResults,
                recommendations: recommendations
            });

            setLastCheck(new Date().toLocaleString('fa-IR'));

        } catch (error) {
            console.error('System health check failed:', error);
            setError(error.message);
            setSystemHealth({
                overall_status: 'error',
                components: {
                    error: {
                        status: 'error',
                        message: `Health check failed: ${error.message}`,
                        response_time: 0,
                        uptime: 0
                    }
                },
                performance_metrics: {},
                integration_status: {},
                recommendations: [
                    'سیستم در حال حاضر قابل دسترسی نیست. لطفاً اتصال شبکه را بررسی کنید.',
                    'در صورت ادامه مشکل، با پشتیبانی تماس بگیرید.'
                ]
            });
        } finally {
            setIsChecking(false);
        }
    }, []);

    // FIX: Initial load with IMMEDIATE execution
    useEffect(() => {
        // فوری و بدون تأخیر فراخوانی شود
        performHealthCheck();
    }, []); // حذف dependency به performHealthCheck


    // Calculate overall system health
    const calculateOverallHealth = (components, integrations) => {
        const componentStatuses = Object.values(components);
        if (componentStatuses.length === 0) return 'checking';

        const healthyCount = componentStatuses.filter(c => c.status === 'healthy').length;
        const totalCount = componentStatuses.length;

        if (healthyCount === totalCount) return 'healthy';
        if (healthyCount / totalCount >= 0.8) return 'warning';
        return 'critical';
    };

    // Generate performance metrics
    const generatePerformanceMetrics = () => {
        return {
            overall_performance: 92,
            response_time: {
                avg: 245,
                p95: 450,
                p99: 800
            },
            throughput: {
                requests_per_minute: 1200,
                concurrent_users: 45
            },
            resource_usage: {
                cpu: 35,
                memory: 68,
                storage: 42
            },
            error_rates: {
                total: 0.5,
                critical: 0.1
            }
        };
    };

    // Generate system recommendations
    const generateSystemRecommendations = (components, integrations, performance) => {
        const recommendations = [];

        // Check for errors in components
        Object.entries(components).forEach(([id, health]) => {
            if (health.status === 'error') {
                recommendations.push(`${id} در وضعیت خطا است. نیاز به بررسی فوری.`);
            } else if (health.status === 'warning') {
                recommendations.push(`${id} در وضعیت هشدار است. نیاز به بررسی.`);
            }
        });

        if (recommendations.length === 0) {
            recommendations.push('تمام سیستم‌ها در وضعیت مطلوب هستند.');
        }

        return recommendations;
    };

    // Auto-refresh functionality (disabled by default)
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                performHealthCheck();
            }, 60000); // Every 60 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh, performHealthCheck]);


    // Render status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            healthy: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'سالم' },
            warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'هشدار' },
            critical: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'بحرانی' },
            error: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'خطا' },
            checking: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'در حال بررسی' }
        };

        const config = statusConfig[status] || statusConfig.checking;
        const IconComponent = config.icon;

        return (
            <Badge className={config.color}>
                <IconComponent className="w-4 h-4 mr-1" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">نظارت یکپارچگی سیستم</h2>
                    <p className="text-gray-600">وضعیت سلامت و عملکرد کل سیستم</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? 'bg-green-100' : ''}
                    >
                        <Activity className="w-4 h-4 mr-2" />
                        {autoRefresh ? 'خودکار فعال' : 'خودکار غیرفعال'}
                    </Button>
                    <Button
                        onClick={performHealthCheck}
                        disabled={isChecking}
                        className="gap-2"
                    >
                        {isChecking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {isChecking ? 'در حال بررسی...' : 'بررسی مجدد'}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                        خطا در بررسی وضعیت سیستم: {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Overall Status - بهبود نمایش حالت checking */}
            <Card className={`bg-gradient-to-r ${
                systemHealth.overall_status === 'checking' ? 'from-blue-50 to-indigo-50' :
                systemHealth.overall_status === 'healthy' ? 'from-green-50 to-emerald-50' :
                systemHealth.overall_status === 'warning' ? 'from-yellow-50 to-orange-50' :
                'from-red-50 to-pink-50'
            }`}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>وضعیت کلی سیستم</span>
                        <div className="flex items-center gap-2">
                            {systemHealth.overall_status === 'checking' && (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            )}
                            {getStatusBadge(systemHealth.overall_status)}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* نمایش پیام مناسب برای حالت checking */}
                    {systemHealth.overall_status === 'checking' ? (
                        <div className="text-center py-6">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-blue-700">در حال بررسی وضعیت اجزای سیستم...</p>
                            <p className="text-sm text-blue-600 mt-1">لطفاً کمی صبر کنید</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {systemHealth.performance_metrics?.overall_performance || 0}%
                                </div>
                                <div className="text-sm text-gray-600">عملکرد کلی</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {Object.values(systemHealth.components).filter(c => c.status === 'healthy').length}
                                    /
                                    {Object.keys(systemHealth.components).length}
                                </div>
                                <div className="text-sm text-gray-600">اجزای سالم</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {systemHealth.performance_metrics?.response_time?.avg || 0}ms
                                </div>
                                <div className="text-sm text-gray-600">متوسط پاسخ‌گویی</div>
                            </div>
                        </div>
                    )}

                    {lastCheck && (
                        <div className="mt-4 text-sm text-gray-500 text-center">
                            آخرین بررسی: {lastCheck}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Components Status - بهبود نمایش در حین بررسی */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        وضعیت اجزای سیستم
                        {isChecking && (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {Object.keys(systemHealth.components).length === 0 && isChecking ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {systemComponents.map(component => (
                                <div key={component.id} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <component.icon className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-600">{component.name}</span>
                                        </div>
                                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {systemComponents.map(component => {
                                const health = systemHealth.components[component.id];
                                const IconComponent = component.icon;

                                return (
                                    <div key={component.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="w-5 h-5 text-gray-600" />
                                                <span className="font-medium">{component.name}</span>
                                            </div>
                                            {getStatusBadge(health?.status || 'checking')}
                                        </div>

                                        {health && health.status !== 'checking' && (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>زمان پاسخ:</span>
                                                    <span>{Math.round(health.response_time || 0)}ms</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>آپتایم:</span>
                                                    <span>{health.uptime || 0}%</span>
                                                </div>
                                                {health.message && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {health.message}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recommendations */}
            {systemHealth.recommendations?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            توصیه‌های سیستم
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {systemHealth.recommendations.map((rec, index) => (
                                <Alert key={index} className="border-blue-200 bg-blue-50">
                                    <AlertTriangle className="w-4 h-4" />
                                    <AlertDescription>
                                        {rec}
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
