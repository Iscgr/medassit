import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function PreSurgicalProtocols({ procedure }) {
  const pa = procedure?.patient_assessment;
  const pos = procedure?.positioning_preparation;

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> پروتکل‌های پیش از عمل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-700">
        <div>
          <div className="font-semibold">ارزیابی بیمار:</div>
          {pa?.required_tests?.length ? <ul className="list-disc pr-5">{pa.required_tests.map((t,i)=><li key={i}>{t}</li>)}</ul> : <div>آزمایش پیش‌عمل ثبت نشده.</div>}
          {pa?.rationale ? <div className="mt-1 text-gray-600">{pa.rationale}</div> : null}
        </div>
        <div>
          <div className="font-semibold">وضعیت و آماده‌سازی استریل:</div>
          {pos?.position ? <div>پوزیشن: {pos.position}</div> : null}
          {pos?.sterile_prep?.length ? <ul className="list-disc pr-5">{pos.sterile_prep.map((s,i)=><li key={i}>{s}</li>)}</ul> : <div>مراحل آماده‌سازی ثبت نشده.</div>}
          {pos?.draping?.length ? <div className="mt-1">دریپینگ: {pos.draping.join("، ")}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}