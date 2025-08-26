import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    TrendingUp, 
    Target, 
    Clock, 
    Brain, 
    Award, 
    Zap, 
    Activity, 
    BarChart3, 
    CheckCircle2, 
    AlertTriangle,
    Eye,
    Hand,
    Heart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// ADVANCED PERFORMANCE ANALYSIS ENGINE
class AdvancedPerformanceEngine {
    constructor() {
        this.metrics = {
            technical_skill: 0,
            decision_making: 0,
            time_management: 0,
            tissue_handling: 0,
            safety_score: 0,
            situational_awareness: 0,
            stress_management: 0,
            communication: 0
        };
        
        this.decisionHistory = [];
        this.performanceHistory = [];
        this.adaptiveFeedback = [];
        this.realTimeFactors = {
            consistency: 0,
            improvement_rate: 0,
            confidence_level: 0,
            learning_velocity: 0
        };
    }

    // Real-time performance calculation
    updateMetrics(decisionData) {
        const {
            isCorrect,
            timeSpent,
            expectedTime,
            stepComplexity,
            criticalImportance,
            previousDecisions
        } = decisionData;

        // Update decision history
        this.decisionHistory.push({
            timestamp: Date.now(),
            correct: isCorrect,
            timeSpent,
            expectedTime,
            complexity: stepComplexity
        });

        // Keep only last 20 decisions
        if (this.decisionHistory.length > 20) {
            this.decisionHistory = this.decisionHistory.slice(-20);
        }

        // Calculate technical skill based on accuracy and complexity
        const accuracyScore = this.decisionHistory.filter(d => d.correct).length / this.decisionHistory.length;
        const complexityBonus = stepComplexity === 'high' ? 1.2 : stepComplexity === 'medium' ? 1.1 : 1.0;
        this.metrics.technical_skill = Math.min(100, accuracyScore * 100 * complexityBonus);

        // Calculate decision making score
        const recentDecisions = this.decisionHistory.slice(-5);
        const recentAccuracy = recentDecisions.filter(d => d.correct).length / Math.max(recentDecisions.length, 1);
        this.metrics.decision_making = Math.min(100, recentAccuracy * 100);

        // Calculate time management
        const timeEfficiency = Math.min(expectedTime / timeSpent, 1.5); // Cap at 1.5x efficiency
        this.metrics.time_management = Math.min(100, timeEfficiency * 66.67); // Scale to 100

        // Calculate tissue handling (based on gentle decision patterns)
        const gentleTechnique = this.assessTechniqueGentleness(decisionData);
        this.metrics.tissue_handling = Math.min(100, gentleTechnique * 100);

        // Calculate safety score
        const safetyDecisions = recentDecisions.filter(d => d.safety_conscious !== false).length;
        this.metrics.safety_score = Math.min(100, (safetyDecisions / Math.max(recentDecisions.length, 1)) * 100);

        // Calculate consistency
        this.realTimeFactors.consistency = this.calculateConsistency();

        // Update performance history for trending
        this.performanceHistory.push({
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            factors: { ...this.realTimeFactors }
        });

        // Keep only last 50 entries
        if (this.performanceHistory.length > 50) {
            this.performanceHistory = this.performanceHistory.slice(-50);
        }

        // Generate adaptive feedback
        this.generateAdaptiveFeedback();

        return { ...this.metrics };
    }

    assessTechniqueGentleness(decisionData) {
        // Analyze decision patterns for gentle tissue handling indicators
        const gentlenessKeywords = ['gentle', 'careful', 'minimal', 'precise', 'controlled'];
        const roughKeywords = ['force', 'aggressive', 'rapid', 'harsh'];
        
        let gentlenessScore = 0.8; // Base score
        
        if (decisionData.selectedOptionText) {
            const text = decisionData.selectedOptionText.toLowerCase();
            gentlenessKeywords.forEach(keyword => {
                if (text.includes(keyword)) gentlenessScore += 0.1;
            });
            roughKeywords.forEach(keyword => {
                if (text.includes(keyword)) gentlenessScore -= 0.15;
            });
        }

        return Math.max(0, Math.min(1, gentlenessScore));
    }

    calculateConsistency() {
        if (this.decisionHistory.length < 5) return 0;

        const recentPerformances = this.decisionHistory.slice(-10).map(d => d.correct ? 1 : 0);
        const mean = recentPerformances.reduce((a, b) => a + b, 0) / recentPerformances.length;
        const variance = recentPerformances.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / recentPerformances.length;
        
        // Convert variance to consistency score (lower variance = higher consistency)
        return Math.max(0, 100 - (variance * 400)); // Scale appropriately
    }

