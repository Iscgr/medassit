import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function ComplicationsPanel({ procedure }) {
  const comp = procedure?.potential_complications || [];
  const care = procedure?.postoperative_care;

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> عوارض و مراقبت پس از عمل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {comp.length > 0 && (
          <div>
            <div className="font-semibold mb-1">عوارض احتمالی:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {comp.map((c, i) => (
                <li key={i}>
                  {c.name} • شدت: {c.severity} • پیشگیری: {c.prevention} • مدیریت: {c.management}
                </li>
              ))}
            </ul>
          </div>
        )}
        {care && (
          <div className="space-y-2">
            {care.analgesia?.length > 0 && (
              <div>
                <div className="font-semibold mb-1">کنترل درد:</div>
                <ul className="list-disc pr-5 text-sm text-gray-700">
                  {care.analgesia.map((a, i) => (
                    <li key={i}>{a.drug} • {a.dose} • {a.route} • مدت: {a.duration}</li>
                  ))}
                </ul>
              </div>
            )}
            {care.wound_care && <div><div className="font-semibold mb-1">مراقبت زخم:</div><p className="text-sm text-gray-700">{care.wound_care}</p></div>}
            {care.diet && <div><div className="font-semibold mb-1">رژیم غذایی:</div><p className="text-sm text-gray-700">{care.diet}</p></div>}
            {care.activity_restriction && <div><div className="font-semibold mb-1">محدودیت فعالیت:</div><p className="text-sm text-gray-700">{care.activity_restriction}</p></div>}
            {care.discharge_instructions && <div><div className="font-semibold mb-1">دستورات ترخیص:</div><p className="text-sm text-gray-700">{care.discharge_instructions}</p></div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}