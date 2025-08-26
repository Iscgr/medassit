import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function PreOpPanel({ procedure }) {
  const pre = procedure?.prerequisites || {};
  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-pink-700 flex items-center gap-2">
          <ListChecks className="w-5 h-5" /> پیش‌نیازها و ابزار
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pre.knowledge?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">دانش لازم:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {pre.knowledge.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}
        {pre.skills?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">مهارت‌ها:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {pre.skills.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}
        {procedure.required_instruments?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">ابزار ضروری:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {procedure.required_instruments.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}
        {procedure.required_imaging?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">تصویربرداری پیشنهادی:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {procedure.required_imaging.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}