    generateAdaptiveFeedback() {
        const feedback = [];
        
        // Technical skill feedback
        if (this.metrics.technical_skill < 60) {
            feedback.push({
                type: 'improvement',
                category: 'technical',
                message: 'تمرین بیشتر روی تکنیک‌های پایه توصیه می‌شود',
                priority: 'high',
                suggestion: 'مراجعه به منابع آموزشی تکنیک‌های جراحی'
            });
        } else if (this.metrics.technical_skill > 85) {
            feedback.push({
                type: 'encouragement',
                category: 'technical',
                message: 'مهارت فنی عالی! آماده برای مراحل پیشرفته‌تر',
                priority: 'low',
                suggestion: 'تمرین موارد پیچیده‌تر'
            });
        }

        // Decision making feedback
        if (this.metrics.decision_making < 70) {
            feedback.push({
                type: 'improvement',
                category: 'decision',
                message: 'سرعت و دقت تصمیم‌گیری قابل بهبود است',
                priority: 'medium',
                suggestion: 'تمرین سناریوهای تصمیم‌گیری بیشتر'
            });
        }

        // Time management feedback
        if (this.metrics.time_management < 50) {
            feedback.push({
                type: 'improvement',
                category: 'time',
                message: 'مدیریت زمان نیاز به بهبود دارد',
                priority: 'medium',
                suggestion: 'تمرین با timer و تمرکز بر کارایی'
            });
        }

        this.adaptiveFeedback = feedback;
    }

    getPerformanceInsights() {
        const insights = {
            strengths: [],
            improvements: [],
            trends: this.analyzeTrends(),
            predictions: this.predictNextPerformance()
        };

        // Identify strengths
        Object.entries(this.metrics).forEach(([metric, score]) => {
            if (score > 80) {
                insights.strengths.push({
                    metric,
                    score,
                    description: this.getMetricDescription(metric, 'strength')
                });
            } else if (score < 60) {
                insights.improvements.push({
                    metric,
                    score,
                    description: this.getMetricDescription(metric, 'improvement')
                });
            }
        });

        return insights;
    }

    getMetricDescription(metric, type) {
        const descriptions = {
            technical_skill: {
                strength: 'مهارت فنی بالا و تسلط عالی بر تکنیک‌ها',
                improvement: 'نیاز به تمرین بیشتر روی تکنیک‌های پایه'
            },
            decision_making: {
                strength: 'قدرت تصمیم‌گیری عالی و تحلیل دقیق موقعیت‌ها',
                improvement: 'بهبود سرعت و دقت در تصمیم‌گیری‌های کلینیکی'
            },
            time_management: {
                strength: 'مدیریت زمان بهینه و کارایی بالا',
                improvement: 'بهبود سرعت اجرا و کاهش زمان اتلافی'
            },
            tissue_handling: {
                strength: 'رفتار مناسب با بافت‌ها و تکنیک ملایم',
                improvement: 'تمرین روی ظرافت در کار با بافت‌ها'
            },
            safety_score: {
                strength: 'رعایت کامل اصول ایمنی و پروتکل‌ها',
                improvement: 'توجه بیشتر به نکات ایمنی و پروتکل‌های استاندارد'
            }
        };

        return descriptions[metric]?.[type] || 'توضیحات در دسترس نیست';
    }

    analyzeTrends() {
        if (this.performanceHistory.length < 5) return null;

        const recent = this.performanceHistory.slice(-10);
        const older = this.performanceHistory.slice(-20, -10);

        if (older.length === 0) return null;

        const recentAvg = this.calculateAverageMetrics(recent);
        const olderAvg = this.calculateAverageMetrics(older);

        const trends = {};
        Object.keys(this.metrics).forEach(metric => {
            const change = recentAvg[metric] - olderAvg[metric];
            trends[metric] = {
                direction: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
                magnitude: Math.abs(change),
                change: change
            };
        });

        return trends;
    }

    calculateAverageMetrics(history) {
        const avg = {};
        Object.keys(this.metrics).forEach(metric => {
            avg[metric] = history.reduce((sum, entry) => sum + entry.metrics[metric], 0) / history.length;
        });
        return avg;
    }

    predictNextPerformance() {
        if (this.performanceHistory.length < 10) return null;

        // Simple linear prediction based on recent trend
        const recent = this.performanceHistory.slice(-5);
        const trends = this.analyzeTrends();

        if (!trends) return null;

        const predictions = {};
        Object.keys(this.metrics).forEach(metric => {
            const currentScore = this.metrics[metric];
            const trend = trends[metric];
            
            let predictedChange = 0;
            if (trend.direction === 'improving') {
                predictedChange = Math.min(trend.magnitude * 0.5, 10);
            } else if (trend.direction === 'declining') {
                predictedChange = -Math.min(trend.magnitude * 0.5, 10);
            }

            predictions[metric] = Math.max(0, Math.min(100, currentScore + predictedChange));
        });

        return predictions;
    }

