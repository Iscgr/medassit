import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand } from "lucide-react";

export default function SkillCoach({ procedure }) {
  const skills = procedure?.skill_requirements || {};
  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-rose-700 flex items-center gap-2">
          <Hand className="w-5 h-5" /> مربی مهارت
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-2">
        <div>
          <div className="font-semibold mb-1">الگوهای بخیه:</div>
          {skills.suture_patterns?.length ? <div>{skills.suture_patterns.join("، ")}</div> : <div>الگوی بخیه‌ای تعریف نشده.</div>}
        </div>
        <div>
          <div className="font-semibold mb-1">کنترل خونریزی:</div>
          {skills.hemostasis?.length ? <div>{skills.hemostasis.join("، ")}</div> : <div>تکنیک‌های هموستاز ثبت نشده.</div>}
        </div>
        <div>
          <div className="font-semibold mb-1">رفتار بافتی:</div>
          {skills.tissue_handling?.length ? <div>{skills.tissue_handling.join("، ")}</div> : <div>راهنمایی رفتار بافتی موجود نیست.</div>}
        </div>
      </CardContent>
    </Card>
  );
}