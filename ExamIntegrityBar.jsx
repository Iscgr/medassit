
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer, EyeOff, AlertTriangle } from "lucide-react";

export default function ExamIntegrityBar({ quiz, onTimeUp, onBlurCountChange }) {
  const limitMin = Number(quiz?.time_limit_minutes || 0) || 0;
  const [remainingMs, setRemainingMs] = React.useState(limitMin > 0 ? limitMin * 60 * 1000 : 0);
  const [startedAt] = React.useState(Date.now());
  const [blurCount, setBlurCount] = React.useState(0);

  React.useEffect(() => {
    let intervalId;
    if (limitMin > 0) {
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const left = Math.max(0, limitMin * 60 * 1000 - elapsed);
        setRemainingMs(left);
        if (left === 0) {
          clearInterval(intervalId);
          if (typeof onTimeUp === "function") onTimeUp();
        }
      }, 500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [limitMin, startedAt, onTimeUp]);

  React.useEffect(() => {
    const onBlur = () => setBlurCount((c) => c + 1);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  // NEW: notify parent on blurCount change
  React.useEffect(() => {
    if (typeof onBlurCountChange === "function") {
      onBlurCountChange(blurCount);
    }
  }, [blurCount, onBlurCountChange]);

  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const pct = limitMin > 0 ? Math.max(0, Math.min(100, (remainingMs / (limitMin * 60 * 1000)) * 100)) : 0;

  return (
    <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-violet-700" />
          <div className="text-sm font-medium text-gray-800">
            {limitMin > 0 ? `زمان باقی‌مانده: ${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : "این آزمون محدودیت زمانی ندارد"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-xl bg-amber-100 text-amber-800">
            <EyeOff className="w-3 h-3 ml-1" />
            خروج از صفحه: {blurCount}
          </Badge>
          {blurCount >= 2 && (
            <div className="flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="w-3 h-3" /> لطفاً تمرکز را حفظ کنید
            </div>
          )}
        </div>
      </div>
      {limitMin > 0 && (
        <div className="mt-2">
          <Progress value={pct} className="h-2" />
        </div>
      )}
    </div>
  );
}
