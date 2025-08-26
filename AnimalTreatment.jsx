
import React, { useState, useEffect } from "react";
import { AnimalProfile, Case, TreatmentPlan } from "@/api/entities";
import { clinicalQuestion } from "@/api/functions";
import SmartTreatmentAlerts from "@/components/treatment/SmartTreatmentAlerts";
import SimilarCasesPanel from "@/components/treatment/SimilarCasesPanel"; // NEW IMPORT
import AdvancedDiagnosticSimulator from "@/components/treatment/AdvancedDiagnosticSimulator"; // NEW IMPORT
import {
    HeartPulse,
    PlusCircle,
    Brain,
    Loader2,
    Dog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AnimalTreatment() {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null); // NEW STATE
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [isCreatingCase, setIsCreatingCase] = useState(false);
    const [newCaseData, setNewCaseData] = useState({ title: '', chief_complaint: '', history: '' });
    const [activeTreatmentPlan, setActiveTreatmentPlan] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const animalsData = await AnimalProfile.list();
            setAnimals(animalsData);
            if (animalsData.length > 0) {
                handleSelectAnimal(animalsData[0]);
            }
        };
        loadData();
    }, []);

    const handleSelectAnimal = async (animal) => {
        setSelectedAnimal(animal);
        const casesData = await Case.filter({ animal_id: animal.id });
        setCases(casesData);
        setSelectedCase(casesData.length > 0 ? casesData[0] : null); // Set selected case to the most recent one
        const plansData = await TreatmentPlan.filter({ animal_id: animal.id });
        setTreatmentPlans(plansData);
        setActiveTreatmentPlan(plansData.length > 0 ? plansData[0] : null);
    };

    const handleCreateCase = async () => {
        if (!newCaseData.title || !newCaseData.chief_complaint || !selectedAnimal) {
            return;
        }
        setIsCreatingCase(true);

        let caseRecord = null;

        try {
            const preliminaryCaseData = {
                ...newCaseData,
                animal_id: selectedAnimal.id,
                species: selectedAnimal.species,
                status: 'analyzing',
                analysis: 'Analysis in progress...',
                friendly_explanation: 'در حال تحلیل هوشمند کیس...'
            };
            caseRecord = await Case.create(preliminaryCaseData);
            setCases(prev => [caseRecord, ...prev]);
            setSelectedCase(caseRecord); // Set the newly created case as selected

            const analysisPrompt = `Analyze this veterinary case:
            - Species: ${selectedAnimal.species}
            - Breed: ${selectedAnimal.breed}
            - Age: ${selectedAnimal.age}
            - Gender: ${selectedAnimal.gender}
            - Chief Complaint: ${newCaseData.chief_complaint}
            - History: ${newCaseData.history || 'N/A'}
            
            Provide a comprehensive analysis including:
            1. Differential Diagnoses (at least 3)
            2. Suggested Diagnostic Tests
            3. Initial Treatment Suggestions
            4. Key points and warning signs.
            
            Your response should be in Persian, with a friendly tone for 'Sanam Jan'.`;

            const response = await clinicalQuestion({
                question: analysisPrompt,
                caseId: caseRecord.id
            });
            const analysisResult = await response.json();

            const updatedCase = await Case.update(caseRecord.id, {
                status: 'analyzed',
                analysis: analysisResult.answer,
                friendly_explanation: `صنم جان، این کیس رو بررسی کردم و این تحلیل کامل منه: ${analysisResult.answer.substring(0, 200)}...`
            });
            
            setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
            setSelectedCase(updatedCase); // Update selected case with analyzed data
            setNewCaseData({ title: '', chief_complaint: '', history: '' });

        } catch (error) {
            console.error('خطا در تحلیل یا ایجاد کیس:', error);
            if (caseRecord && caseRecord.id) {
                const failedCase = await Case.update(caseRecord.id, {
                    status: 'analysis_failed',
                    analysis: 'خطا در تحلیل خودکار - نیاز به بررسی دستی',
                    friendly_explanation: 'متأسفانه در تحلیل خودکار مشکلی پیش آمد، لطفاً به صورت دستی بررسی و تکمیل کنید.'
                });
                setCases(prev => prev.map(c => c.id === failedCase.id ? failedCase : c));
                setSelectedCase(failedCase); // Update selected case even if analysis failed
            } else {
                console.error("Failed to create initial case record.");
                alert("خطا در ایجاد کیس اولیه. لطفا دوباره تلاش کنید.");
            }
        } finally {
            setIsCreatingCase(false);
        }
    };

    return (
        <div className="space-y-6 p-4 lg:p-8" dir="rtl">
            <h1 className="text-3xl font-bold text-gray-800">سیستم درمان حیوانات</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Updated main grid layout */}
                {/* ستون اصلی: پروفایل حیوانات، کیس‌های درمانی و برنامه‌های درمانی */}
                <div className="lg:col-span-2 space-y-6">
                    {/* پروفایل حیوانات */}
                    <Card className="bg-white/60 backdrop-blur-sm border-0"
                          style={{
                              boxShadow: 'inset -3px -3px 10px rgba(236, 72, 153, 0.15), inset 3px 3px 10px rgba(255, 255, 255, 0.9)'
                          }}>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-pink-700">پروفایل حیوانات</CardTitle>
                            <Button size="icon" className="rounded-full bg-pink-400"><PlusCircle/></Button>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {animals.map(animal => (
                                <div key={animal.id} onClick={() => handleSelectAnimal(animal)}
                                    className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 ${selectedAnimal?.id === animal.id ? 'bg-rose-100 shadow-inner' : 'bg-gray-50 hover:bg-rose-50'}`}>
                                    <img src={animal.photo_url || `https://i.pravatar.cc/150?u=${animal.id}`} alt={animal.name} className="w-12 h-12 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-gray-800">{animal.name}</p>
                                        <p className="text-sm text-gray-500">{animal.species} - {animal.breed}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {selectedAnimal ? (
                        <>
                            {/* کیس‌های درمانی */}
                            <Card className="bg-white/80 backdrop-blur-xl border-0"
                                style={{
                                    boxShadow: 'inset -4px -4px 16px rgba(236, 72, 153, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(236, 72, 153, 0.12)'
                                }}>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle className="text-fuchsia-800">کیس‌های درمانی برای {selectedAnimal.name}</CardTitle>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500">
                                                <PlusCircle className="ml-2"/> ایجاد کیس جدید
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>ایجاد کیس جدید برای {selectedAnimal.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <Input
                                                    placeholder="عنوان کیس (مثلا: مشکل گوارشی)"
                                                    value={newCaseData.title}
                                                    onChange={e => setNewCaseData({...newCaseData, title: e.target.value})}
                                                    className="rounded-xl"
                                                />
                                                <Textarea
                                                    placeholder="علائم اصلی بیمار (Chief Complaint)..."
                                                    value={newCaseData.chief_complaint}
                                                    onChange={e => setNewCaseData({...newCaseData, chief_complaint: e.target.value})}
                                                    className="rounded-xl"
                                                />
                                                <Textarea
                                                    placeholder="سابقه بیماری (History)..."
                                                    value={newCaseData.history}
                                                    onChange={e => setNewCaseData({...newCaseData, history: e.target.value})}
                                                    className="rounded-xl"
                                                />
                                                <Button onClick={handleCreateCase} disabled={isCreatingCase} className="w-full rounded-xl">
                                                    {isCreatingCase ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <Brain className="ml-2 h-4 w-4" />}
                                                    {isCreatingCase ? "در حال تحلیل..." : "ایجاد و تحلیل هوشمند"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cases.length > 0 ? cases.map(c => (
                                        <div key={c.id} className="p-4 rounded-2xl bg-gray-50 border">
                                            <h4 className="font-bold">{c.title}</h4>
                                            <p className="text-sm text-gray-600">{c.chief_complaint}</p>
                                            <Badge className="mt-2">{c.status}</Badge>
                                        </div>
                                    )) : <p className="text-center text-gray-500 p-8">هنوز کیسی برای {selectedAnimal.name} ثبت نشده.</p>}
                                </CardContent>
                            </Card>

                            {/* برنامه‌های درمانی */}
                            <Card className="bg-white/80 backdrop-blur-xl border-0"
                                style={{
                                    boxShadow: 'inset -4px -4px 16px rgba(100, 100, 255, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(100, 100, 255, 0.12)'
                                }}>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle className="text-blue-800">برنامه‌های درمانی برای {selectedAnimal?.name}</CardTitle>
                                    {selectedAnimal && (
                                        <Link to={createPageUrl(`TreatmentPlan?animal_id=${selectedAnimal.id}&mode=new`)}>
                                            <Button className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                                                <PlusCircle className="ml-2"/> برنامه جدید
                                            </Button>
                                        </Link>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {treatmentPlans.length > 0 ? treatmentPlans.map(plan => (
                                        <Link key={plan.id} to={createPageUrl(`TreatmentPlan?animal_id=${selectedAnimal.id}&plan_id=${plan.id}`)}>
                                            <div className="p-4 rounded-2xl bg-gray-50 border hover:bg-blue-50 transition-colors duration-200">
                                                <h4 className="font-bold">{plan.treatment_name}</h4>
                                                <p className="text-sm text-gray-600">وضعیت: {plan.status}</p>
                                                {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description.substring(0, 100)}...</p>}
                                            </div>
                                        </Link>
                                    )) : <p className="text-center text-gray-500 p-8">هنوز برنامه درمانی ثبت نشده.</p>}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                         <div className="flex items-center justify-center h-full min-h-[500px] rounded-3xl bg-white/50 border-2 border-dashed border-rose-200">
                            <div className="text-center text-rose-500">
                                <Dog className="w-24 h-24 mx-auto mb-4 opacity-50"/>
                                <p className="text-xl font-medium">یک حیوان را برای مشاهده کیس‌ها و برنامه‌های درمانی‌اش انتخاب کنید.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ستون کناری: هشدارهای هوشمند، کیس‌های مشابه و شبیه‌ساز */}
                <div className="space-y-6">
                    {selectedAnimal && (
                        <>
                            {/* هشدارهای هوشمند طرح درمان */}
                            {activeTreatmentPlan && (
                                <SmartTreatmentAlerts 
                                    treatmentPlan={activeTreatmentPlan} 
                                    animalProfile={selectedAnimal}
                                />
                            )}

                            {/* کیس‌های مشابه */}
                            {selectedCase && ( // Only render if a case is selected
                                <SimilarCasesPanel 
                                    currentAnimal={selectedAnimal} 
                                    currentCase={selectedCase} 
                                />
                            )}

                            {/* شبیه‌ساز تشخیص پیشرفته */}
                            {selectedCase && ( // Only render if a case is selected
                                <AdvancedDiagnosticSimulator 
                                    animalProfile={selectedAnimal} 
                                    currentCase={selectedCase} 
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
