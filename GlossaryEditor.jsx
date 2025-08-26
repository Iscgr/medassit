import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  "anatomy","physiology","pathology","pharmacology","surgery","internal_medicine",
  "diagnostics","emergency","anesthesia","radiology","laboratory","parasitology",
  "microbiology","nutrition","reproduction","behavior","ethics","practice_management",
  "species_specific","equipment","procedures"
];

export default function GlossaryEditor({ value = {}, onChange }) {
  const [form, setForm] = React.useState({
    term_english: value.term_english || "",
    term_persian: value.term_persian || "",
    category: value.category || "",
    def_en: value.definition_comprehensive?.definition_english || "",
    def_fa: value.definition_comprehensive?.definition_persian || ""
  });

  React.useEffect(() => {
    setForm({
      term_english: value.term_english || "",
      term_persian: value.term_persian || "",
      category: value.category || "",
      def_en: value.definition_comprehensive?.definition_english || "",
      def_fa: value.definition_comprehensive?.definition_persian || ""
    });
  }, [value?.id]);

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange && onChange({
      term_english: next.term_english,
      term_persian: next.term_persian,
      category: next.category,
      definition_comprehensive: {
        definition_english: next.def_en,
        definition_persian: next.def_fa
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">اصطلاح (انگلیسی)</label>
        <Input value={form.term_english} onChange={(e) => update("term_english", e.target.value)} className="rounded-xl mt-1" placeholder="e.g., Femur" />
      </div>
      <div>
        <label className="text-sm text-gray-600">اصطلاح (فارسی)</label>
        <Input value={form.term_persian} onChange={(e) => update("term_persian", e.target.value)} className="rounded-xl mt-1" placeholder="مثلاً: استخوان ران" />
      </div>
      <div>
        <label className="text-sm text-gray-600">دسته‌بندی</label>
        <Select value={form.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger className="rounded-xl mt-1">
            <SelectValue placeholder="انتخاب دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm text-gray-600">تعریف (انگلیسی)</label>
        <Textarea rows={3} value={form.def_en} onChange={(e) => update("def_en", e.target.value)} className="rounded-xl mt-1" placeholder="Comprehensive English definition..." />
      </div>
      <div>
        <label className="text-sm text-gray-600">تعریف (فارسی)</label>
        <Textarea rows={4} value={form.def_fa} onChange={(e) => update("def_fa", e.target.value)} className="rounded-xl mt-1" placeholder="تعریف جامع فارسی..." />
      </div>
    </div>
  );
}