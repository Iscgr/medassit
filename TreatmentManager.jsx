import React, { useState, useEffect } from "react";
import { TreatmentPlan, Reminder, Case, AnimalProfile } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { 
    Calendar, 
    Clock, 
    Pill, 
    Activity, 
    AlertCircle, 
    CheckCircle2,
    Plus,
    Bell,
    TrendingUp,
    FileText,
    Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TreatmentManager({ caseId, animalId }) {
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [activeReminders, setActiveReminders] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [progressNotes, setProgressNotes] = useState([]);
    const [newProgressNote, setNewProgressNote] = useState({ note: '', severity: 'info' });

    useEffect(() => {
        if (caseId && animalId) {
            loadTreatmentData();
        }
    }, [caseId, animalId]);

    const loadTreatmentData = async () => {
        try {
            const [plans, reminders] = await Promise.all([
                TreatmentPlan.filter({ case_id: caseId }),
                Reminder.filter({ related_entity_id: caseId, status: 'active' })
            ]);
            
            setTreatmentPlans(plans);
            setActiveReminders(reminders);
            
            if (plans.length > 0) {
                setSelectedPlan(plans[0]);
                setProgressNotes(plans[0].progress_notes || []);
            }
        } catch (error) {
            console.error('Error loading treatment data:', error);
        }
    };

    const generateSmartTreatmentPlan = async (caseData) => {
        setIsCreatingPlan(true);
        try {
            const response = await InvokeLLM({
                prompt: `صنم جان، می‌خوام برای این کیس یه برنامه درمانی جامع و دقیق تهیه کنم:

کیس: ${caseData.title}
گونه: ${caseData.species}
تشخیص: ${caseData.differential_diagnoses?.[0]?.diagnosis || 'در حال بررسی'}
علائم: ${caseData.chief_complaint}

لطفاً یه برنامه درمانی کامل شامل:
1. داروهای مورد نیاز با دوزاژ دقیق
2. برنامه زمان‌بندی مراقبت‌ها
3. پارامترهای قابل پایش
4. قرارهای پیگیری

همه چیز رو طوری تنظیم کن که من بتونم یادآوری‌های دقیق برای صنم تنظیم کنم.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        treatment_name: { type: "string" },
                        medications: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    dosage: { type: "string" },
                                    frequency: { type: "string" },
                                    duration: { type: "string" },
                                    instructions: { type: "string" }
                                }
                            }
                        },
                        monitoring_schedule: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    parameter: { type: "string" },
                                    frequency: { type: "string" },
                                    target_value: { type: "string" }
                                }
                            }
                        },
                        follow_up_schedule: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    days_from_start: { type: "number" },
                                    purpose: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            // Create treatment plan
            const treatmentPlan = await TreatmentPlan.create({
                case_id: caseId,
                animal_id: animalId,
                treatment_name: response.treatment_name,
                medications: response.medications || [],
                monitoring_schedule: response.monitoring_schedule || [],
                follow_up_appointments: response.follow_up_schedule?.map(fu => ({
                    date: new Date(Date.now() + fu.days_from_start * 24 * 60 * 60 * 1000).toISOString(),
                    purpose: fu.purpose,
                    status: 'scheduled'
                })) || [],
                status: 'active',
                progress_notes: []
            });

            // Create automatic reminders
            await createTreatmentReminders(treatmentPlan);
            
            setTreatmentPlans(prev => [treatmentPlan, ...prev]);
            setSelectedPlan(treatmentPlan);
            
        } catch (error) {
            console.error('Error generating treatment plan:', error);
        } finally {
            setIsCreatingPlan(false);
        }
    };

    const createTreatmentReminders = async (treatmentPlan) => {
        const reminders = [];
        
        // Medication reminders
        for (const med of treatmentPlan.medications || []) {
            const frequencies = parseMedicationFrequency(med.frequency);
            for (const time of frequencies) {
                reminders.push({
                    title: `دارو: ${med.name}`,
                    description: `${med.dosage} - ${med.instructions}`,
                    type: 'medication',
                    related_entity_id: treatmentPlan.id,
                    related_entity_type: 'treatment_plan',
                    scheduled_time: time,
                    recurrence_pattern: {
                        type: 'daily',
                        interval: 1
                    },
                    priority: 'high',
                    notification_settings: {
                        advance_notice_minutes: [15, 5],
                        notification_methods: ['push'],
                        escalation_enabled: true
                    }
                });
            }
        }
        
        // Monitoring reminders
        for (const monitor of treatmentPlan.monitoring_schedule || []) {
            reminders.push({
                title: `پایش: ${monitor.parameter}`,
                description: `هدف: ${monitor.target_value}`,
                type: 'monitoring',
                related_entity_id: treatmentPlan.id,
                related_entity_type: 'treatment_plan',
                scheduled_time: getNextMonitoringTime(monitor.frequency),
                recurrence_pattern: parseMonitoringFrequency(monitor.frequency),
                priority: 'medium'
            });
        }
        
        // Follow-up appointment reminders
        for (const appointment of treatmentPlan.follow_up_appointments || []) {
            reminders.push({
                title: `قرار ملاقات: ${appointment.purpose}`,
                description: 'یادآوری قرار ملاقات پیگیری',
                type: 'appointment',
                related_entity_id: treatmentPlan.id,
                related_entity_type: 'treatment_plan',
                scheduled_time: appointment.date,
                priority: 'high',
                notification_settings: {
                    advance_notice_minutes: [1440, 60, 15], // 1 day, 1 hour, 15 minutes
                    notification_methods: ['push']
                }
            });
        }
        
        // Bulk create reminders
        for (const reminder of reminders) {
            await Reminder.create(reminder);
        }
        
        setActiveReminders(prev => [...prev, ...reminders]);
    };

    const addProgressNote = async () => {
        if (!newProgressNote.note.trim() || !selectedPlan) return;
        
        const noteData = {
            date: new Date().toISOString(),
            note: newProgressNote.note,
            severity: newProgressNote.severity,
            attachments: []
        };
        
        const updatedNotes = [...progressNotes, noteData];
        setProgressNotes(updatedNotes);
        
        // Update treatment plan
        await TreatmentPlan.update(selectedPlan.id, {
            progress_notes: updatedNotes
        });
        
        setNewProgressNote({ note: '', severity: 'info' });
        
        // AI analysis of progress note
        analyzeProgressNote(noteData);
    };

    const analyzeProgressNote = async (noteData) => {
        try {
            const analysis = await InvokeLLM({
                prompt: `صنم جان، این یادداشت پیشرفت درمان رو بررسی کن:

"${noteData.note}"

آیا این یادداشت نشان‌دهنده:
1. بهبودی مناسب است؟
2. نیاز به تغییر درمان دارد؟
3. علائم خطرناک وجود دارد؟
4. نیاز به مشاوره فوری است؟

یه تحلیل کوتاه و کاربردی بده.`
            });
            
            // Show analysis as notification or alert
            console.log('Progress analysis:', analysis);
        } catch (error) {
            console.error('Error analyzing progress note:', error);
        }
    };

    const parseMedicationFrequency = (frequency) => {
        // Parse frequency like "3 times daily" and return array of times
        const now = new Date();
        const times = [];
        
        if (frequency.includes('daily') || frequency.includes('روزانه')) {
            const matches = frequency.match(/(\d+)/);
            const timesPerDay = matches ? parseInt(matches[1]) : 1;
            
            for (let i = 0; i < timesPerDay; i++) {
                const time = new Date(now);
                time.setHours(8 + (i * 8), 0, 0, 0); // 8 AM, 4 PM, 12 AM for 3 times
                times.push(time.toISOString());
            }
        }
        
        return times;
    };

    const getNextMonitoringTime = (frequency) => {
        const now = new Date();
        if (frequency.includes('daily')) {
            now.setDate(now.getDate() + 1);
        } else if (frequency.includes('weekly')) {
            now.setDate(now.getDate() + 7);
        }
        return now.toISOString();
    };

    const parseMonitoringFrequency = (frequency) => {
        if (frequency.includes('daily')) {
            return { type: 'daily', interval: 1 };
        } else if (frequency.includes('weekly')) {
            return { type: 'weekly', interval: 1 };
        }
        return { type: 'daily', interval: 1 };
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'info': return 'bg-blue-50 border-blue-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">مدیریت درمان</h2>
                    <p className="text-gray-600">پیگیری جامع روند درمان صنم جان</p>
                </div>
                
                {!selectedPlan && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-gradient-to-r from-green-500 to-teal-500">
                                <Plus className="w-4 h-4 mr-2" />
                                شروع درمان جدید
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>ایجاد برنامه درمانی هوشمند</DialogTitle>
                            </DialogHeader>
                            <div className="p-6 text-center">
                                <Activity className="w-16 h-16 mx-auto mb-4 text-green-600" />
                                <p className="text-gray-600 mb-6">
                                    صنم جان، می‌خوام بر اساس تشخیص کیس، یه برنامه درمانی کامل و دقیق برات تهیه کنم!
                                </p>
                                <Button 
                                    onClick={() => generateSmartTreatmentPlan({ title: "کیس نمونه", species: "سگ", chief_complaint: "علائم گوارشی" })}
                                    disabled={isCreatingPlan}
                                    className="rounded-2xl"
                                >
                                    {isCreatingPlan ? 'در حال تهیه برنامه...' : 'تهیه برنامه درمانی'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Active Reminders */}
            {activeReminders.length > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-orange-700">
                            <Bell className="w-5 h-5" />
                            یادآوری‌های فعال
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {activeReminders.slice(0, 3).map((reminder, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-2xl">
                                    <div className="p-2 rounded-full bg-orange-100">
                                        {reminder.type === 'medication' && <Pill className="w-4 h-4 text-orange-600" />}
                                        {reminder.type === 'appointment' && <Calendar className="w-4 h-4 text-orange-600" />}
                                        {reminder.type === 'monitoring' && <Activity className="w-4 h-4 text-orange-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{reminder.title}</p>
                                        <p className="text-sm text-gray-600">{reminder.description}</p>
                                    </div>
                                    <Badge className={getPriorityColor(reminder.priority)}>
                                        {reminder.priority}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {selectedPlan && (
                <>
                    {/* Treatment Overview */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-green-600" />
                                    {selectedPlan.treatment_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Medications */}
                                {selectedPlan.medications?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <Pill className="w-4 h-4 text-blue-600" />
                                            داروهای تجویزی
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedPlan.medications.map((med, index) => (
                                                <div key={index} className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-medium text-gray-800">{med.name}</h5>
                                                        <Badge variant="outline">{med.frequency}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">دوزاژ: {med.dosage}</p>
                                                    <p className="text-xs text-gray-500">{med.instructions}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Monitoring Schedule */}
                                {selectedPlan.monitoring_schedule?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                            برنامه پایش
                                        </h4>
                                        <div className="grid gap-3">
                                            {selectedPlan.monitoring_schedule.map((monitor, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-200">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{monitor.parameter}</p>
                                                        <p className="text-sm text-gray-600">هدف: {monitor.target_value}</p>
                                                    </div>
                                                    <Badge variant="outline">{monitor.frequency}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up Appointments */}
                                {selectedPlan.follow_up_appointments?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            قرارهای پیگیری
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedPlan.follow_up_appointments.map((appointment, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-green-50 border border-green-200">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{appointment.purpose}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(appointment.date).toLocaleDateString('fa-IR')}
                                                        </p>
                                                    </div>
                                                    <Badge className={appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                        {appointment.status === 'completed' ? 'انجام شده' : 'برنامه‌ریزی شده'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress Notes */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    یادداشت‌های پیشرفت
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Add new progress note */}
                                <div className="mb-4 space-y-3">
                                    <Textarea
                                        placeholder="صنم جان، وضعیت حیوان رو اینجا بنویس..."
                                        value={newProgressNote.note}
                                        onChange={(e) => setNewProgressNote(prev => ({ ...prev, note: e.target.value }))}
                                        rows={3}
                                        className="rounded-2xl"
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            value={newProgressNote.severity}
                                            onChange={(e) => setNewProgressNote(prev => ({ ...prev, severity: e.target.value }))}
                                            className="px-3 py-2 rounded-2xl border border-gray-200 text-sm"
                                        >
                                            <option value="info">معمولی</option>
                                            <option value="warning">هشدار</option>
                                            <option value="critical">بحرانی</option>
                                        </select>
                                        <Button onClick={addProgressNote} className="rounded-2xl flex-1">
                                            <Plus className="w-4 h-4 mr-2" />
                                            ثبت یادداشت
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress notes list */}
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {progressNotes.map((note, index) => (
                                        <div key={index} className={`p-3 rounded-2xl border ${getSeverityColor(note.severity)}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge className={getPriorityColor(note.severity === 'critical' ? 'high' : 'medium')}>
                                                    {note.severity === 'critical' ? 'بحرانی' : note.severity === 'warning' ? 'هشدار' : 'معمولی'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(note.date).toLocaleDateString('fa-IR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{note.note}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}