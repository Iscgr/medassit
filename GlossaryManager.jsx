import React from "react";
import { VeterinaryGlossary } from "@/api/entities";
import GlossaryEditor from "./GlossaryEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, RefreshCw, Search, Filter, BookOpen } from "lucide-react";

const CATEGORIES = [
  "anatomy","physiology","pathology","pharmacology","surgery","internal_medicine",
  "diagnostics","emergency","anesthesia","radiology","laboratory","parasitology",
  "microbiology","nutrition","reproduction","behavior","ethics","practice_management",
  "species_specific","equipment","procedures"
];

export default function GlossaryManager() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await VeterinaryGlossary.list("-updated_date", 200).catch(() => []);
    setItems(list || []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = (items || []).filter((t) => {
    const matchCat = cat === "all" || t.category === cat;
    const ql = q.trim().toLowerCase();
    const matchQ = !ql || (t.term_english || "").toLowerCase().includes(ql) || (t.term_persian || "").toLowerCase().includes(ql);
    return matchCat && matchQ;
  });

  const startCreate = () => {
    setEditing(null);
    setDraft({
      term_english: "",
      term_persian: "",
      category: "",
      definition_comprehensive: { definition_english: "", definition_persian: "" }
    });
    setOpen(true);
  };

  const startEdit = (term) => {
    setEditing(term);
    setDraft(term);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!draft?.term_english?.trim() || !draft?.term_persian?.trim() || !draft?.category || !draft?.definition_comprehensive?.definition_persian) {
      alert("لطفاً فیلدهای ضروری را تکمیل کنید.");
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) {
        await VeterinaryGlossary.update(editing.id, draft);
      } else {
        await VeterinaryGlossary.create(draft);
      }
      setOpen(false);
      setEditing(null);
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (term) => {
    if (!term?.id) return;
    if (!window.confirm(`حذف "${term.term_persian || term.term_english}"؟`)) return;
    await VeterinaryGlossary.delete(term.id);
    await load();
  };

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-700" />
            مدیریت فرهنگ اصطلاحات
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={load} disabled={loading}>
              <RefreshCw className="w-4 h-4 ml-1" /> بروزرسانی
            </Button>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500" onClick={startCreate}>
              <Plus className="w-4 h-4 ml-1" /> افزودن اصطلاح
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در فارسی/انگلیسی..." className="rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="all">همه دسته‌ها</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="h-24 rounded-2xl bg-gradient-to-r from-gray-100 to-rose-100 animate-pulse" />
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-500">اصطلاحی یافت نشد.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-gray-800">{t.term_persian} <span className="text-xs text-gray-500">({t.term_english})</span></div>
                  <div className="text-xs text-gray-600 mt-1">{t.category}</div>
                  {t.definition_comprehensive?.definition_persian && (
                    <div className="text-sm text-gray-700 mt-2 line-clamp-2">{t.definition_comprehensive.definition_persian}</div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(t.subcategory) && t.subcategory.slice(0, 4).map((s, i) => (
                      <Badge key={i} variant="secondary" className="rounded-xl">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit(t)}>
                    <Pencil className="w-4 h-4 ml-1" /> ویرایش
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600" onClick={() => handleDelete(t)}>
                    <Trash2 className="w-4 h-4 ml-1" /> حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش اصطلاح" : "افزودن اصطلاح جدید"}</DialogTitle>
          </DialogHeader>
          <GlossaryEditor value={editing || {}} onChange={setDraft} />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>انصراف</Button>
            <Button className="rounded-xl" onClick={handleSave} disabled={saving}>
              {saving ? "در حال ذخیره..." : (editing ? "ذخیره تغییرات" : "ایجاد اصطلاح")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}