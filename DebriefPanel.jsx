import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function DebriefPanel({ open, onOpenChange, performance, notes, onClose }) {
  const p = performance || {};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-600" /> دی‌بریف جلسه</DialogTitle>
          <DialogDescription>تحلیل چندبعدی عملکرد و پیشنهادهای بهبود</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="مهارت تکنیکی" value={p.technical_skill} />
          <Metric label="تصمیم‌گیری" value={p.decision_making} />
          <Metric label="مدیریت زمان" value={p.time_management} />
          <Metric label="رفتار بافتی" value={p.tissue_handling} />
          <div className="col-span-2 font-semibold">امتیاز کل: {Math.round(p.overall_score || 0)}</div>
        </div>
        {notes ? <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{notes}</div> : null}
        <div className="flex justify-end">
          <Button onClick={onClose} className="rounded-xl">اتمام</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }) {
  const v = Math.round(value || 0);
  return (
    <div>
      <div className="text-gray-600 mb-1">{label}</div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1">{v}%</div>
    </div>
  );
}