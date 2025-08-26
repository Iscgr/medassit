
import React from "react";
import { Attempt } from "@/api/entities";
import { Quiz } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, BarChart3, RefreshCw, Filter } from "lucide-react";
import AttemptTable from "@/components/quizzes/AttemptTable";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line
} from "recharts";

export default function QuizResults() {
  const [loading, setLoading] = React.useState(true);
  const [attempts, setAttempts] = React.useState([]);
  const [quizzes, setQuizzes] = React.useState([]);
  const [me, setMe] = React.useState(null);

  // Filters
  const [quizId, setQuizId] = React.useState("all");
  const [onlyMine, setOnlyMine] = React.useState(false);
  const [emailFilter, setEmailFilter] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [qz, at, user] = await Promise.all([
        Quiz.list("-updated_date", 200).catch(() => []),
        Attempt.list("-updated_date", 500).catch(() => []),
        User.me().catch(() => null)
      ]);
      setQuizzes(qz || []);
      setAttempts(at || []);
      setMe(user);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const quizzesMap = React.useMemo(() => {
    const m = {};
    (quizzes || []).forEach(q => { m[q.id] = q; });
    return m;
  }, [quizzes]);

  const filteredAttempts = React.useMemo(() => {
    return (attempts || []).filter(a => {
      if (quizId !== "all" && a.quiz_id !== quizId) return false;
      if (onlyMine && me?.email && a.user_email !== me.email) return false;
      if (emailFilter.trim() && !(a.user_email || "").toLowerCase().includes(emailFilter.toLowerCase())) return false;
      return true;
    });
  }, [attempts, quizId, onlyMine, me?.email, emailFilter]);

  // KPI
  const kpi = React.useMemo(() => {
    if (filteredAttempts.length === 0) return { count: 0, avgPct: 0, passRate: 0 };
    let total = 0, gained = 0, pass = 0;
    for (const a of filteredAttempts) {
      const t = Number(a.total_points || 0) || 0;
      const g = Number(a.score_awarded || 0) || 0;
      total += t; gained += g;
      const pct = t > 0 ? g / t : 0;
      if (pct >= 0.6) pass += 1;
    }
    const avgPct = total > 0 ? Math.round((gained / total) * 100) : 0;
    const passRate = Math.round((pass / filteredAttempts.length) * 100);
    return { count: filteredAttempts.length, avgPct, passRate };
  }, [filteredAttempts]);

  // Chart data: avg percent by quiz
  const chartData = React.useMemo(() => {
    const bucket = {};
    for (const a of filteredAttempts) {
      const t = Number(a.total_points || 0) || 0;
      const g = Number(a.score_awarded || 0) || 0;
      const pct = t > 0 ? (g / t) * 100 : 0;
      bucket[a.quiz_id] = bucket[a.quiz_id] || { quiz_id: a.quiz_id, quiz: quizzesMap[a.quiz_id]?.title || "—", sum: 0, n: 0 };
      bucket[a.quiz_id].sum += pct; bucket[a.quiz_id].n += 1;
    }
    return Object.values(bucket).map(b => ({ name: b.quiz, avg: Math.round(b.sum / b.n) }));
  }, [filteredAttempts, quizzesMap]);

  // روند امتیاز در زمان (LineChart)
  const timeSeriesData = React.useMemo(() => {
    const list = (filteredAttempts || [])
      .slice()
      .sort((a, b) => {
        const at = new Date(a.completed_at || a.started_at || 0).getTime();
        const bt = new Date(b.completed_at || b.started_at || 0).getTime();
        return at - bt;
      })
      .map(a => {
        const t = Number(a.total_points || 0) || 0;
        const g = Number(a.score_awarded || 0) || 0;
        const pct = t > 0 ? Math.round((g / t) * 100) : 0;
        const ts = a.completed_at || a.started_at;
        return {
          name: ts ? new Date(ts).toLocaleDateString("fa-IR") : "—",
          pct
        };
      });
    return list;
  }, [filteredAttempts]);

  return (
    <div className="space-y-6 p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-violet-700" />
          <h1 className="text-2xl font-bold text-gray-800">نتایج و تحلیل آزمون‌ها</h1>
        </div>
        <Button onClick={load} variant="outline" className="rounded-2xl" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          بروزرسانی
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 border-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <Filter className="w-3 h-3" /> آزمون
              </label>
              <Select value={quizId} onValueChange={setQuizId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="انتخاب آزمون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه آزمون‌ها</SelectItem>
                  {(quizzes || []).map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600">فیلتر ایمیل کاربر</label>
              <Input value={emailFilter} onChange={e => setEmailFilter(e.target.value)} placeholder="مثلاً user@example.com" className="rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <input id="onlyMine" type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} />
              <label htmlFor="onlyMine" className="text-sm text-gray-700">فقط نتایج من</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">تعداد تلاش‌ها</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-700">{kpi.count}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">میانگین درصد</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-emerald-700">{kpi.avgPct}%</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">نرخ قبولی</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-amber-700">{kpi.passRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: میانگین درصد به تفکیک آزمون */}
      <Card className="bg-white/70 border-0">
        <CardHeader>
          <CardTitle>میانگین درصد به تفکیک آزمون</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart: روند امتیاز در زمان */}
      <Card className="bg-white/70 border-0">
        <CardHeader>
          <CardTitle>روند امتیاز در زمان</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <AttemptTable attempts={filteredAttempts} quizzesMap={quizzesMap} />
    </div>
  );
}
