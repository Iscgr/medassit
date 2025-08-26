import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function AssessmentRubric({ procedure }) {
  const r = procedure?.assessment_rubric || {};
  const rows = [
    { key: "technical_skill_weight", label: "مهارت تکنیکی" },
    { key: "decision_making_weight", label: "تصمیم‌گیری" },
    { key: "time_management_weight", label: "مدیریت زمان" },
    { key: "tissue_handling_weight", label: "رفتار بافتی" }
  ];
  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-teal-700 flex items-center gap-2">
          <Scale className="w-5 h-5" /> معیار ارزیابی
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-1">
            <span>{row.label}</span>
            <span className="font-medium">{typeof r[row.key] === "number" ? r[row.key] : "—"}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}