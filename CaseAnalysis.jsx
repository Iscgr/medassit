
import React, { useState, useEffect } from "react";
import { Case } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { 
    Stethoscope, 
    Mic, 
    Play, 
    Pause, 
    Brain,
    ClipboardList,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function CaseAnalysis() {
    const [cases, setCases] = useState([]);
    const [currentCase, setCurrentCase] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [newCase, setNewCase] = useState({
        title: '',
        species: 'dog',
        breed: '',
        age: '',
        gender: 'female',
        chief_complaint: '',
        history: '',
        physical_exam: '',
        vital_signs: {
            temperature: '',
            heart_rate: '',
            respiratory_rate: '',
            blood_pressure: ''
        }
    });

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            const data = await Case.list('-created_date');
            setCases(data);
        } catch (error) {
            console.error('Error loading cases:', error);
        }
    };

    const startVoiceRecording = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'fa-IR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setNewCase(prev => ({ ...prev, chief_complaint: transcript }));
        };

        recognition.onerror = () => {
            setIsRecording(false);
            alert('خطا در ضبط صدا');
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const analyzeCase = async () => {
        if (!newCase.title || !newCase.chief_complaint) {
            alert('لطفاً عنوان کیس و علائم اصلی را وارد کنید');
            return;
        }

        setIsAnalyzing(true);

        try {
            const analysisPrompt = `
تو یک دامپزشک متخصص هستی. لطفاً این کیس را تحلیل کن:

گونه: ${newCase.species}
نژاد: ${newCase.breed || 'نامشخص'}
سن: ${newCase.age || 'نامشخص'}
جنس: ${newCase.gender}
علائم اصلی: ${newCase.chief_complaint}
سابقه: ${newCase.history || 'ندارد'}
معاینه فیزیکی: ${newCase.physical_exam || 'انجام نشده'}
علائم حیاتی: دما: ${newCase.vital_signs.temperature || 'نامشخص'}, ضربان قلب: ${newCase.vital_signs.heart_rate || 'نامشخص'}, تنفس: ${newCase.vital_signs.respiratory_rate || 'نامشخص'}

لطفاً ارائه دهید:
1. فهرست تشخیص‌های افتراقی بر اساس احتمال (بالا، متوسط، پایین)
2. برنامه تشخیصی پیشنهادی
3. اقدامات اولیه درمانی (صرفاً آموزشی)
4. هشدارهای قرمز در صورت وجود
`;

            const response = await InvokeLLM({
                prompt: analysisPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        differential_diagnoses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    diagnosis: { type: "string" },
                                    likelihood: { type: "string" },
                                    reasoning: { type: "string" }
                                }
                            }
                        },
                        diagnostic_plan: {
                            type: "array",
                            items: { type: "string" }
                        },
                        treatment_plan: { type: "string" },
                        red_flags: {
                            type: "array",
                            items: { type: "string" }
                        },
                        learning_objectives: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            const caseData = {
                ...newCase,
                differential_diagnoses: response.differential_diagnoses || [],
                diagnostic_plan: response.diagnostic_plan || [],
                treatment_plan: response.treatment_plan || '',
                learning_objectives: response.learning_objectives || [],
                status: 'in_progress'
            };

            const createdCase = await Case.create(caseData);
            setCases(prev => [createdCase, ...prev]);
            setCurrentCase(createdCase);
            
            // Reset form
            setNewCase({
                title: '',
                species: 'dog',
                breed: '',
                age: '',
                gender: 'female',
                chief_complaint: '',
                history: '',
                physical_exam: '',
                vital_signs: {
                    temperature: '',
                    heart_rate: '',
                    respiratory_rate: '',
                    blood_pressure: ''
                }
            });

        } catch (error) {
            console.error('Analysis error:', error);
            alert('خطا در تحلیل کیس');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getLikelihoodColor = (likelihood) => {
        switch (likelihood?.toLowerCase()) {
            case 'high':
            case 'بالا':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
            case 'متوسط':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
            case 'پایین':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">تحلیل کیس</h1>
                <p className="text-gray-600">علائم بیمار را شرح دهید و تشخیص افتراقی دریافت کنید</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* New Case Form */}
                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-gradient-to-br from-green-200 to-teal-200"
                                 style={{
                                     boxShadow: 'inset -2px -2px 6px rgba(34, 197, 94, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                 }}>
                                <Stethoscope className="w-5 h-5 text-green-600" />
                            </div>
                            کیس جدید
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label>عنوان کیس</Label>
                                <Input
                                    value={newCase.title}
                                    onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="عنوان کوتاه برای کیس"
                                    className="rounded-2xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>گونه</Label>
                                    <Select value={newCase.species} onValueChange={(value) => setNewCase(prev => ({ ...prev, species: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dog">سگ</SelectItem>
                                            <SelectItem value="cat">گربه</SelectItem>
                                            <SelectItem value="horse">اسب</SelectItem>
                                            <SelectItem value="cow">گاو</SelectItem>
                                            <SelectItem value="sheep">گوسفند</SelectItem>
                                            <SelectItem value="goat">بز</SelectItem>
                                            <SelectItem value="bird">پرنده</SelectItem>
                                            <SelectItem value="exotic">اگزوتیک</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>جنس</Label>
                                    <Select value={newCase.gender} onValueChange={(value) => setNewCase(prev => ({ ...prev, gender: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">نر</SelectItem>
                                            <SelectItem value="female">ماده</SelectItem>
                                            <SelectItem value="neutered_male">نر عقیم</SelectItem>
                                            <SelectItem value="spayed_female">ماده عقیم</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>نژاد</Label>
                                    <Input
                                        value={newCase.breed}
                                        onChange={(e) => setNewCase(prev => ({ ...prev, breed: e.target.value }))}
                                        placeholder="نژاد حیوان"
                                        className="rounded-2xl"
                                    />
                                </div>
                                <div>
                                    <Label>سن</Label>
                                    <Input
                                        value={newCase.age}
                                        onChange={(e) => setNewCase(prev => ({ ...prev, age: e.target.value }))}
                                        placeholder="سن (مثل 3 سال)"
                                        className="rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>علائم اصلی</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-2xl"
                                        onClick={startVoiceRecording}
                                        disabled={isRecording}
                                    >
                                        {isRecording ? (
                                            <>
                                                <Pause className="w-4 h-4 mr-2" />
                                                در حال ضبط...
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-4 h-4 mr-2" />
                                                ضبط صوتی
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Textarea
                                    value={newCase.chief_complaint}
                                    onChange={(e) => setNewCase(prev => ({ ...prev, chief_complaint: e.target.value }))}
                                    placeholder="علائم اصلی که صاحب حیوان گزارش می‌دهد..."
                                    rows={3}
                                    className="rounded-2xl"
                                />
                            </div>

                            <div>
                                <Label>سابقه بیماری</Label>
                                <Textarea
                                    value={newCase.history}
                                    onChange={(e) => setNewCase(prev => ({ ...prev, history: e.target.value }))}
                                    placeholder="سابقه پزشکی، واکسیناسیون، دارو..."
                                    rows={2}
                                    className="rounded-2xl"
                                />
                            </div>

                            <div>
                                <Label>معاینه فیزیکی</Label>
                                <Textarea
                                    value={newCase.physical_exam}
                                    onChange={(e) => setNewCase(prev => ({ ...prev, physical_exam: e.target.value }))}
                                    placeholder="یافته‌های معاینه بالینی..."
                                    rows={2}
                                    className="rounded-2xl"
                                />
                            </div>

                            {/* Vital Signs */}
                            <div>
                                <Label className="mb-2 block">علائم حیاتی</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="دمای بدن"
                                        value={newCase.vital_signs.temperature}
                                        onChange={(e) => setNewCase(prev => ({
                                            ...prev,
                                            vital_signs: { ...prev.vital_signs, temperature: e.target.value }
                                        }))}
                                        className="rounded-2xl"
                                    />
                                    <Input
                                        placeholder="ضربان قلب"
                                        value={newCase.vital_signs.heart_rate}
                                        onChange={(e) => setNewCase(prev => ({
                                            ...prev,
                                            vital_signs: { ...prev.vital_signs, heart_rate: e.target.value }
                                        }))}
                                        className="rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={analyzeCase}
                            disabled={isAnalyzing}
                            className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    در حال تحلیل...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4 mr-2" />
                                    تحلیل با هوش مصنوعی
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Cases History */}
                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200"
                                 style={{
                                     boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                 }}>
                                <ClipboardList className="w-5 h-5 text-purple-600" />
                            </div>
                            کیس‌های قبلی
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {cases.length === 0 ? (
                                <div className="text-center py-8">
                                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">هنوز کیسی تحلیل نکرده‌اید</p>
                                </div>
                            ) : (
                                cases.map((caseItem) => (
                                    <div key={caseItem.id} 
                                         className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-100 transition-all duration-300 cursor-pointer"
                                         style={{
                                             boxShadow: 'inset -2px -2px 8px rgba(139, 92, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)'
                                         }}
                                         onClick={() => setCurrentCase(caseItem)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-800">{caseItem.title}</h3>
                                            <Badge variant="outline" className={`rounded-full ${
                                                caseItem.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                caseItem.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {caseItem.status === 'completed' ? 'تکمیل شده' : 
                                                 caseItem.status === 'in_progress' ? 'در حال انجام' : 'پیش‌نویس'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {caseItem.species} • {caseItem.chief_complaint?.substring(0, 50)}...
                                        </p>
                                        {caseItem.differential_diagnoses?.length > 0 && (
                                            <p className="text-xs text-purple-600 mt-1">
                                                {caseItem.differential_diagnoses.length} تشخیص افتراقی
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Case Analysis Results */}
            {currentCase && (
                <Card className="bg-white/90 backdrop-blur-lg border-0"
                      style={{
                          boxShadow: 'inset -6px -6px 20px rgba(139, 92, 246, 0.15), inset 6px 6px 20px rgba(255, 255, 255, 0.9), 0 12px 40px rgba(139, 92, 246, 0.2)'
                      }}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3">
                                <Brain className="w-6 h-6 text-purple-600" />
                                نتایج تحلیل: {currentCase.title}
                            </CardTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-2xl"
                                onClick={() => setCurrentCase(null)}
                            >
                                ×
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Patient Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50">
                            <div>
                                <p className="text-sm text-gray-500">گونه</p>
                                <p className="font-medium">{currentCase.species}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">سن</p>
                                <p className="font-medium">{currentCase.age || 'نامشخص'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">نژاد</p>
                                <p className="font-medium">{currentCase.breed || 'نامشخص'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">جنس</p>
                                <p className="font-medium">{currentCase.gender}</p>
                            </div>
                        </div>

                        {/* Differential Diagnoses */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                تشخیص‌های افتراقی
                            </h3>
                            <div className="space-y-3">
                                {currentCase.differential_diagnoses?.map((diagnosis, index) => (
                                    <div key={index} 
                                         className="p-4 rounded-2xl border"
                                         style={{
                                             boxShadow: 'inset -2px -2px 8px rgba(139, 92, 246, 0.05), inset 2px 2px 8px rgba(255, 255, 255, 0.9)'
                                         }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-800">{diagnosis.diagnosis}</h4>
                                            <Badge className={`rounded-full ${getLikelihoodColor(diagnosis.likelihood)}`}>
                                                احتمال: {diagnosis.likelihood}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 text-sm">{diagnosis.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Diagnostic Plan */}
                        {currentCase.diagnostic_plan?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" />
                                    برنامه تشخیصی
                                </h3>
                                <div className="space-y-2">
                                    {currentCase.diagnostic_plan.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Treatment Plan */}
                        {currentCase.treatment_plan && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-green-500" />
                                    برنامه درمانی (آموزشی)
                                </h3>
                                <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                                    <p className="text-gray-700 leading-relaxed">{currentCase.treatment_plan}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                            <p className="text-yellow-800 text-sm text-center">
                                ⚠️ این تحلیل صرفاً جهت آموزش است و نباید جایگزین مشاوره دامپزشک متخصص شود
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
