import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function ProcedureObjectives({ procedure }) {
  const list = procedure?.learning_objectives || [];
  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-indigo-700 flex items-center gap-2">
          <Target className="w-5 h-5" /> اهداف یادگیری
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length ? (
          <ul className="list-disc pr-5 text-sm text-gray-700 space-y-1">
            {list.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        ) : (
          <div className="text-sm text-gray-600">برای این عمل هنوز هدف آموزشی ثبت نشده است.</div>
        )}
      </CardContent>
    </Card>
  );
}