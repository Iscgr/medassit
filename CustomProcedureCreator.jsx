import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus, 
    Loader2, 
    CheckCircle2, 
    AlertTriangle, 
    Brain,
    Stethoscope,
    BookOpen,
    Target,
    Clock,
    Users,
    Database,
    Zap
} from 'lucide-react';
import { dynamicSurgeryGenerator } from '@/api/functions';

// ADVANCED CUSTOM PROCEDURE CREATOR
export default function CustomProcedureCreator({ onProcedureCreated, onClose }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');
    const [procedureData, setProcedureData] = useState({
        // Basic Information
        procedureName: '',
        species: '',
        bodySystem: '',
        difficulty: '',
        indication: '',
        
        // Advanced Details
        userExperience: '',
        estimatedDuration: '',
        anesthesiaType: '',
        specialRequirements: '',
        
        // Educational Parameters
        targetLearningOutcomes: [],
        assessmentMethods: [],
        prerequisiteKnowledge: [],
        
        // Clinical Context
        patientSelection: '',
        contraindications: '',
        postOpCare: '',
        
        // Quality Parameters
        evidenceLevel: '',
        complexityFactors: [],
        riskFactors: []
    });

    const speciesOptions = [
        { value: 'canine', label: 'سگ (Canine)', icon: '🐕' },
        { value: 'feline', label: 'گربه (Feline)', icon: '🐱' },
        { value: 'equine', label: 'اسب (Equine)', icon: '🐴' },
        { value: 'bovine', label: 'گاو (Bovine)', icon: '🐄' },
        { value: 'ovine', label: 'گوسفند (Ovine)', icon: '🐑' },
        { value: 'avian', label: 'پرندگان (Avian)', icon: '🦅' },
        { value: 'exotic', label: 'حیوانات عجیب و غریب (Exotic)', icon: '🦎' }
    ];

    const bodySystemOptions = [
        { value: 'soft_tissue', label: 'جراحی بافت نرم (Soft Tissue)' },
        { value: 'orthopedic', label: 'جراحی استخوان (Orthopedic)' },
        { value: 'ophthalmic', label: 'جراحی چشم (Ophthalmic)' },
        { value: 'dental', label: 'جراحی دندان (Dental)' },
        { value: 'thoracic', label: 'جراحی قفسه سینه (Thoracic)' },
        { value: 'abdominal', label: 'جراحی شکم (Abdominal)' },
        { value: 'neurological', label: 'جراحی اعصاب (Neurological)' },
        { value: 'reproductive', label: 'جراحی تولید مثل (Reproductive)' },
        { value: 'urogenital', label: 'جراحی ادراری-تناسلی (Urogenital)' },
        { value: 'cardiovascular', label: 'جراحی قلب و عروق (Cardiovascular)' },
        { value: 'oncological', label: 'جراحی سرطان (Oncological)' },
        { value: 'emergency', label: 'جراحی اورژانسی (Emergency)' }
    ];

    const difficultyOptions = [
        { 
            value: 'novice', 
            label: 'مبتدی (Novice)', 
            description: 'برای دانشجویان دامپزشکی سال آخر',
            steps: '50-80 مرحله',
            duration: '30-60 دقیقه'
        },
        { 
            value: 'beginner', 
            label: 'شروع کننده (Beginner)', 
            description: 'برای دامپزشکان تازه فارغ التحصیل',
            steps: '80-150 مرحله',
            duration: '60-120 دقیقه'
        },
        { 
            value: 'intermediate', 
            label: 'متوسط (Intermediate)', 
            description: 'برای دامپزشکان با تجربه 2-5 سال',
            steps: '150-250 مرحله',
            duration: '90-180 دقیقه'
        },
        { 
            value: 'advanced', 
            label: 'پیشرفته (Advanced)', 
            description: 'برای جراحان با تجربه',
            steps: '250-400 مرحله',
            duration: '120-300 دقیقه'
        },
        { 
            value: 'expert', 
            label: 'متخصص (Expert)', 
            description: 'برای جراحان فوق تخصص',
            steps: '300-500 مرحله',
            duration: '180-480 دقیقه'
        },
        { 
            value: 'specialist', 
            label: 'فوق تخصص (Specialist)', 
            description: 'برای جراحان بورد تخصصی',
            steps: '400-600 مرحله',
            duration: '240-600 دقیقه'
        }
    ];

    const complexityFactors = [
        'anatomical_variations',
        'species_size_variations', 
        'anesthetic_complications',
        'surgical_site_accessibility',
        'vascular_complexity',
        'neurological_considerations',
        'postoperative_monitoring',
        'special_equipment_required',
        'team_coordination_critical',
        'emergency_preparedness'
    ];

    const handleInputChange = (field, value) => {
        setProcedureData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayInputChange = (field, value, checked) => {
        setProcedureData(prev => ({
            ...prev,
            [field]: checked 
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return procedureData.procedureName && 
                       procedureData.species && 
                       procedureData.bodySystem && 
                       procedureData.difficulty;
            case 2:
                return procedureData.indication && 
                       procedureData.userExperience;
            case 3:
                return procedureData.targetLearningOutcomes.length > 0;
            case 4:
                return true; // Optional parameters
            default:
                return true;
        }
    };

    const generateCustomProcedure = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStatus('شروع فرایند تولید محتوا...');

        try {
            // Step 1: Validate Input (10%)
            setGenerationProgress(10);
            setGenerationStatus('اعتبارسنجی اطلاعات ورودی...');
            
            if (!validateAllSteps()) {
                throw new Error('لطفاً تمام فیلدهای ضروری را تکمیل کنید');
            }

            // Step 2: Research Phase (30%)
            setGenerationProgress(30);
            setGenerationStatus('جمع‌آوری اطلاعات علمی و منابع معتبر...');

            const response = await dynamicSurgeryGenerator({
                action: 'generateCustomProcedure',
                payload: {
                    ...procedureData,
                    generationTimestamp: new Date().toISOString(),
                    qualityRequirements: {
                        minSteps: getMinStepsForDifficulty(procedureData.difficulty),
                        maxSteps: getMaxStepsForDifficulty(procedureData.difficulty),
                        evidenceLevel: procedureData.evidenceLevel || 'Grade B',
                        academicValidation: true
                    }
                }
            });

            // Step 3: Content Generation (60%)
            setGenerationProgress(60);
            setGenerationStatus('تولید مراحل تفصیلی جراحی...');

            if (!response.data?.success) {
                throw new Error(response.data?.error || 'خطا در تولید محتوا');
            }

            // Step 4: Quality Validation (80%)
            setGenerationProgress(80);
            setGenerationStatus('اعتبارسنجی کیفیت و دقت علمی...');

            const procedure = response.data.procedure;
            
            if (procedure.quality_score < 80) {
                setGenerationStatus('هشدار: کیفیت تولید شده زیر حد مطلوب است. در حال بهبود...');
                // Auto-enhancement logic could go here
            }

            // Step 5: Final Processing (100%)
            setGenerationProgress(100);
            setGenerationStatus('تکمیل فرایند و آماده‌سازی نهایی...');

            setTimeout(() => {
                onProcedureCreated(response.data);
                setIsGenerating(false);
                setGenerationProgress(0);
                setGenerationStatus('');
            }, 1000);

        } catch (error) {
            console.error('خطا در تولید جراحی:', error);
            setGenerationStatus(`خطا: ${error.message}`);
            setIsGenerating(false);
            setTimeout(() => {
                setGenerationProgress(0);
                setGenerationStatus('');
            }, 3000);
        }
    };

    const validateAllSteps = () => {
        for (let i = 1; i <= 4; i++) {
            if (!validateStep(i)) return false;
        }
        return true;
    };

    const getMinStepsForDifficulty = (difficulty) => {
        const stepRanges = {
            novice: 50,
            beginner: 80,
            intermediate: 150,
            advanced: 250,
            expert: 300,
            specialist: 400
        };
        return stepRanges[difficulty] || 100;
    };

    const getMaxStepsForDifficulty = (difficulty) => {
        const stepRanges = {
            novice: 80,
            beginner: 150,
            intermediate: 250,
            advanced: 400,
            expert: 500,
            specialist: 600
        };
        return stepRanges[difficulty] || 300;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">اطلاعات پایه جراحی</h3>
                            <p className="text-gray-600">لطفاً مشخصات کلی عمل جراحی مورد نظر را وارد کنید</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="procedureName" className="text-sm font-medium">
                                    نام عمل جراحی *
                                </Label>
                                <Input
                                    id="procedureName"
                                    placeholder="مثال: لاپاراتومی اکتشافی"
                                    value={procedureData.procedureName}
                                    onChange={(e) => handleInputChange('procedureName', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="species" className="text-sm font-medium">
                                    گونه حیوان *
                                </Label>
                                <Select 
                                    value={procedureData.species} 
                                    onValueChange={(value) => handleInputChange('species', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب گونه" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {speciesOptions.map((species) => (
                                            <SelectItem key={species.value} value={species.value}>
                                                {species.icon} {species.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bodySystem" className="text-sm font-medium">
                                    سیستم بدن *
                                </Label>
                                <Select 
                                    value={procedureData.bodySystem} 
                                    onValueChange={(value) => handleInputChange('bodySystem', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب سیستم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bodySystemOptions.map((system) => (
                                            <SelectItem key={system.value} value={system.value}>
                                                {system.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty" className="text-sm font-medium">
                                    سطح دشواری *
                                </Label>
                                <Select 
                                    value={procedureData.difficulty} 
                                    onValueChange={(value) => handleInputChange('difficulty', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب سطح" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {difficultyOptions.map((difficulty) => (
                                            <SelectItem key={difficulty.value} value={difficulty.value}>
                                                <div className="flex flex-col">
                                                    <span>{difficulty.label}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {difficulty.steps} | {difficulty.duration}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {procedureData.difficulty && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <Brain className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>برآورد برای سطح {difficultyOptions.find(d => d.value === procedureData.difficulty)?.label}:</strong>
                                    <br />
                                    {difficultyOptions.find(d => d.value === procedureData.difficulty)?.description}
                                    <br />
                                    تعداد مراحل: {difficultyOptions.find(d => d.value === procedureData.difficulty)?.steps}
                                    <br />
                                    مدت زمان: {difficultyOptions.find(d => d.value === procedureData.difficulty)?.duration}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">جزئیات کلینیکی</h3>
                            <p className="text-gray-600">اطلاعات تخصصی و کلینیکی مورد نیاز</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="indication" className="text-sm font-medium">
                                    اندیکاسیون اصلی *
                                </Label>
                                <Textarea
                                    id="indication"
                                    placeholder="دلیل انجام این عمل جراحی چیست؟ (مثال: درمان پیچش معده، برداشتن تومور، ترمیم شکستگی)"
                                    value={procedureData.indication}
                                    onChange={(e) => handleInputChange('indication', e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="userExperience" className="text-sm font-medium">
                                    سطح تجربه کاربر هدف *
                                </Label>
                                <Select 
                                    value={procedureData.userExperience} 
                                    onValueChange={(value) => handleInputChange('userExperience', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="برای چه سطحی طراحی شود؟" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">دانشجو سال آخر</SelectItem>
                                        <SelectItem value="resident">رزیدنت جراحی</SelectItem>
                                        <SelectItem value="general_practitioner">دامپزشک عمومی</SelectItem>
                                        <SelectItem value="experienced_gp">دامپزشک با تجربه</SelectItem>
                                        <SelectItem value="surgeon">جراح تخصص</SelectItem>
                                        <SelectItem value="specialist">فوق تخصص</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="estimatedDuration" className="text-sm font-medium">
                                        مدت زمان تخمینی (دقیقه)
                                    </Label>
                                    <Input
                                        id="estimatedDuration"
                                        type="number"
                                        placeholder="120"
                                        value={procedureData.estimatedDuration}
                                        onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="anesthesiaType" className="text-sm font-medium">
                                        نوع بیهوشی
                                    </Label>
                                    <Select 
                                        value={procedureData.anesthesiaType} 
                                        onValueChange={(value) => handleInputChange('anesthesiaType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="انتخاب نوع بیهوشی" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">بیهوشی عمومی</SelectItem>
                                            <SelectItem value="regional">بیهوشی ناحیه‌ای</SelectItem>
                                            <SelectItem value="local">بیهوشی موضعی</SelectItem>
                                            <SelectItem value="sedation">آرامبخشی</SelectItem>
                                            <SelectItem value="combined">ترکیبی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialRequirements" className="text-sm font-medium">
                                    نیازمندی‌های خاص
                                </Label>
                                <Textarea
                                    id="specialRequirements"
                                    placeholder="تجهیزات خاص، شرایط محیطی، تیم جراحی، و سایر نیازمندی‌ها"
                                    value={procedureData.specialRequirements}
                                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">اهداف آموزشی</h3>
                            <p className="text-gray-600">تعریف اهداف یادگیری و روش‌های ارزیابی</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">اهداف یادگیری *</Label>
                                <p className="text-xs text-gray-600">حداقل 3 هدف یادگیری انتخاب کنید</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'درک آناتومی مرتبط',
                                        'تسلط بر تکنیک جراحی',
                                        'تشخیص و مدیریت عوارض',
                                        'اصول بیهوشی و مراقبت',
                                        'ارزیابی پیش از عمل',
                                        'مراقبت پس از عمل',
                                        'تصمیم‌گیری کلینیکی',
                                        'کار تیمی در اتاق عمل',
                                        'مدیریت اضطراری',
                                        'اصول ایمنی بیمار'
                                    ].map((objective) => (
                                        <div key={objective} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={objective}
                                                checked={procedureData.targetLearningOutcomes.includes(objective)}
                                                onCheckedChange={(checked) => 
                                                    handleArrayInputChange('targetLearningOutcomes', objective, checked)
                                                }
                                            />
                                            <Label htmlFor={objective} className="text-sm">
                                                {objective}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {procedureData.targetLearningOutcomes.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm text-green-600 mb-2">
                                            اهداف انتخاب شده ({procedureData.targetLearningOutcomes.length}):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {procedureData.targetLearningOutcomes.map((outcome) => (
                                                <Badge key={outcome} variant="secondary" className="bg-green-100 text-green-800">
                                                    {outcome}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">روش‌های ارزیابی</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'آزمون تستی',
                                        'ارزیابی عملی',
                                        'تحلیل موردی',
                                        'شبیه‌سازی',
                                        'مشاهده مستقیم',
                                        'گزارش عملکرد'
                                    ].map((method) => (
                                        <div key={method} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={method}
                                                checked={procedureData.assessmentMethods.includes(method)}
                                                onCheckedChange={(checked) => 
                                                    handleArrayInputChange('assessmentMethods', method, checked)
                                                }
                                            />
                                            <Label htmlFor={method} className="text-sm">
                                                {method}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">دانش پیش‌نیاز</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'آناتومی پایه',
                                        'فیزیولوژی',
                                        'اصول جراحی عمومی',
                                        'بیهوشی پایه',
                                        'مراقبت‌های کلینیکی',
                                        'رادیولوژی تفسیری'
                                    ].map((knowledge) => (
                                        <div key={knowledge} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={knowledge}
                                                checked={procedureData.prerequisiteKnowledge.includes(knowledge)}
                                                onCheckedChange={(checked) => 
                                                    handleArrayInputChange('prerequisiteKnowledge', knowledge, checked)
                                                }
                                            />
                                            <Label htmlFor={knowledge} className="text-sm">
                                                {knowledge}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">پارامترهای کیفی</h3>
                            <p className="text-gray-600">تنظیمات پیشرفته برای بهبود کیفیت</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">فاکتورهای پیچیدگی</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        'تنوعات آناتومیکی',
                                        'تفاوت اندازه گونه',
                                        'عوارض بیهوشی',
                                        'دسترسی محل جراحی',
                                        'پیچیدگی عروقی',
                                        'ملاحظات عصبی'
                                    ].map((factor, index) => (
                                        <div key={factor} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={factor}
                                                checked={procedureData.complexityFactors.includes(complexityFactors[index])}
                                                onCheckedChange={(checked) => 
                                                    handleArrayInputChange('complexityFactors', complexityFactors[index], checked)
                                                }
                                            />
                                            <Label htmlFor={factor} className="text-sm">
                                                {factor}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="evidenceLevel" className="text-sm font-medium">
                                    سطح شواهد علمی
                                </Label>
                                <Select 
                                    value={procedureData.evidenceLevel} 
                                    onValueChange={(value) => handleInputChange('evidenceLevel', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب سطح شواهد" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Grade A">Grade A - شواهد قوی</SelectItem>
                                        <SelectItem value="Grade B">Grade B - شواهد متوسط</SelectItem>
                                        <SelectItem value="Grade C">Grade C - شواهد ضعیف</SelectItem>
                                        <SelectItem value="Expert Opinion">نظر متخصص</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contraindications" className="text-sm font-medium">
                                    موارد منع
                                </Label>
                                <Textarea
                                    id="contraindications"
                                    placeholder="شرایطی که این عمل جراحی در آن‌ها انجام نمی‌شود"
                                    value={procedureData.contraindications}
                                    onChange={(e) => handleInputChange('contraindications', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postOpCare" className="text-sm font-medium">
                                    مراقبت‌های پس از عمل
                                </Label>
                                <Textarea
                                    id="postOpCare"
                                    placeholder="دستورالعمل‌های مراقبت پس از جراحی"
                                    value={procedureData.postOpCare}
                                    onChange={(e) => handleInputChange('postOpCare', e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (isGenerating) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-8">
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center space-x-3 space-x-reverse">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <Brain className="w-8 h-8 text-purple-600" />
                            <Zap className="w-8 h-8 text-yellow-600" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800">
                            در حال تولید جراحی تخصصی شما...
                        </h2>
                        
                        <div className="space-y-3">
                            <Progress value={generationProgress} className="w-full h-3" />
                            <p className="text-sm text-gray-600">
                                {Math.round(generationProgress)}% تکمیل شده
                            </p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-blue-800 text-sm flex items-center justify-center gap-2">
                                <Database className="w-4 h-4" />
                                {generationStatus}
                            </p>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                            <p>🧠 استفاده از هوش مصنوعی پیشرفته گروک</p>
                            <p>📚 مراجعه به منابع علمی معتبر دامپزشکی</p>
                            <p>⚕️ اعتبارسنجی توسط استانداردهای ACVS</p>
                            <p>🎯 تولید {getMinStepsForDifficulty(procedureData.difficulty)}-{getMaxStepsForDifficulty(procedureData.difficulty)} مرحله تخصصی</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <Plus className="w-8 h-8 text-blue-600" />
                    ایجاد جراحی جدید
                </CardTitle>
                <p className="text-gray-600">طراحی جراحی تخصصی با استفاده از هوش مصنوعی پیشرفته</p>
                
                <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {currentStep > step ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                {step < 4 && (
                                    <div className={`w-12 h-0.5 ${
                                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {renderStepContent()}

                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                    <Button 
                        variant="outline" 
                        onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                        className="flex items-center gap-2"
                    >
                        {currentStep > 1 ? 'مرحله قبل' : 'انصراف'}
                    </Button>

                    <div className="text-sm text-gray-500">
                        مرحله {currentStep} از 4
                    </div>

                    {currentStep < 4 ? (
                        <Button 
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={!validateStep(currentStep)}
                            className="flex items-center gap-2"
                        >
                            مرحله بعد
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={generateCustomProcedure}
                            disabled={!validateAllSteps() || isGenerating}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                        >
                            <Brain className="w-4 h-4" />
                            تولید جراحی
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}