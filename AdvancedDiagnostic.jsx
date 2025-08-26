import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Stethoscope, 
    Brain, 
    Target, 
    Activity, 
    FileText, 
    Camera, 
    Microscope,
    Heart,
    Thermometer,
    Scale,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Search,
    BookOpen,
    Lightbulb,
    TrendingUp,
    Eye,
    Loader2
} from "lucide-react";
import { clinicalQuestion } from "@/api/functions";
import { grokLLM } from "@/api/functions";

// ADVANCED DIAGNOSTIC REASONING ENGINE
class VeterinaryDiagnosticEngine {
    constructor() {
        this.diagnosticApproach = {
            signalment_analysis: {
                weight: 15,
                factors: ['species', 'breed', 'age', 'sex', 'reproductive_status']
            },
            clinical_presentation: {
                weight: 30,
                factors: ['chief_complaint', 'duration', 'progression', 'severity']
            },
            physical_examination: {
                weight: 25,
                factors: ['vital_signs', 'body_systems', 'pain_assessment', 'body_condition']
            },
            diagnostic_tests: {
                weight: 20,
                factors: ['laboratory', 'imaging', 'specialized_tests']
            },
            differential_diagnosis: {
                weight: 10,
                factors: ['likelihood', 'severity', 'treatability', 'cost']
            }
        };

        this.clinicalReasoningSteps = [
            'signalment_evaluation',
            'history_gathering', 
            'physical_examination',
            'problem_list_creation',
            'differential_diagnosis',
            'diagnostic_plan',
            'treatment_planning',
            'prognosis_assessment'
        ];
    }

    // Comprehensive case analysis
    async analyzeClinicalCase(caseData) {
        const analysis = {
            case_summary: '',
            signalment_significance: '',
            clinical_assessment: '',
            differential_diagnoses: [],
            diagnostic_recommendations: [],
            treatment_approach: '',
            prognosis: '',
            educational_notes: [],
            confidence_score: 0
        };

        try {
            // Step 1: Signalment Analysis
            analysis.signalment_significance = await this.analyzeSignalment(caseData);
            
            // Step 2: Clinical Presentation Analysis
            analysis.clinical_assessment = await this.analyzeClinicalPresentation(caseData);
            
            // Step 3: Generate Differential Diagnoses
            analysis.differential_diagnoses = await this.generateDifferentialDiagnoses(caseData);
            
            // Step 4: Diagnostic Plan
            analysis.diagnostic_recommendations = await this.createDiagnosticPlan(caseData, analysis.differential_diagnoses);
            
            // Step 5: Treatment Approach
            analysis.treatment_approach = await this.developTreatmentApproach(caseData, analysis.differential_diagnoses);
            
            // Step 6: Educational Content
            analysis.educational_notes = await this.generateEducationalContent(caseData, analysis);
            
            // Step 7: Calculate Confidence
            analysis.confidence_score = this.calculateConfidenceScore(caseData, analysis);
            
            return analysis;
            
        } catch (error) {
            console.error('Diagnostic analysis error:', error);
            return this.generateFallbackAnalysis(caseData);
        }
    }

    async analyzeSignalment(caseData) {
        const prompt = `
        تحلیل signalment کامل برای موارد زیر:
        - گونه: ${caseData.species || 'نامشخص'}
        - نژاد: ${caseData.breed || 'نامشخص'} 
        - سن: ${caseData.age || 'نامشخص'}
        - جنسیت: ${caseData.gender || 'نامشخص'}
        
        بیماری‌های شایع در این signalment و اهمیت بالینی آن را شرح دهید.
        پاسخ باید شامل:
        1. بیماری‌های مرتبط با نژاد
        2. بیماری‌های مرتبط با سن
        3. بیماری‌های مرتبط با جنسیت
        4. نکات مهم برای تشخیص
        `;

        try {
            const response = await grokLLM({ prompt });
            return response.reply || 'تحلیل signalment در دسترس نیست';
        } catch (error) {
            return 'خطا در تحلیل signalment - بررسی دستی مورد نیاز است';
        }
    }

