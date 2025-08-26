import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Brain, 
    Target, 
    TrendingUp, 
    BookOpen, 
    Lightbulb,
    Search,
    Filter,
    Star,
    Clock,
    Award,
    Map,
    Compass,
    ChevronRight,
    Zap,
    Eye,
    CheckCircle2,
    ArrowRight,
    Activity,
    BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { learningJourney } from "@/api/functions";
import { knowledgeRetriever } from "@/api/functions";

// ADVANCED KNOWLEDGE RECOMMENDATION ENGINE
export default function KnowledgeRecommendationEngine({ userId, onRecommendationSelect }) {
    const [isLoading, setIsLoading] = useState(true);
    const [recommendations, setRecommendations] = useState(null);
    const [learningProfile, setLearningProfile] = useState(null);
    const [knowledgeGaps, setKnowledgeGaps] = useState([]);
    const [currentFocus, setCurrentFocus] = useState('immediate_actions');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [progressData, setProgressData] = useState(null);
    const [visualizationMode, setVisualizationMode] = useState('pathway');

    // Load learning analytics and recommendations
    useEffect(() => {
        loadRecommendations();
    }, [userId]);

    const loadRecommendations = async () => {
        setIsLoading(true);
        try {
            const analysisResponse = await learningJourney({ action: 'analyzeAndGet' });
            const analysis = analysisResponse.data || analysisResponse;

            setRecommendations(analysis.personalized_recommendations || {});
            setLearningProfile(analysis.user_profile || {});
            setKnowledgeGaps(analysis.knowledge_gaps?.identified_gaps || []);
            setProgressData(analysis.progress_analytics || {});
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            // Fallback recommendations
            setRecommendations({
                immediate_actions: [
                    {
                        title: 'شروع با مطالعه آناتومی پایه',
                        description: 'مطالعه سیستماتیک آناتومی حیوانات خانگی',
                        priority: 'high',
                        estimated_time: 45,
                        category: 'study',
                        page: 'AcademicAssistant'
                    }
                ],
                weekly_goals: [],
                monthly_objectives: []
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Filter recommendations based on search and filters
    const filterRecommendations = useCallback((recs) => {
        if (!recs) return [];
        
        return recs.filter(rec => {
            const matchesSearch = !searchQuery || 
                rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rec.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesFilters = selectedFilters.length === 0 || 
                selectedFilters.includes(rec.priority) ||
                selectedFilters.includes(rec.category);
            
            return matchesSearch && matchesFilters;
        });
    }, [searchQuery, selectedFilters]);

    // Render learning pathway visualization
    const renderLearningPathway = () => {
        if (!recommendations || !progressData) return null;

        const pathwayData = [
            { 
                phase: 'Foundation', 
                progress: 75, 
                color: 'bg-blue-500',
                items: recommendations.immediate_actions || []
            },
            { 
                phase: 'Development', 
                progress: 40, 
                color: 'bg-green-500',
                items: recommendations.weekly_goals || []
            },
            { 
                phase: 'Mastery', 
                progress: 15, 
                color: 'bg-purple-500',
                items: recommendations.monthly_objectives || []
            }
        ];

        return (
            <div className="space-y-6">
                {pathwayData.map((phase, index) => (
                    <motion.div
                        key={phase.phase}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="relative"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-4 h-4 rounded-full ${phase.color}`}></div>
                            <h3 className="text-lg font-bold text-gray-800">{phase.phase}</h3>
                            <Badge className="bg-gray-100 text-gray-700">
                                {phase.progress}% کامل شده
                            </Badge>
                        </div>
                        
                        <div className="mr-8">
                            <Progress value={phase.progress} className="mb-4" />
                            
                            <div className="grid gap-3">
                                {phase.items.slice(0, 3).map((item, i) => (
                                    <Card key={i} className="bg-white/70 hover:bg-white/90 transition-all cursor-pointer"
                                          onClick={() => onRecommendationSelect && onRecommendationSelect(item)}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800 mb-1">{item.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                                                            {item.priority === 'high' ? 'اولویت بالا' : 'اولویت متوسط'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {item.estimated_time} دقیقه
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {index < pathwayData.length - 1 && (
                            <div className="absolute right-2 top-16 w-0.5 h-20 bg-gray-300"></div>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    };

    // Render knowledge gaps analysis
    const renderKnowledgeGaps = () => {
        if (!knowledgeGaps || knowledgeGaps.length === 0) {
            return (
                <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">هیچ خلاء دانشی اساسی شناسایی نشد!</p>
                </div>
            );
        }

        return (
            <div className="grid gap-4">
                {knowledgeGaps.map((gap, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border-l-4 ${
                            gap.gap_severity === 'major' ? 'border-l-red-500 bg-red-50' :
                            gap.gap_severity === 'minor' ? 'border-l-yellow-500 bg-yellow-50' :
                            'border-l-green-500 bg-green-50'
                        }`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">{gap.skill}</h3>
                                        <p className="text-gray-600 mb-2">حوزه: {gap.domain}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm">امتیاز فعلی:</span>
                                            <Progress value={gap.current_score} className="w-24" />
                                            <span className="text-sm font-medium">{gap.current_score}%</span>
                                        </div>
                                    </div>
                                    <Badge variant={gap.gap_severity === 'major' ? 'destructive' : 'secondary'}>
                                        {gap.gap_severity === 'major' ? 'خلاء مهم' : 'خلاء جزئی'}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-800">اقدامات پیشنهادی:</h4>
                                    {gap.recommended_actions?.map((action, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    };

    // Render learning profile
    const renderLearningProfile = () => {
        if (!learningProfile) return null;

        return (
            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Brain className="w-6 h-6 text-purple-600" />
                            پروفایل یادگیری شما
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">سبک یادگیری:</h4>
                                <Badge className="bg-purple-100 text-purple-800 mb-4">
                                    {learningProfile.learning_style === 'visual_kinesthetic' ? 'بصری-حرکتی' : learningProfile.learning_style}
                                </Badge>
                                
                                <h4 className="font-medium text-gray-800 mb-3">نقاط قوت:</h4>
                                <div className="space-y-1">
                                    {learningProfile.strengths?.map((strength, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm">{strength}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-800 mb-3">روش‌های توصیه شده:</h4>
                                <div className="space-y-2">
                                    {learningProfile.recommended_strategies?.map((strategy, i) => (
                                        <Badge key={i} variant="outline" className="mr-2 mb-2">
                                            {strategy}
                                        </Badge>
                                    ))}
                                </div>

                                <h4 className="font-medium text-gray-800 mb-3 mt-4">چالش‌ها:</h4>
                                <div className="space-y-1">
                                    {learningProfile.challenges?.map((challenge, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm">{challenge}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">سیستم توصیه‌های هوشمند</h2>
                    <p className="text-gray-600">مسیر یادگیری شخصی‌سازی شده براساس عملکرد شما</p>
                </div>
                
                <div className="flex gap-3">
                    <Input
                        placeholder="جستجو در توصیه‌ها..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Visualization Mode Selector */}
            <div className="flex gap-2">
                <Button
                    variant={visualizationMode === 'pathway' ? 'default' : 'outline'}
                    onClick={() => setVisualizationMode('pathway')}
                    size="sm"
                >
                    <Map className="w-4 h-4 mr-2" />
                    مسیر یادگیری
                </Button>
                <Button
                    variant={visualizationMode === 'gaps' ? 'default' : 'outline'}
                    onClick={() => setVisualizationMode('gaps')}
                    size="sm"
                >
                    <Target className="w-4 h-4 mr-2" />
                    خلاءهای دانش
                </Button>
                <Button
                    variant={visualizationMode === 'profile' ? 'default' : 'outline'}
                    onClick={() => setVisualizationMode('profile')}
                    size="sm"
                >
                    <Brain className="w-4 h-4 mr-2" />
                    پروفایل یادگیری
                </Button>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {visualizationMode === 'pathway' && (
                    <motion.div
                        key="pathway"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {renderLearningPathway()}
                    </motion.div>
                )}

                {visualizationMode === 'gaps' && (
                    <motion.div
                        key="gaps"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {renderKnowledgeGaps()}
                    </motion.div>
                )}

                {visualizationMode === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {renderLearningProfile()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Summary */}
            {progressData && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Activity className="w-6 h-6 text-green-600" />
                            خلاصه پیشرفت کلی
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{progressData.overall_progress || 0}%</div>
                                <div className="text-sm text-gray-600">پیشرفت کلی</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{progressData.knowledge_mastery || 0}%</div>
                                <div className="text-sm text-gray-600">تسلط دانشی</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{progressData.skill_development || 0}%</div>
                                <div className="text-sm text-gray-600">توسعه مهارت</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{progressData.professional_readiness || 0}%</div>
                                <div className="text-sm text-gray-600">آمادگی حرفه‌ای</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}