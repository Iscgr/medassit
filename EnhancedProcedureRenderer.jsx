import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Play, 
    Pause, 
    SkipForward, 
    SkipBack, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Target, 
    Brain,
    Zap,
    Eye,
    Hand,
    Timer,
    Award,
    TrendingUp,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ADVANCED PROCEDURE RENDERER WITH REAL-TIME PERFORMANCE TRACKING
export default function EnhancedProcedureRenderer({ 
    procedure, 
    currentStep, 
    onStepChange, 
    onDecisionMade, 
    userSession,
    realTimeMetrics = null 
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedDecision, setSelectedDecision] = useState(null);
    const [stepStartTime, setStepStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [performanceScore, setPerformanceScore] = useState(0);
    const [focusMode, setFocusMode] = useState(false);
    const [visualAids, setVisualAids] = useState(true);
    const [immersiveMode, setImmersiveMode] = useState(false);
    
    // Advanced interaction tracking
    const [interactionMetrics, setInteractionMetrics] = useState({
        decisionTime: [],
        accuracyRate: 0,
        consistencyScore: 0,
        engagementLevel: 0
    });

    const timerRef = useRef(null);
    const stepRef = useRef(null);
    
    // Auto-play functionality
    useEffect(() => {
        if (isPlaying && procedure?.steps?.[currentStep]) {
            const stepDuration = (procedure.steps[currentStep].duration_minutes || 5) * 1000; // Convert to ms for demo
            
            timerRef.current = setTimeout(() => {
                if (currentStep < procedure.steps.length - 1) {
                    handleNextStep();
                } else {
                    setIsPlaying(false);
                }
            }, stepDuration / playbackSpeed);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isPlaying, currentStep, playbackSpeed, procedure]);

    // Real-time timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Date.now() - stepStartTime);
        }, 100);

        return () => clearInterval(interval);
    }, [stepStartTime]);

    // Performance calculation
    useEffect(() => {
        if (realTimeMetrics) {
            const avgScore = Object.values(realTimeMetrics).reduce((sum, val) => sum + (val || 0), 0) / 5;
            setPerformanceScore(Math.round(avgScore));
        }
    }, [realTimeMetrics]);

    const handleNextStep = useCallback(() => {
        if (currentStep < (procedure?.steps?.length - 1)) {
            onStepChange(currentStep + 1);
            setStepStartTime(Date.now());
            setSelectedDecision(null);
            
            // Scroll to new step
            stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep, procedure, onStepChange]);

    const handlePrevStep = useCallback(() => {
        if (currentStep > 0) {
            onStepChange(currentStep - 1);
            setStepStartTime(Date.now());
            setSelectedDecision(null);
        }
    }, [currentStep, onStepChange]);

    const handleDecisionSubmit = useCallback(() => {
        if (selectedDecision !== null) {
            const decisionTime = Date.now() - stepStartTime;
            
            // Track interaction metrics
            setInteractionMetrics(prev => ({
                ...prev,
                decisionTime: [...prev.decisionTime, decisionTime].slice(-10) // Keep last 10
            }));

            onDecisionMade(selectedDecision, decisionTime);
            setSelectedDecision(null);
        }
    }, [selectedDecision, stepStartTime, onDecisionMade]);

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    if (!procedure || !procedure.steps || procedure.steps.length === 0) {
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-8 text-center">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">آماده برای شروع</h3>
                    <p className="text-gray-500">جراحی انتخاب کنید یا جراحی جدید ایجاد کنید</p>
                </CardContent>
            </Card>
        );
    }

    const currentStepData = procedure.steps[currentStep];
    const progressPercentage = ((currentStep + 1) / procedure.steps.length) * 100;

    return (
        <div className={`space-y-6 ${immersiveMode ? 'fixed inset-0 z-50 bg-gray-900 p-8 overflow-y-auto' : ''}`}>
            {/* Advanced Control Panel */}
            <Card className={`${immersiveMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 backdrop-blur-xl border-0'}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle className={`${immersiveMode ? 'text-white' : 'text-gray-800'}`}>
                                {procedure.title}
                            </CardTitle>
                            <Badge className="bg-blue-100 text-blue-800">
                                مرحله {currentStep + 1} از {procedure.steps.length}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {/* Performance Indicator */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                                <Activity className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                    {performanceScore}%
                                </span>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full">
                                <Timer className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-600">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>

                            {/* Mode Toggles */}
                            <Button
                                variant={focusMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFocusMode(!focusMode)}
                                className="rounded-xl"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                                variant={immersiveMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setImmersiveMode(!immersiveMode)}
                                className="rounded-xl"
                            >
                                <Target className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>پیشرفت کلی</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevStep}
                            disabled={currentStep === 0}
                            className="rounded-xl"
                        >
                            <SkipBack className="w-4 h-4" />
                        </Button>

                        <Button
                            variant={isPlaying ? "destructive" : "default"}
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="rounded-xl px-8"
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    توقف
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    شروع
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextStep}
                            disabled={currentStep >= procedure.steps.length - 1}
                            className="rounded-xl"
                        >
                            <SkipForward className="w-4 h-4" />
                        </Button>

                        {/* Speed Control */}
                        <select
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                            className="px-3 py-1 border rounded-xl text-sm"
                        >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Metrics Dashboard */}
            {realTimeMetrics && !focusMode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                >
                    {Object.entries(realTimeMetrics).map(([metric, value]) => (
                        <Card key={metric} className={`${immersiveMode ? 'bg-gray-800/90 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-0'}`}>
                            <CardContent className="p-3 text-center">
                                <div className={`text-lg font-bold ${immersiveMode ? 'text-white' : 'text-blue-600'}`}>
                                    {Math.round(value || 0)}
                                </div>
                                <div className={`text-xs ${immersiveMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                                    {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}

            {/* Main Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    ref={stepRef}
                >
                    <Card className={`${immersiveMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 backdrop-blur-xl border-0'}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className={`${immersiveMode ? 'text-white' : 'text-rose-700'} flex items-center gap-2`}>
                                    <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl">
                                        <Brain className="w-5 h-5 text-rose-600" />
                                    </div>
                                    مرحله {currentStep + 1}: {currentStepData.title}
                                </CardTitle>
                                
                                <div className="flex items-center gap-2">
                                    <Badge 
                                        className={`${
                                            currentStepData.critical_importance === 'critical' ? 'bg-red-100 text-red-800' :
                                            currentStepData.critical_importance === 'high' ? 'bg-orange-100 text-orange-800' :
                                            currentStepData.critical_importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {currentStepData.critical_importance || 'متوسط'}
                                    </Badge>
                                    
                                    {currentStepData.duration_minutes && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {currentStepData.duration_minutes} دقیقه
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {/* Step Description */}
                            <div className={`leading-relaxed ${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {currentStepData.detailed_description}
                            </div>

                            {/* Tabbed Content */}
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="details">جزئیات</TabsTrigger>
                                    <TabsTrigger value="objectives">اهداف</TabsTrigger>
                                    <TabsTrigger value="safety">ایمنی</TabsTrigger>
                                    <TabsTrigger value="tips">نکات</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4">
                                    {/* Anatomical Focus */}
                                    {currentStepData.anatomical_focus && (
                                        <Alert>
                                            <Target className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>تمرکز آناتومیک:</strong> {currentStepData.anatomical_focus}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Required Instruments */}
                                    {currentStepData.instruments_required && currentStepData.instruments_required.length > 0 && (
                                        <div>
                                            <h4 className={`font-semibold mb-2 ${immersiveMode ? 'text-white' : 'text-gray-800'}`}>ابزارهای مورد نیاز:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {currentStepData.instruments_required.map((instrument, i) => (
                                                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                                                        <Hand className="w-3 h-3" />
                                                        {instrument}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="objectives" className="space-y-4">
                                    {currentStepData.learning_objectives && currentStepData.learning_objectives.length > 0 && (
                                        <div>
                                            <h4 className={`font-semibold mb-3 ${immersiveMode ? 'text-white' : 'text-gray-800'}`}>اهداف یادگیری:</h4>
                                            <ul className="space-y-2">
                                                {currentStepData.learning_objectives.map((objective, i) => (
                                                    <li key={i} className={`flex items-start gap-2 ${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        {objective}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="safety" className="space-y-4">
                                    {/* Safety Protocols */}
                                    {currentStepData.safety_protocols && currentStepData.safety_protocols.length > 0 && (
                                        <div>
                                            <h4 className={`font-semibold mb-3 ${immersiveMode ? 'text-white' : 'text-gray-800'}`}>پروتکل‌های ایمنی:</h4>
                                            <ul className="space-y-2">
                                                {currentStepData.safety_protocols.map((protocol, i) => (
                                                    <li key={i} className={`flex items-start gap-2 ${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                        {protocol}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Potential Complications */}
                                    {currentStepData.potential_complications && currentStepData.potential_complications.length > 0 && (
                                        <Alert className="border-red-200 bg-red-50">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <AlertDescription>
                                                <strong>عوارض احتمالی:</strong> {currentStepData.potential_complications.join(', ')}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </TabsContent>

                                <TabsContent value="tips" className="space-y-4">
                                    {/* Clinical Pearls */}
                                    {currentStepData.clinical_pearls && currentStepData.clinical_pearls.length > 0 && (
                                        <div>
                                            <h4 className={`font-semibold mb-3 ${immersiveMode ? 'text-white' : 'text-gray-800'}`}>نکات کلینیکی:</h4>
                                            <div className="space-y-3">
                                                {currentStepData.clinical_pearls.map((pearl, i) => (
                                                    <div key={i} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                                        <div className="flex items-start gap-2">
                                                            <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                            <span className={`text-sm ${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {pearl}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Decision Points */}
                            {currentStepData.decision_points && currentStepData.decision_points.length > 0 && (
                                <div className="mt-8">
                                    <h4 className={`font-bold text-lg mb-4 ${immersiveMode ? 'text-white' : 'text-fuchsia-800'} flex items-center gap-2`}>
                                        <Brain className="w-5 h-5" />
                                        نقطه تصمیم‌گیری
                                    </h4>
                                    
                                    {currentStepData.decision_points.map((decisionPoint, dpIndex) => (
                                        <div key={dpIndex} className="space-y-4">
                                            <Alert className="bg-blue-50 border-blue-200">
                                                <Brain className="h-4 w-4 text-blue-600" />
                                                <AlertDescription>
                                                    <strong>سناریو:</strong> {decisionPoint.scenario}
                                                </AlertDescription>
                                            </Alert>
                                            
                                            <p className={`mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg ${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {decisionPoint.question}
                                            </p>

                                            <div className="space-y-3">
                                                {decisionPoint.options.map((option, optIndex) => (
                                                    <motion.div
                                                        key={optIndex}
                                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                            selectedDecision === optIndex
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : immersiveMode 
                                                                    ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                        onClick={() => setSelectedDecision(optIndex)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                                selectedDecision === optIndex 
                                                                    ? 'border-blue-500 bg-blue-500' 
                                                                    : immersiveMode 
                                                                        ? 'border-gray-400' 
                                                                        : 'border-gray-300'
                                                            }`}>
                                                                {selectedDecision === optIndex && (
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`${immersiveMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    {option.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="flex justify-center mt-6">
                                                <Button 
                                                    onClick={handleDecisionSubmit} 
                                                    disabled={selectedDecision === null} 
                                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
                                                    size="lg"
                                                >
                                                    تأیید تصمیم
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}