    async analyzeClinicalPresentation(caseData) {
        const prompt = `
        تحلیل کامل presentation کلینیکی:
        
        علائم اصلی: ${caseData.chief_complaint || 'ارائه نشده'}
        تاریخچه: ${caseData.history || 'ارائه نشده'}
        معاینه فیزیکی: ${caseData.physical_exam || 'ارائه نشده'}
        علائم حیاتی: ${JSON.stringify(caseData.vital_signs || {})}
        
        لطفاً یک تحلیل سیستماتیک ارائه دهید که شامل:
        1. الگوی علائم و احتمال‌های تشخیصی
        2. علائم Red Flag که نیاز به اقدام فوری دارند
        3. سیستم‌های درگیر احتمالی
        4. شدت و فوریت وضعیت
        5. نکات مهم برای ادامه کار تشخیصی
        `;

        try {
            const response = await grokLLM({ prompt });
            return response.reply || 'تحلیل presentation در دسترس نیست';
        } catch (error) {
            return 'خطا در تحلیل presentation - بررسی دستی مورد نیاز است';
        }
    }

    async generateDifferentialDiagnoses(caseData) {
        const prompt = `
        بر اساس اطلاعات کیس زیر، لیست کاملی از differential diagnoses ارائه دهید:
        
        Signalment: ${caseData.species} ${caseData.breed} ${caseData.age} ${caseData.gender}
        Chief Complaint: ${caseData.chief_complaint}
        History: ${caseData.history || 'ارائه نشده'}
        Physical Exam: ${caseData.physical_exam || 'ارائه نشده'}
        
        برای هر تشخیص احتمالی موارد زیر را مشخص کنید:
        1. احتمال (High/Medium/Low)
        2. شدت و فوریت (Critical/High/Medium/Low)
        3. دلیل inclusion
        4. علائم حمایت‌کننده
        5. علائم against
        6. تست‌های تشخیصی مورد نیاز برای تأیید/رد
        
        حداقل 5-7 differential diagnosis ارائه دهید مرتب شده بر اساس احتمال.
        `;

        try {
            const response = await grokLLM({ prompt });
            
            // Parse response to structured format
            const differentials = this.parseDifferentialDiagnoses(response.reply);
            return differentials.length > 0 ? differentials : this.generateFallbackDifferentials(caseData);
            
        } catch (error) {
            return this.generateFallbackDifferentials(caseData);
        }
    }

    parseDifferentialDiagnoses(responseText) {
        const differentials = [];
        
        try {
            // Simple parsing logic - in production, this would be more sophisticated
            const lines = responseText.split('\n');
            let currentDiagnosis = null;
            
            lines.forEach(line => {
                line = line.trim();
                
                // Look for numbered diagnosis entries
                if (line.match(/^\d+[\.\)]/)) {
                    if (currentDiagnosis) {
                        differentials.push(currentDiagnosis);
                    }
                    
                    currentDiagnosis = {
                        diagnosis: line.replace(/^\d+[\.\)]\s*/, '').split(':')[0].trim(),
                        likelihood: 'medium',
                        severity: 'medium', 
                        rationale: '',
                        supporting_signs: [],
                        against_signs: [],
                        required_tests: []
                    };
                }
                
                // Extract likelihood
                if (line.toLowerCase().includes('احتمال') || line.toLowerCase().includes('likelihood')) {
                    if (line.toLowerCase().includes('high') || line.toLowerCase().includes('بالا')) {
                        currentDiagnosis.likelihood = 'high';
                    } else if (line.toLowerCase().includes('low') || line.toLowerCase().includes('پایین')) {
                        currentDiagnosis.likelihood = 'low';
                    }
                }
                
                // Extract severity
                if (line.toLowerCase().includes('شدت') || line.toLowerCase().includes('severity')) {
                    if (line.toLowerCase().includes('critical') || line.toLowerCase().includes('بحرانی')) {
                        currentDiagnosis.severity = 'critical';
                    } else if (line.toLowerCase().includes('high') || line.toLowerCase().includes('بالا')) {
                        currentDiagnosis.severity = 'high';
                    }
                }
                
                // Collect rationale
                if (currentDiagnosis && line.length > 20 && !line.includes(':')) {
                    currentDiagnosis.rationale += line + ' ';
                }
            });
            
