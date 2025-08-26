
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function AttemptTable({ attempts = [], quizzesMap = {} }) {
  if (!attempts || attempts.length === 0) {
    return (
      <Card className="p-4 text-sm text-gray-600 bg-white/70 border-0">
        نتیجه‌ای برای نمایش وجود ندارد.
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white/70">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-right text-gray-600">
            <th className="p-3">تاریخ</th>
            <th className="p-3">عنوان آزمون</th>
            <th className="p-3">کاربر</th>
            <th className="p-3">امتیاز</th>
            <th className="p-3">درصد</th>
            <th className="p-3">وضعیت</th>
            <th className="p-3">جزئیات</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => {
            const quiz = quizzesMap[a.quiz_id] || {};
            const total = Number(a.total_points || 0) || 0;
            const gained = Number(a.score_awarded || 0) || 0;
            const pct = total > 0 ? Math.round((gained / total) * 100) : 0;
            const date = a.completed_at || a.started_at;
            const pass = pct >= 60;
            return (
              <tr key={a.id} className="border-t">
                <td className="p-3 whitespace-nowrap">{date ? new Date(date).toLocaleString("fa-IR") : "-"}</td>
                <td className="p-3">{quiz?.title || "—"}</td>
                <td className="p-3">{a.user_email || "—"}</td>
                <td className="p-3">{gained} / {total}</td>
                <td className="p-3">{pct}%</td>
                <td className="p-3">
                  <Badge className={pass ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"}>
                    {pass ? "قبول" : "نیاز به تلاش بیشتر"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Link to={createPageUrl(`AttemptReview?attempt_id=${a.id}`)}>
                    <Button variant="outline" className="rounded-xl">مشاهده</Button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