    getDetailedAnalysis() {
        return {
            current_metrics: this.metrics,
            real_time_factors: this.realTimeFactors,
            adaptive_feedback: this.adaptiveFeedback,
            insights: this.getPerformanceInsights(),
            decision_history: this.decisionHistory.slice(-10),
            performance_trends: this.analyzeTrends()
        };
    }
}

// PERFORMANCE MONITORING COMPONENT
export default function PerformanceEngine({ 
    sessionData, 
    onPerformanceUpdate,
    realTimeMode = true 
}) {
    const [performanceEngine] = useState(() => new AdvancedPerformanceEngine());
    const [currentMetrics, setCurrentMetrics] = useState({});
    const [insights, setInsights] = useState(null);
    const [showDetailedView, setShowDetailedView] = useState(false);
    const [performanceHistory, setPerformanceHistory] = useState([]);

    const updateInterval = useRef(null);

    // Real-time metrics updates
    useEffect(() => {
        if (realTimeMode && sessionData?.decisions) {
            const latestDecision = sessionData.decisions[sessionData.decisions.length - 1];
            if (latestDecision) {
                const updatedMetrics = performanceEngine.updateMetrics({
                    isCorrect: latestDecision.is_correct,
                    timeSpent: latestDecision.time_spent || 30,
                    expectedTime: 60, // Default expected time
                    stepComplexity: latestDecision.complexity || 'medium',
                    criticalImportance: latestDecision.importance || 'medium'
                });

                setCurrentMetrics(updatedMetrics);
                setInsights(performanceEngine.getPerformanceInsights());
                
                if (onPerformanceUpdate) {
                    onPerformanceUpdate(performanceEngine.getDetailedAnalysis());
                }
            }
        }
    }, [sessionData, realTimeMode, onPerformanceUpdate, performanceEngine]);

    // Periodic updates for trending data
    useEffect(() => {
        if (realTimeMode) {
            updateInterval.current = setInterval(() => {
                const history = performanceEngine.performanceHistory.slice(-20).map((entry, index) => ({
                    step: index + 1,
                    ...entry.metrics,
                    timestamp: entry.timestamp
                }));
                setPerformanceHistory(history);
            }, 5000);

            return () => {
                if (updateInterval.current) {
                    clearInterval(updateInterval.current);
                }
            };
        }
    }, [realTimeMode, performanceEngine]);

    // Prepare radar chart data
    const radarData = Object.entries(currentMetrics).map(([key, value]) => ({
        metric: key.replace(/_/g, ' '),
        value: Math.round(value || 0),
        fullMark: 100
    }));

    // Prepare line chart data
    const lineChartData = performanceHistory.map((entry, index) => ({
        step: index + 1,
        'Technical Skill': entry.technical_skill || 0,
        'Decision Making': entry.decision_making || 0,
        'Time Management': entry.time_management || 0,
        'Safety Score': entry.safety_score || 0
    }));

    const getMetricColor = (metric, value) => {
        const colors = {
            technical_skill: value > 80 ? 'text-green-600' : value > 60 ? 'text-yellow-600' : 'text-red-600',
            decision_making: value > 80 ? 'text-blue-600' : value > 60 ? 'text-yellow-600' : 'text-red-600',
            time_management: value > 80 ? 'text-purple-600' : value > 60 ? 'text-yellow-600' : 'text-red-600',
            tissue_handling: value > 80 ? 'text-emerald-600' : value > 60 ? 'text-yellow-600' : 'text-red-600',
            safety_score: value > 80 ? 'text-green-600' : value > 60 ? 'text-orange-600' : 'text-red-600'
        };
        return colors[metric] || 'text-gray-600';
    };

    const getMetricIcon = (metric) => {
        const icons = {
            technical_skill: Hand,
            decision_making: Brain,
            time_management: Clock,
            tissue_handling: Heart,
            safety_score: Target,
            situational_awareness: Eye,
            stress_management: Activity,
            communication: Zap
        };
        return icons[metric] || Activity;
    };

    const getMetricLabel = (metric) => {
        const labels = {
            technical_skill: 'مهارت فنی',
            decision_making: 'تصمیم‌گیری',
            time_management: 'مدیریت زمان',
            tissue_handling: 'بافت‌داری',
            safety_score: 'نمره ایمنی',
            situational_awareness: 'آگاهی موقعیتی',
            stress_management: 'مدیریت استرس',
            communication: 'ارتباطات'
        };
        return labels[metric] || metric;
    };

    if (Object.keys(currentMetrics).length === 0) {
        return (
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-0">
                <CardContent className="p-8 text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">آماده تحلیل عملکرد</h3>
                    <p className="text-gray-500">پس از شروع تمرین، تحلیل عملکرد در اینجا نمایش داده می‌شود</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Real-time Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(currentMetrics).slice(0, 8).map(([metric, value]) => {
                    const Icon = getMetricIcon(metric);
                    const colorClass = getMetricColor(metric, value);
                    
                    return (
                        <Card key={metric} className="bg-white/80 backdrop-blur-sm border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`w-5 h-5 ${colorClass}`} />
                                    <div className={`text-2xl font-bold ${colorClass}`}>
                                        {Math.round(value || 0)}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {getMetricLabel(metric)}
                                </div>
                                <Progress 
                                    value={value || 0} 
                                    className="h-1 mt-2" 
                                />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Performance Visualization */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Radar Chart - Current Performance */}
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Target className="w-5 h-5" />
                            نمای کلی عملکرد فعلی
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis 
                                        dataKey="metric" 
                                        tick={{ fontSize: 10 }}
                                    />
                                    <PolarRadiusAxis 
                                        angle={90} 
                                        domain={[0, 100]} 
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Radar
                                        name="Performance"
                                        dataKey="value"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Chart - Performance Trends */}
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="w-5 h-5" />
                            روند پیشرفت
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="step" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Technical Skill" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Decision Making" 
                                        stroke="#82ca9d" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Time Management" 
                                        stroke="#ffc658" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Safety Score" 
                                        stroke="#ff7c7c" 
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights and Feedback */}
            {insights && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {insights.strengths.length > 0 && (
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <Award className="w-5 h-5" />
                                    نقاط قوت ({insights.strengths.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {insights.strengths.map((strength, index) => (
                                    <Alert key={index} className="bg-green-50 border-green-200">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription>
                                            <div className="flex justify-between items-start">
                                                <span className="text-green-800">{strength.description}</span>
                                                <Badge className="bg-green-100 text-green-800 ml-2">
                                                    {Math.round(strength.score)}%
                                                </Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Areas for Improvement */}
                    {insights.improvements.length > 0 && (
                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    نقاط قابل بهبود ({insights.improvements.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {insights.improvements.map((improvement, index) => (
                                    <Alert key={index} className="bg-orange-50 border-orange-200">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        <AlertDescription>
                                            <div className="flex justify-between items-start">
                                                <span className="text-orange-800">{improvement.description}</span>
                                                <Badge className="bg-orange-100 text-orange-800 ml-2">
                                                    {Math.round(improvement.score)}%
                                                </Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Adaptive Feedback */}
            {performanceEngine.adaptiveFeedback.length > 0 && (
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Brain className="w-5 h-5" />
                            بازخورد هوشمند سیستم
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {performanceEngine.adaptiveFeedback.map((feedback, index) => (
                            <Alert key={index} className="bg-blue-50 border-blue-200">
                                <Brain className="h-4 w-4 text-blue-600" />
                                <AlertDescription>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-blue-800 font-medium">{feedback.message}</span>
                                            <Badge 
                                                className={`ml-2 ${
                                                    feedback.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {feedback.priority}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-blue-600">
                                            💡 {feedback.suggestion}
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Performance Trends Analysis */}
            {insights?.trends && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <BarChart3 className="w-5 h-5" />
                            تحلیل روندها
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(insights.trends).map(([metric, trend]) => {
                                const Icon = getMetricIcon(metric);
                                const trendColor = trend.direction === 'improving' ? 'text-green-600' : 
                                                 trend.direction === 'declining' ? 'text-red-600' : 'text-gray-600';
                                const trendIcon = trend.direction === 'improving' ? '↗️' : 
                                                trend.direction === 'declining' ? '↘️' : '➡️';
                                
                                return (
                                    <div key={metric} className="text-center p-3 bg-white/50 rounded-xl">
                                        <Icon className={`w-5 h-5 mx-auto mb-2 ${trendColor}`} />
                                        <div className={`text-sm font-medium ${trendColor}`}>
                                            {getMetricLabel(metric)}
                                        </div>
                                        <div className="text-lg">
                                            {trendIcon} {Math.round(trend.change > 0 ? trend.change : Math.abs(trend.change))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}