            if (currentDiagnosis) {
                differentials.push(currentDiagnosis);
            }
            
        } catch (error) {
            console.error('Error parsing differentials:', error);
        }
        
        return differentials.slice(0, 7); // Return max 7 differentials
    }

    generateFallbackDifferentials(caseData) {
        // Basic fallback differentials based on species and complaint
        const common = [
            {
                diagnosis: 'عفونت باکتریایی',
                likelihood: 'medium',
                severity: 'medium',
                rationale: 'علائم عمومی سازگار با عفونت',
                supporting_signs: ['تب', 'لتارژی'],
                against_signs: [],
                required_tests: ['CBC', 'کشت']
            },
            {
                diagnosis: 'اختلال متابولیک',
                likelihood: 'low',
                severity: 'high',
                rationale: 'نیاز به بررسی بیشتر',
                supporting_signs: [],
                against_signs: [],
                required_tests: ['بیوشیمی سرم']
            }
        ];
        
        return common;
    }

    async createDiagnosticPlan(caseData, differentials) {
        const prompt = `
        بر اساس differential diagnoses زیر، یک diagnostic plan کامل ارائه دهید:
        
        ${differentials.map((d, i) => `${i+1}. ${d.diagnosis} (احتمال: ${d.likelihood})`).join('\n')}
        
        Diagnostic plan باید شامل:
        1. تست‌های اولیه (First-line tests)
        2. تست‌های تخصصی (Specialized tests)
        3. اولویت‌بندی تست‌ها
        4. تفسیر نتایج مورد انتظار
        5. تست‌های follow-up
        6. هزینه‌ها و considerations عملی
        
        برای هر تست مشخص کنید:
        - هدف (چه چیزی را rule in/out می‌کند)
        - اولویت (Urgent/High/Medium/Low)
        - هزینه نسبی (High/Medium/Low)
        - زمان مورد نیاز
        `;

        try {
            const response = await grokLLM({ prompt });
            return this.parseDiagnosticPlan(response.reply);
        } catch (error) {
            return this.generateFallbackDiagnosticPlan(differentials);
        }
    }

    parseDiagnosticPlan(responseText) {
        const plan = [];
        
        try {
            const lines = responseText.split('\n');
            let currentTest = null;
            
            lines.forEach(line => {
                line = line.trim();
                
                if (line.match(/^\d+[\.\)]/)) {
                    if (currentTest) {
                        plan.push(currentTest);
                    }
                    
                    currentTest = {
                        test_name: line.replace(/^\d+[\.\)]\s*/, '').split(':')[0].trim(),
                        purpose: '',
                        priority: 'medium',
                        cost: 'medium',
                        timeline: 'روز همان',
                        interpretation: ''
                    };
                }
                
                if (currentTest && line.length > 10) {
                    if (line.toLowerCase().includes('هدف') || line.toLowerCase().includes('purpose')) {
                        currentTest.purpose += line.replace(/.*[:：]\s*/, '');
                    }
                    
                    if (line.toLowerCase().includes('اولویت') || line.toLowerCase().includes('priority')) {
                        if (line.toLowerCase().includes('urgent') || line.toLowerCase().includes('فوری')) {
                            currentTest.priority = 'urgent';
                        } else if (line.toLowerCase().includes('high') || line.toLowerCase().includes('بالا')) {
                            currentTest.priority = 'high';
                        }
                    }
                }
            });
            
            if (currentTest) {
                plan.push(currentTest);
            }
            
        } catch (error) {
            console.error('Error parsing diagnostic plan:', error);
        }
        
        return plan.slice(0, 10);
    }

    generateFallbackDiagnosticPlan(differentials) {
        return [
            {
                test_name: 'CBC (شمارش کامل خون)',
                purpose: 'بررسی عفونت، التهاب، آنمی',
                priority: 'high',
                cost: 'low',
                timeline: 'همان روز',
                interpretation: 'افزایش WBC نشانه عفونت'
            },
            {
                test_name: 'بیوشیمی سرم',
                purpose: 'ارزیابی عملکرد ارگان‌ها',
                priority: 'high',
                cost: 'medium',
                timeline: 'همان روز',
                interpretation: 'بررسی کبد، کلیه، قند خون'
            },
            {
                test_name: 'تحلیل ادرار',
                purpose: 'ارزیابی عملکرد کلیه و مثانه',
                priority: 'medium',
                cost: 'low',
                timeline: 'همان روز',
                interpretation: 'بررسی عفونت ادراری، عملکرد کلیه'
            }
        ];
    }

    async developTreatmentApproach(caseData, differentials) {
        const prompt = `
        بر اساس differential diagnoses، یک treatment approach جامع ارائه دهید:
        
        مهم‌ترین احتمالات تشخیصی:
        ${differentials.slice(0, 3).map(d => `- ${d.diagnosis} (${d.likelihood})`).join('\n')}
        
        Treatment approach باید شامل:
        1. اقدامات فوری (Emergency interventions)
        2. درمان علامتی (Symptomatic treatment)
        3. درمان اختصاصی برای top differentials
        4. نظارت و monitoring
        5. پیگیری و follow-up
        6. client education
        
        برای هر مرحله درمان مشخص کنید:
        - اولویت زمانی
        - نحوه نظارت
        - علائم بهبود مورد انتظار
        - عوارض احتمالی
        - زمان‌بندی بازنگری
        `;

        try {
            const response = await grokLLM({ prompt });
            return response.reply || 'طرح درمانی نیاز به تدوین دستی دارد';
        } catch (error) {
            return 'خطا در تدوین طرح درمانی - مشورت با متخصص توصیه می‌شود';
        }
    }

    async generateEducationalContent(caseData, analysis) {
        const prompt = `
        برای این کیس کلینیکی، محتوای آموزشی جامع ایجاد کنید:
        
        کیس: ${caseData.species} با ${caseData.chief_complaint}
        
        محتوای آموزشی باید شامل:
        1. نکات کلیدی تشخیصی
        2. اشتباهات شایع در این نوع کیس‌ها
        3. نکات practical برای دامپزشکان جوان
        4. منابع مطالعه بیشتر
        5. سوالات خود ارزیابی
        
        هر بخش باید practical و قابل کاربرد باشد.
        `;

        try {
            const response = await grokLLM({ prompt });
            return this.parseEducationalContent(response.reply);
        } catch (error) {
            return [
                {
                    category: 'نکته کلیدی',
                    content: 'در نظر گیری signalment در تشخیص‌های افتراقی مهم است',
                    importance: 'high'
                },
                {
                    category: 'اشتباه شایع',
                    content: 'عجله در تشخیص بدون جمع‌آوری اطلاعات کافی',
                    importance: 'high'
                }
            ];
        }
    }

    parseEducationalContent(responseText) {
        const content = [];
        const lines = responseText.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (line.length > 20) {
                let category = 'عمومی';
                let importance = 'medium';
                
                if (line.includes('نکته') || line.includes('tip')) {
                    category = 'نکته کلیدی';
                    importance = 'high';
                } else if (line.includes('اشتباه') || line.includes('mistake')) {
                    category = 'اشتباه شایع';
                    importance = 'high';
                } else if (line.includes('منبع') || line.includes('reference')) {
                    category = 'منبع مطالعه';
                    importance = 'medium';
                }
                
                content.push({
                    category,
                    content: line.replace(/^\d+[\.\)]\s*/, ''),
                    importance
                });
            }
        });
        
        return content.slice(0, 8);
    }

    calculateConfidenceScore(caseData, analysis) {
        let score = 0;
        let maxScore = 0;
        
        // Completeness of case data (40 points)
        maxScore += 40;
        if (caseData.chief_complaint) score += 10;
        if (caseData.history) score += 10;
        if (caseData.physical_exam) score += 10;
        if (caseData.vital_signs && Object.keys(caseData.vital_signs).length > 0) score += 10;
        
        // Quality of differential diagnoses (30 points)
        maxScore += 30;
        if (analysis.differential_diagnoses.length >= 3) score += 10;
        if (analysis.differential_diagnoses.length >= 5) score += 10;
        if (analysis.differential_diagnoses.some(d => d.likelihood === 'high')) score += 10;
        
        // Diagnostic plan completeness (20 points)
        maxScore += 20;
        if (analysis.diagnostic_recommendations.length >= 3) score += 10;
        if (analysis.diagnostic_recommendations.some(r => r.priority === 'urgent' || r.priority === 'high')) score += 10;
        
        // Treatment approach (10 points)
        maxScore += 10;
        if (analysis.treatment_approach && analysis.treatment_approach.length > 100) score += 10;
        
        return Math.round((score / maxScore) * 100);
    }

    generateFallbackAnalysis(caseData) {
        return {
            case_summary: 'تحلیل خودکار با مشکل مواجه شد - نیاز به بررسی دستی',
            signalment_significance: 'بررسی signalment مورد نیاز است',
            clinical_assessment: 'ارزیابی کلینیکی مستقل مورد نیاز است',
            differential_diagnoses: this.generateFallbackDifferentials(caseData),
            diagnostic_recommendations: this.generateFallbackDiagnosticPlan([]),
            treatment_approach: 'طرح درمانی نیاز به تدوین توسط دامپزشک دارد',
            prognosis: 'پیش‌آگهی پس از تکمیل تشخیص قابل ارائه است',
            educational_notes: [
                {
                    category: 'توصیه',
                    content: 'در صورت عدم دسترسی به تحلیل هوشمند، از منابع معتبر استفاده کنید',
                    importance: 'high'
                }
            ],
            confidence_score: 30
        };
    }
}

