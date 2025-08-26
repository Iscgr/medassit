import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";

export default function AnesthesiaPanel({ procedure }) {
  const plan = procedure?.anesthesia_plan;
  const monitoring = procedure?.intraoperative_monitoring;
  if (!plan && !monitoring) return null;

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-purple-700 flex items-center gap-2">
          <HeartPulse className="w-5 h-5" /> بیهوشی و مانیتورینگ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan?.protocol && (
          <div>
            <div className="font-semibold mb-1">پروتکل:</div>
            <p className="text-sm text-gray-700">{plan.protocol}</p>
          </div>
        )}
        {plan?.drugs?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">داروها:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {plan.drugs.map((d, i) => (
                <li key={i}>
                  {d.name} • {d.dose} • {d.route} {d.notes ? `— ${d.notes}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {plan?.monitoring_plan?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">پلان مانیتورینگ (پیش‌فرض):</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {plan.monitoring_plan.map((m, i) => (
                <li key={i}>{m.parameter}: {m.target_range} • هر {m.frequency_min} دقیقه</li>
              ))}
            </ul>
          </div>
        )}
        {monitoring?.length > 0 && (
          <div>
            <div className="font-semibold mb-1">هشدارهای حین عمل:</div>
            <ul className="list-disc pr-5 text-sm text-gray-700">
              {monitoring.map((m, i) => (
                <li key={i}>
                  {m.parameter}: نرمال {m.normal_range} • آستانه هشدار {m.alert_threshold} • اقدام: {m.action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}