import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function InstrumentRationale({ procedure }) {
  const list = procedure?.instrument_rationale || [];
  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-fuchsia-700 flex items-center gap-2">
          <Wrench className="w-5 h-5" /> انتخاب ابزار و منطق
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length ? (
          <ul className="list-disc pr-5 text-sm text-gray-700 space-y-1">
            {list.map((it, i) => (
              <li key={i}>
                <span className="font-medium">{it.instrument}:</span> {it.purpose}
                {it.alternatives?.length ? <span className="text-gray-600"> (جایگزین: {it.alternatives.join("، ")})</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-600">منطق انتخاب ابزار هنوز ثبت نشده است.</div>
        )}
      </CardContent>
    </Card>
  );
}