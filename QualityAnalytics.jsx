import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3, RefreshCw } from "lucide-react";
import { feedbackProcessor } from "@/api/functions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function QualityAnalytics() {
  const [loading, setLoading] = React.useState(false);
  const [range, setRange] = React.useState("7d"); // 24h | 7d | 30d
  const [metrics, setMetrics] = React.useState(null);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await feedbackProcessor({
        action: "getQualityMetrics",
        payload: { moduleType: "conversational", timeRange: range }
      });
      const data = res?.data || res || {};
      setMetrics(data);
    } catch (e) {
      setError(e?.message || "خطا در دریافت داده‌ها");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    load();
  }, [load]);

  const tagData = React.useMemo(() => {
    const tf = metrics?.tagFrequency || {};
    return Object.entries(tf)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [metrics]);

  const kpi = {
    totalFeedbacks: metrics?.totalFeedbacks || 0,
    averageRating: metrics?.averageRating || 0,
    correctionRate: metrics?.correctionRate || 0
  };

  return (
    <div className="space-y-6 p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-rose-700" />
          <h1 className="text-2xl font-bold text-gray-800">تحلیل کیفیت گفتگوها</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36 rounded-2xl">
              <SelectValue placeholder="بازه زمانی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">۲۴ ساعت</SelectItem>
              <SelectItem value="7d">۷ روز</SelectItem>
              <SelectItem value="30d">۳۰ روز</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={load} variant="outline" className="rounded-2xl" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            بروزرسانی
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">تعداد بازخوردها</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-700">{kpi.totalFeedbacks}</div>
            <div className="text-xs text-gray-500 mt-1">در بازه انتخابی</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">میانگین امتیاز</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-emerald-700">{kpi.averageRating.toFixed(1)}</div>
            <div className="text-xs text-gray-500 mt-1">از ۵</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">نرخ اصلاح محتوا</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-amber-700">{kpi.correctionRate}%</div>
            <div className="text-xs text-gray-500 mt-1">درصد بازخوردهای نوع اصلاح</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur border-0">
        <CardHeader>
          <CardTitle className="text-gray-800">برچسب‌های پرتکرار بازخورد</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> در حال بارگذاری نمودار...
            </div>
          ) : tagData.length === 0 ? (
            <div className="text-sm text-gray-500">داده‌ای برای نمایش وجود ندارد.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {tagData.map((t) => (
              <Badge key={t.name} variant="secondary" className="rounded-xl bg-rose-100 text-rose-700 border-rose-200">
                {t.name} — {t.value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}