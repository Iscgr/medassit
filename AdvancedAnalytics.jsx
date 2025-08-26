import React, { useState, useEffect } from "react";
import { LearningAnalytics, Resource, Case, User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";
import { 
    TrendingUp, 
    Brain, 
    Target, 
    Clock, 
    Award, 
    Lightbulb,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdvancedAnalytics() {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [insightsData, setInsightsData] = useState(null);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
    const [selectedMetrics, setSelectedMetrics] = useState('overview');

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            
            switch (timeRange) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }

            const analytics = await LearningAnalytics.list('-created_date', 1000);
            const filteredAnalytics = analytics.filter(a => 
                new Date(a.start_time) >= startDate && new Date(a.start_time) <= endDate
            );
            
            setAnalyticsData(filteredAnalytics);
            await generateAIInsights(filteredAnalytics);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    const generateAIInsights = async (data) => {
        setIsGeneratingInsights(true);
        try {
            const response = await InvokeLLM({
                prompt: `سلام صنم جان! من آمار یادگیری تو رو تحلیل کردم:

داده‌های فعالیت:
- تعداد جلسات: ${data.length}
- مجموع زمان مطالعه: ${data.reduce((sum, d) => sum + d.duration_minutes, 0)} دقیقه
- میانگین درجه دشواری: ${data.reduce((sum, d) => sum + (d.performance_metrics?.difficulty_rating || 3), 0) / data.length}
- میانگین اعتماد به نفس: ${data.reduce((sum, d) => sum + (d.performance_metrics?.confidence_level || 3), 0) / data.length}

لطفاً تحلیل جامعی از نحوه یادگیری من ارائه بده:
1. نقاط قوت و ضعف من کجاست؟
2. بهترین زمان مطالعه من کی است؟
3. چه موضوعاتی نیاز به تمرین بیشتر دارند؟
4. پیشنهادات شخصی‌سازی شده برای بهبود یادگیری
5. اهداف قابل دستیابی برای هفته آینده

همه چیز رو به صورت دوستانه و انگیزه‌بخش بگو.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        learning_strengths: { type: "array", items: { type: "string" } },
                        improvement_areas: { type: "array", items: { type: "string" } },
                        optimal_study_schedule: {
                            type: "object",
                            properties: {
                                best_time_of_day: { type: "string" },
                                recommended_session_length: { type: "number" },
                                break_frequency: { type: "string" }
                            }
                        },
                        knowledge_gaps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    topic: { type: "string" },
                                    severity: { type: "string", "enum": ["minor", "moderate", "major"] },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        personalized_goals: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    goal: { type: "string" },
                                    target_date: { type: "string" },
                                    action_steps: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        motivational_message: { type: "string" }
                    }
                }
            });

            setInsightsData(response);
        } catch (error) {
            console.error('Error generating insights:', error);
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    // Process data for different chart types
    const processChartData = () => {
        if (!analyticsData.length) return {};

        // Study time by day
        const studyTimeByDay = analyticsData.reduce((acc, session) => {
            const date = new Date(session.start_time).toLocaleDateString('fa-IR');
            acc[date] = (acc[date] || 0) + session.duration_minutes;
            return acc;
        }, {});

        const dailyStudyData = Object.entries(studyTimeByDay).map(([date, minutes]) => ({
            date,
            minutes,
            hours: (minutes / 60).toFixed(1)
        }));

        // Activity type distribution
        const activityDistribution = analyticsData.reduce((acc, session) => {
            acc[session.activity_type] = (acc[session.activity_type] || 0) + 1;
            return acc;
        }, {});

        const activityData = Object.entries(activityDistribution).map(([type, count]) => ({
            name: getActivityName(type),
            value: count
        }));

        // Performance trends
        const performanceData = analyticsData.map((session, index) => ({
            session: index + 1,
            accuracy: session.performance_metrics?.accuracy_percentage || 0,
            confidence: session.performance_metrics?.confidence_level * 20 || 0,
            completion: session.performance_metrics?.completion_percentage || 0
        }));

        // Learning style radar
        const learningStyleData = [
            { subject: 'تصویری', A: 85, fullMark: 100 },
            { subject: 'شنیداری', A: 75, fullMark: 100 },
            { subject: 'عملی', A: 90, fullMark: 100 },
            { subject: 'خواندن', A: 80, fullMark: 100 },
            { subject: 'تعامل', A: 95, fullMark: 100 }
        ];

        return {
            dailyStudyData,
            activityData,
            performanceData,
            learningStyleData
        };
    };

    const getActivityName = (type) => {
        const names = {
            'resource_study': 'مطالعه منابع',
            'case_analysis': 'تحلیل کیس',
            'surgery_practice': 'تمرین جراحی',
            'voice_interaction': 'تعامل صوتی',
            'quiz_attempt': 'آزمون'
        };
        return names[type] || type;
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'major': return 'bg-red-100 text-red-800';
            case 'moderate': return 'bg-yellow-100 text-yellow-800';
            case 'minor': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const chartData = processChartData();
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f'];

    const totalStudyTime = analyticsData.reduce((sum, session) => sum + session.duration_minutes, 0);
    const avgSessionLength = analyticsData.length > 0 ? totalStudyTime / analyticsData.length : 0;
    const avgAccuracy = analyticsData.reduce((sum, session) => 
        sum + (session.performance_metrics?.accuracy_percentage || 0), 0) / analyticsData.length || 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">آنالیتیکس پیشرفته</h1>
                    <p className="text-gray-600">تحلیل جامع پیشرفت یادگیری صنم جان</p>
                </div>
                
                <div className="flex gap-3">
                    {['week', 'month', 'quarter', 'year'].map((range) => (
                        <Button
                            key={range}
                            variant={timeRange === range ? "default" : "outline"}
                            onClick={() => setTimeRange(range)}
                            className="rounded-2xl"
                        >
                            {range === 'week' ? 'هفته' : 
                             range === 'month' ? 'ماه' : 
                             range === 'quarter' ? 'سه‌ماهه' : 'سال'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 mb-1">مجموع مطالعه</p>
                                <p className="text-3xl font-bold text-blue-800">
                                    {Math.floor(totalStudyTime / 60)}:{(totalStudyTime % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 mb-1">میانگین دقت</p>
                                <p className="text-3xl font-bold text-green-800">{avgAccuracy.toFixed(1)}%</p>
                            </div>
                            <Target className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 mb-1">جلسات مطالعه</p>
                                <p className="text-3xl font-bold text-purple-800">{analyticsData.length}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 mb-1">میانگین جلسه</p>
                                <p className="text-3xl font-bold text-orange-800">{avgSessionLength.toFixed(0)} دقیقه</p>
                            </div>
                            <Zap className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analytics */}
            <Tabs value={selectedMetrics} onValueChange={setSelectedMetrics}>
                <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                    <TabsTrigger value="overview" className="rounded-2xl">کلی</TabsTrigger>
                    <TabsTrigger value="performance" className="rounded-2xl">عملکرد</TabsTrigger>
                    <TabsTrigger value="learning" className="rounded-2xl">یادگیری</TabsTrigger>
                    <TabsTrigger value="insights" className="rounded-2xl">بینش‌ها</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Daily Study Time Chart */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    زمان مطالعه روزانه
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData.dailyStudyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Activity Distribution */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <PieChartIcon className="w-5 h-5 text-green-600" />
                                    توزیع فعالیت‌ها
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.activityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {chartData.activityData?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-purple-600" />
                                روند عملکرد
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={chartData.performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="session" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="accuracy" stroke="#8884d8" name="دقت" />
                                    <Line type="monotone" dataKey="confidence" stroke="#82ca9d" name="اعتماد به نفس" />
                                    <Line type="monotone" dataKey="completion" stroke="#ffc658" name="تکمیل" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="learning" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-indigo-600" />
                                سبک یادگیری
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={chartData.learningStyleData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar name="سبک یادگیری" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                    {isGeneratingInsights ? (
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                            <CardContent className="p-8 text-center">
                                <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
                                <h3 className="text-xl font-bold text-blue-800 mb-2">در حال تحلیل...</h3>
                                <p className="text-blue-600">صنم جان، دارم آمار یادگیرت رو تحلیل می‌کنم!</p>
                            </CardContent>
                        </Card>
                    ) : insightsData ? (
                        <div className="space-y-6">
                            {/* Motivational Message */}
                            <Card className="bg-gradient-to-r from-pink-100 to-rose-100 border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Lightbulb className="w-6 h-6 text-pink-600" />
                                        <h3 className="text-lg font-bold text-gray-800">پیام انگیزشی</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{insightsData.motivational_message}</p>
                                </CardContent>
                            </Card>

                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Strengths & Improvements */}
                                <Card className="bg-white/80 backdrop-blur-sm border-0">
                                    <CardHeader>
                                        <CardTitle className="text-green-700">نقاط قوت</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {insightsData.learning_strengths?.map((strength, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                    <span className="text-gray-700">{strength}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm border-0">
                                    <CardHeader>
                                        <CardTitle className="text-orange-700">نواحی بهبود</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {insightsData.improvement_areas?.map((area, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                    <span className="text-gray-700">{area}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Knowledge Gaps */}
                            {insightsData.knowledge_gaps?.length > 0 && (
                                <Card className="bg-white/80 backdrop-blur-sm border-0">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <Target className="w-5 h-5 text-red-600" />
                                            شکاف‌های دانش
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {insightsData.knowledge_gaps.map((gap, index) => (
                                                <div key={index} className="p-4 rounded-2xl border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium text-gray-800">{gap.topic}</h4>
                                                        <Badge className={getSeverityColor(gap.severity)}>
                                                            {gap.severity === 'major' ? 'مهم' : 
                                                             gap.severity === 'moderate' ? 'متوسط' : 'جزئی'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{gap.recommendation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Personalized Goals */}
                            {insightsData.personalized_goals?.length > 0 && (
                                <Card className="bg-white/80 backdrop-blur-sm border-0">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            اهداف شخصی‌سازی شده
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {insightsData.personalized_goals.map((goal, index) => (
                                                <div key={index} className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium text-gray-800">{goal.goal}</h4>
                                                        <Badge variant="outline">
                                                            {new Date(goal.target_date).toLocaleDateString('fa-IR')}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {goal.action_steps?.map((step, stepIndex) => (
                                                            <div key={stepIndex} className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                                <span className="text-sm text-gray-600">{step}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                            <CardContent className="p-8 text-center">
                                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">هنوز داده‌ای برای تحلیل نیست</h3>
                                <p className="text-gray-600 mb-4">صنم جان، کمی بیشتر مطالعه کن تا بتونم تحلیل جامعی برات ارائه بدم!</p>
                                <Button onClick={() => generateAIInsights(analyticsData)} className="rounded-2xl">
                                    تحلیل مجدد
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}