// CLINICAL CASE COMPONENT
export default function AdvancedDiagnostic({ caseData, onAnalysisUpdate, realTimeMode = true }) {
    const [diagnosticEngine] = useState(() => new VeterinaryDiagnosticEngine());
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDifferential, setSelectedDifferential] = useState(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [expandedSections, setExpandedSections] = useState({
        signalment: true,
        differentials: true,
        diagnostics: false,
        treatment: false,
        education: false
    });

    const analysisSteps = [
        { id: 'signalment', label: 'تحلیل Signalment', icon: FileText },
        { id: 'clinical', label: 'ارزیابی کلینیکی', icon: Stethoscope },
        { id: 'differentials', label: 'تشخیص‌های افتراقی', icon: Brain },
        { id: 'diagnostics', label: 'طرح تشخیصی', icon: Microscope },
        { id: 'treatment', label: 'رویکرد درمانی', icon: Heart },
        { id: 'education', label: 'نکات آموزشی', icon: BookOpen }
    ];

    const performAnalysis = useCallback(async () => {
        if (!caseData || isAnalyzing) return;
        
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setCurrentStep(0);

        try {
            // Simulate step-by-step progress
            for (let step = 0; step < analysisSteps.length; step++) {
                setCurrentStep(step);
                setAnalysisProgress(((step + 1) / analysisSteps.length) * 100);
                
                // Add delay for visual feedback
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const result = await diagnosticEngine.analyzeClinicalCase(caseData);
            setAnalysis(result);
            
            if (onAnalysisUpdate) {
                onAnalysisUpdate(result);
            }
            
        } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysis(diagnosticEngine.generateFallbackAnalysis(caseData));
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(100);
        }
    }, [caseData, isAnalyzing, onAnalysisUpdate, diagnosticEngine]);

    useEffect(() => {
        if (caseData && realTimeMode && !analysis) {
            performAnalysis();
        }
    }, [caseData, realTimeMode, analysis, performAnalysis]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getLikelihoodColor = (likelihood) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[likelihood] || 'bg-gray-100 text-gray-800';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'bg-red-200 text-red-900',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800', 
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    if (!caseData) {
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-8 text-center">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">آماده تحلیل کیس</h3>
                    <p className="text-gray-500">کیس کلینیکی را برای شروع تحلیل انتخاب کنید</p>
                </CardContent>
            </Card>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Brain className="w-5 h-5" />
                            در حال تحلیل کیس کلینیکی...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={analysisProgress} className="h-3" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysisSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index === currentStep;
                                const isCompleted = index < currentStep;
                                
                                return (
                                    <div key={step.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                        isActive ? 'border-blue-500 bg-blue-50' :
                                        isCompleted ? 'border-green-500 bg-green-50' : 
                                        'border-gray-200 bg-white'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : isActive ? (
                                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                            ) : (
                                                <Icon className="w-5 h-5 text-gray-400" />
                                            )}
                                            <span className={`text-sm font-medium ${
                                                isActive ? 'text-blue-700' :
                                                isCompleted ? 'text-green-700' :
                                                'text-gray-600'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!analysis) {
        return (
            <Card className="bg-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-8 text-center">
                    <Button onClick={performAnalysis} className="rounded-xl">
                        <Brain className="w-4 h-4 mr-2" />
                        شروع تحلیل کیس
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Analysis Overview */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            تحلیل کیس کلینیکی تکمیل شد
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                                اطمینان: {analysis.confidence_score}%
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={performAnalysis}
                                className="rounded-xl"
                            >
                                <Loader2 className="w-4 h-4 mr-2" />
                                تحلیل مجدد
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Analysis Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">نمای کلی</TabsTrigger>
                    <TabsTrigger value="differentials">تشخیص‌های افتراقی</TabsTrigger>
                    <TabsTrigger value="diagnostics">طرح تشخیصی</TabsTrigger>
                    <TabsTrigger value="treatment">درمان</TabsTrigger>
                    <TabsTrigger value="education">آموزشی</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Signalment Analysis */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <FileText className="w-5 h-5" />
                                تحلیل Signalment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    {analysis.signalment_significance}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinical Assessment */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Stethoscope className="w-5 h-5" />
                                ارزیابی کلینیکی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    {analysis.clinical_assessment}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="differentials" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <Brain className="w-5 h-5" />
                                تشخیص‌های افتراقی ({analysis.differential_diagnoses.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.differential_diagnoses.map((differential, index) => (
                                <div 
                                    key={index} 
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        selectedDifferential === index 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedDifferential(selectedDifferential === index ? null : index)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                                                {index + 1}. {differential.diagnosis}
                                            </h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getLikelihoodColor(differential.likelihood)}>
                                                    احتمال: {differential.likelihood}
                                                </Badge>
                                                <Badge className={getSeverityColor(differential.severity)}>
                                                    شدت: {differential.severity}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedDifferential === index && (
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <h5 className="font-semibold text-gray-800 mb-2">دلیل inclusion:</h5>
                                                <p className="text-gray-700 text-sm">{differential.rationale}</p>
                                            </div>
                                            
                                            {differential.supporting_signs.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-green-700 mb-2">علائم حمایت‌کننده:</h5>
                                                    <ul className="list-disc pr-5 space-y-1">
                                                        {differential.supporting_signs.map((sign, i) => (
                                                            <li key={i} className="text-sm text-gray-700">{sign}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {differential.against_signs.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-red-700 mb-2">علائم against:</h5>
                                                    <ul className="list-disc pr-5 space-y-1">
                                                        {differential.against_signs.map((sign, i) => (
                                                            <li key={i} className="text-sm text-gray-700">{sign}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {differential.required_tests.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-blue-700 mb-2">تست‌های مورد نیاز:</h5>
                                                    <ul className="list-disc pr-5 space-y-1">
                                                        {differential.required_tests.map((test, i) => (
                                                            <li key={i} className="text-sm text-gray-700">{test}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diagnostics" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <Microscope className="w-5 h-5" />
                                طرح تشخیصی ({analysis.diagnostic_recommendations.length} تست)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.diagnostic_recommendations.map((test, index) => (
                                <div key={index} className="p-4 rounded-xl border border-gray-200 bg-white">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 mb-2">
                                                {index + 1}. {test.test_name}
                                            </h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getPriorityColor(test.priority)}>
                                                    اولویت: {test.priority}
                                                </Badge>
                                                <Badge variant="outline">
                                                    هزینه: {test.cost}
                                                </Badge>
                                                <Badge variant="outline">
                                                    <Clock className="w-3 h-3 ml-1" />
                                                    {test.timeline}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div>
                                            <h5 className="font-semibold text-gray-800 text-sm">هدف:</h5>
                                            <p className="text-gray-700 text-sm">{test.purpose}</p>
                                        </div>
                                        
                                        {test.interpretation && (
                                            <div>
                                                <h5 className="font-semibold text-gray-800 text-sm">تفسیر:</h5>
                                                <p className="text-gray-700 text-sm">{test.interpretation}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="treatment" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-pink-700">
                                <Heart className="w-5 h-5" />
                                رویکرد درمانی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {analysis.treatment_approach}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700">
                                <BookOpen className="w-5 h-5" />
                                نکات آموزشی ({analysis.educational_notes.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {analysis.educational_notes.map((note, index) => (
                                <Alert key={index} className="border-indigo-200 bg-indigo-50">
                                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                                    <AlertDescription>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <span className="font-semibold text-indigo-800">{note.category}:</span>
                                                <p className="text-indigo-700 mt-1">{note.content}</p>
                                            </div>
                                            <Badge className={`ml-2 ${
                                                note.importance === 'high' ? 'bg-red-100 text-red-800' :
                                                note.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {note.importance}
                                            </Badge>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}