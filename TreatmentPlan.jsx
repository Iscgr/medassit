// TreatmentPlan Editor Page
import React from "react";
import { TreatmentPlan } from "@/api/entities";
import { Case } from "@/api/entities";
import { AnimalProfile } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ArrowRight, Calendar, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

function toInputDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const da = pad(d.getDate());
    const h = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${y}-${m}-${da}T${h}:${mi}`;
  } catch {
    return "";
  }
}
function toISO(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function TreatmentPlanPage() {
  const url = new URLSearchParams(window.location.search);
  const planId = url.get("plan_id");
  const animalId = url.get("animal_id");
  const mode = url.get("mode") || (planId ? "edit" : "new");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [animal, setAnimal] = React.useState(null);
  const [cases, setCases] = React.useState([]);
  const [form, setForm] = React.useState({
    treatment_name: "",
    case_id: "",
    animal_id: animalId || "",
    status: "active",
    medications: [],
    procedures: [],
    monitoring_schedule: [],
    follow_up_appointments: [],
    progress_notes: []
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    let currentPlan = null;

    if (animalId) {
      const a = await AnimalProfile.filter({ id: animalId }).then(r => r?.[0] || null);
      setAnimal(a);
      const cs = await Case.filter({ animal_id: animalId });
      setCases(cs || []);
    }
    if (planId) {
      const existing = await TreatmentPlan.filter({ id: planId });
      currentPlan = existing?.[0] || null;
    }

    if (currentPlan) {
      setForm({
        treatment_name: currentPlan.treatment_name || "",
        case_id: currentPlan.case_id || "",
        animal_id: currentPlan.animal_id || animalId || "",
        status: currentPlan.status || "active",
        medications: Array.isArray(currentPlan.medications) ? currentPlan.medications : [],
        procedures: Array.isArray(currentPlan.procedures) ? currentPlan.procedures : [],
        monitoring_schedule: Array.isArray(currentPlan.monitoring_schedule) ? currentPlan.monitoring_schedule : [],
        follow_up_appointments: Array.isArray(currentPlan.follow_up_appointments) ? currentPlan.follow_up_appointments : [],
        progress_notes: Array.isArray(currentPlan.progress_notes) ? currentPlan.progress_notes : []
      });
    } else {
      // initialize for new plan with selected animal
      setForm((f) => ({ ...f, animal_id: animalId || f.animal_id }));
    }

    setLoading(false);
  }, [animalId, planId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addItem = (k, obj) => setForm((f) => ({ ...f, [k]: [...(f[k] || []), obj] }));
  const removeItem = (k, idx) =>
    setForm((f) => ({ ...f, [k]: (f[k] || []).filter((_, i) => i !== idx) }));
  const updateItem = (k, idx, obj) =>
    setForm((f) => ({ ...f, [k]: (f[k] || []).map((x, i) => (i === idx ? obj : x)) }));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      treatment_name: form.treatment_name,
      case_id: form.case_id,
      animal_id: form.animal_id,
      status: form.status,
      medications: (form.medications || []).map(m => ({
        ...m,
        start_date: m.start_date ? toISO(m.start_date) : undefined,
        end_date: m.end_date ? toISO(m.end_date) : undefined
      })),
      procedures: (form.procedures || []).map(p => ({
        ...p,
        scheduled_date: p.scheduled_date ? toISO(p.scheduled_date) : undefined
      })),
      monitoring_schedule: form.monitoring_schedule || [],
      follow_up_appointments: (form.follow_up_appointments || []).map(a => ({
        ...a,
        date: a.date ? toISO(a.date) : undefined
      })),
      progress_notes: (form.progress_notes || []).map(n => ({
        ...n,
        date: n.date ? toISO(n.date) : new Date().toISOString()
      }))
    };

    let result = null;
    if (planId) {
      result = await TreatmentPlan.update(planId, payload);
    } else {
      result = await TreatmentPlan.create(payload);
    }
    setSaving(false);
    window.location.href = createPageUrl("AnimalTreatment");
    return result;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-4" dir="rtl">
        <div className="h-8 w-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl animate-pulse"></div>
        <div className="h-32 w-full bg-gradient-to-br from-gray-100 to-purple-100 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-800">
            {planId ? "ویرایش برنامه درمانی" : "ایجاد برنامه درمانی جدید"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("AnimalTreatment")}>
            <Button variant="outline" className="rounded-xl">بازگشت</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving || !form.treatment_name || !form.case_id} className="rounded-xl bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 ml-1" /> ذخیره
          </Button>
        </div>
      </div>

      {/* Header info */}
      <Card className="bg-white/70 border-0">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">نام برنامه درمانی</label>
            <Input value={form.treatment_name} onChange={(e) => updateField("treatment_name", e.target.value)} className="rounded-xl mt-1" placeholder="مثلا: کنترل درد و آنتی‌بیوتیک" />
          </div>
          <div>
            <label className="text-sm text-gray-600">حیوان</label>
            <Input value={animal?.name || "-"} disabled className="rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-sm text-gray-600">کیس مرتبط</label>
            <Select value={form.case_id} onValueChange={(v) => updateField("case_id", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="یک کیس انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {(cases || []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title} <span className="text-xs text-gray-500">({c.species})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-600">وضعیت</label>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="completed">تکمیل‌شده</SelectItem>
                <SelectItem value="paused">موقتاً متوقف</SelectItem>
                <SelectItem value="discontinued">متوقف‌شده</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>داروها</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => addItem("medications", { name: "", dosage: "", frequency: "", duration: "", instructions: "", start_date: "", end_date: "" })}>
              <Plus className="w-4 h-4 ml-1" /> افزودن دارو
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.medications || []).length === 0 ? (
            <div className="text-sm text-gray-600">دارویی ثبت نشده است.</div>
          ) : (
            form.medications.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="نام دارو" value={m.name || ""} onChange={(e) => updateItem("medications", i, { ...m, name: e.target.value })} className="rounded-xl" />
                  <Input placeholder="دوز" value={m.dosage || ""} onChange={(e) => updateItem("medications", i, { ...m, dosage: e.target.value })} className="rounded-xl" />
                  <Input placeholder="فروکانس" value={m.frequency || ""} onChange={(e) => updateItem("medications", i, { ...m, frequency: e.target.value })} className="rounded-xl" />
                  <Input placeholder="مدت زمان" value={m.duration || ""} onChange={(e) => updateItem("medications", i, { ...m, duration: e.target.value })} className="rounded-xl" />
                  <Input type="datetime-local" value={toInputDateTime(m.start_date)} onChange={(e) => updateItem("medications", i, { ...m, start_date: e.target.value })} className="rounded-xl" />
                  <Input type="datetime-local" value={toInputDateTime(m.end_date)} onChange={(e) => updateItem("medications", i, { ...m, end_date: e.target.value })} className="rounded-xl" />
                </div>
                <Textarea placeholder="دستورالعمل" value={m.instructions || ""} onChange={(e) => updateItem("medications", i, { ...m, instructions: e.target.value })} className="rounded-xl" />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeItem("medications", i)}>
                    <Trash2 className="w-4 h-4 ml-1" /> حذف
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Procedures */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>پروسیجرها</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => addItem("procedures", { name: "", scheduled_date: "", status: "pending", notes: "" })}>
              <Plus className="w-4 h-4 ml-1" /> افزودن پروسیجر
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.procedures || []).length === 0 ? (
            <div className="text-sm text-gray-600">پروسیجری ثبت نشده است.</div>
          ) : (
            form.procedures.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="نام پروسیجر" value={p.name || ""} onChange={(e) => updateItem("procedures", i, { ...p, name: e.target.value })} className="rounded-xl" />
                  <Input type="datetime-local" value={toInputDateTime(p.scheduled_date)} onChange={(e) => updateItem("procedures", i, { ...p, scheduled_date: e.target.value })} className="rounded-xl" />
                  <Select value={p.status || "pending"} onValueChange={(v) => updateItem("procedures", i, { ...p, status: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="completed">انجام‌شده</SelectItem>
                      <SelectItem value="cancelled">لغو شده</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeItem("procedures", i)}>
                    <Trash2 className="w-4 h-4 ml-1" /> حذف
                  </Button>
                </div>
                <Textarea placeholder="یادداشت" value={p.notes || ""} onChange={(e) => updateItem("procedures", i, { ...p, notes: e.target.value })} className="rounded-xl" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Monitoring schedule */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>مانیتورینگ</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => addItem("monitoring_schedule", { parameter: "", frequency: "", target_value: "", alert_threshold: "" })}>
              <Plus className="w-4 h-4 ml-1" /> افزودن آیتم
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.monitoring_schedule || []).length === 0 ? (
            <div className="text-sm text-gray-600">آیتمی ثبت نشده است.</div>
          ) : (
            form.monitoring_schedule.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input placeholder="پارامتر (مثلاً HR)" value={m.parameter || ""} onChange={(e) => updateItem("monitoring_schedule", i, { ...m, parameter: e.target.value })} className="rounded-xl" />
                  <Input placeholder="فروکانس" value={m.frequency || ""} onChange={(e) => updateItem("monitoring_schedule", i, { ...m, frequency: e.target.value })} className="rounded-xl" />
                  <Input placeholder="هدف" value={m.target_value || ""} onChange={(e) => updateItem("monitoring_schedule", i, { ...m, target_value: e.target.value })} className="rounded-xl" />
                  <div className="flex items-center gap-2">
                    <Input placeholder="آستانه هشدار" value={m.alert_threshold || ""} onChange={(e) => updateItem("monitoring_schedule", i, { ...m, alert_threshold: e.target.value })} className="rounded-xl" />
                    <Button variant="outline" size="icon" className="rounded-xl text-red-600" onClick={() => removeItem("monitoring_schedule", i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>پیگیری‌ها</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => addItem("follow_up_appointments", { date: "", purpose: "", status: "scheduled", notes: "" })}>
              <Plus className="w-4 h-4 ml-1" /> افزودن پیگیری
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.follow_up_appointments || []).length === 0 ? (
            <div className="text-sm text-gray-600">پیگیری ثبت نشده است.</div>
          ) : (
            form.follow_up_appointments.map((a, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/80 border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input type="datetime-local" value={toInputDateTime(a.date)} onChange={(e) => updateItem("follow_up_appointments", i, { ...a, date: e.target.value })} className="rounded-xl" />
                  <Input placeholder="هدف" value={a.purpose || ""} onChange={(e) => updateItem("follow_up_appointments", i, { ...a, purpose: e.target.value })} className="rounded-xl" />
                  <Select value={a.status || "scheduled"} onValueChange={(v) => updateItem("follow_up_appointments", i, { ...a, status: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
                      <SelectItem value="completed">انجام‌شده</SelectItem>
                      <SelectItem value="missed">از دست رفته</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => removeItem("follow_up_appointments", i)}>
                    <Trash2 className="w-4 h-4 ml-1" /> حذف
                  </Button>
                </div>
                <Textarea placeholder="یادداشت" value={a.notes || ""} onChange={(e) => updateItem("follow_up_appointments", i, { ...a, notes: e.target.value })} className="rounded-xl" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Progress notes */}
      <Card className="bg-white/70 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>یادداشت‌های پیشرفت</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => addItem("progress_notes", { date: new Date().toISOString(), note: "", severity: "info" })}>
              <Plus className="w-4 h-4 ml-1" /> افزودن یادداشت
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(form.progress_notes || []).length === 0 ? (
            <div className="text-sm text-gray-600">یادداشت ثبت نشده است.</div>
          ) : (
            form.progress_notes.map((n, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input type="datetime-local" value={toInputDateTime(n.date)} onChange={(e) => updateItem("progress_notes", i, { ...n, date: e.target.value })} className="rounded-xl" />
                  <Select value={n.severity || "info"} onValueChange={(v) => updateItem("progress_notes", i, { ...n, severity: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="شدت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">اطلاعات</SelectItem>
                      <SelectItem value="warning">هشدار</SelectItem>
                      <SelectItem value="critical">بحرانی</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Textarea placeholder="متن یادداشت..." value={n.note || ""} onChange={(e) => updateItem("progress_notes", i, { ...n, note: e.target.value })} className="rounded-xl w-full" />
                    <Button variant="outline" size="icon" className="rounded-xl text-red-600" onClick={() => removeItem("progress_notes", i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}