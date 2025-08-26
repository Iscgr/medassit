import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Stethoscope } from "lucide-react";

export default function ProcedureMeta({ procedure }) {
  const difficultyMap = {
    beginner: "مقدماتی",
    intermediate: "متوسط",
    advanced: "پیشرفته"
  };
  const diff =
    procedure.difficulty_level
      ? difficultyMap[procedure.difficulty_level]
      : (procedure.difficulty || "—");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.isArray(procedure.species) &&
        procedure.species.slice(0, 4).map((sp, i) => (
          <Badge key={i} variant="outline" className="text-xs">{sp}</Badge>
        ))}
      {procedure.estimated_duration && (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {procedure.estimated_duration}
        </Badge>
      )}
      <Badge className="bg-rose-100 text-rose-800 flex items-center gap-1">
        <Stethoscope className="w-3 h-3" /> {diff}
      </Badge>
    </div>
  );
}