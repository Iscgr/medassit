
import React from "react";
import { Quiz } from "@/api/entities";
import QuizBuilder from "@/components/quizzes/QuizBuilder";
import QuizTaker from "@/components/quizzes/QuizTaker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Play, CheckCircle2, Eye, Filter, RefreshCw } from "lucide-react";
import AutoQuestionGenerator from "@/components/quizzes/AutoQuestionGenerator";
import ExamIntegrityBar from "@/components/quizzes/ExamIntegrityBar"; // Added import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Quizzes() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [qFilter, setQFilter] = React.useState("");
  const [current, setCurrent] = React.useState(null);
  const [view, setView] = React.useState("browse"); // browse | build

  const [statusFilter, setStatusFilter] = React.useState("all");
  const [diffFilter, setDiffFilter] = React.useState("all");
  const [tagFilter, setTagFilter] = React.useState("");

  const quizTakerRef = React.useRef(null);
  const [examBlurCount, setExamBlurCount] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const items = await Quiz.list("-updated_date", 50);
      setList(items || []);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const filtered = (list || []).filter(q => {
    const byTitle = !qFilter.trim() || (q.title || "").toLowerCase().includes(qFilter.toLowerCase());
    const byStatus = statusFilter === "all" || q.status === statusFilter;
    const byDiff = diffFilter === "all" || q.difficulty === diffFilter;
    const byTag = !tagFilter.trim() || (Array.isArray(q.tags) && q.tags.some(t => (t || "").toLowerCase().includes(tagFilter.toLowerCase())));
    return byTitle && byStatus && byDiff && byTag;
  });

  return (
    <div className="space-y-6 p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-violet-700" />
          <h1 className="text-2xl font-bold text-gray-800">آزمون‌ها</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === "browse" ? "default" : "outline"} className="rounded-xl" onClick={() => setView("browse")}>مرور</Button>
          <Button variant={view === "build" ? "default" : "outline"} className="rounded-xl" onClick={() => setView("build")}>ساخت آزمون</Button>
          <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />} بروزرسانی
          </Button>
        </div>
      </div>

      {view === "build" ? (
        <Card className="bg-white/70 border-0">
          <CardContent className="p-6 space-y-6">
            <AutoQuestionGenerator />
            <div className="border-t pt-6">
              <QuizBuilder />
            </div>
          </CardContent>
        </Card>
      ) : current ? (
        <Card className="bg-white/70 border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>شرکت در آزمون</span>
              <Button variant="outline" className="rounded-xl" onClick={() => setCurrent(null)}>بازگشت</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* نوار یکپارچگی آزمون */}
            <ExamIntegrityBar
              quiz={current}
              onBlurCountChange={(n) => setExamBlurCount(n)}
              onTimeUp={() => {
                // خودارسالی پایان زمان (بدون فیچر جدید)
                if (quizTakerRef.current && typeof quizTakerRef.current.submitNow === "function") {
                  quizTakerRef.current.submitNow({ reason: "time_up" });
                } else {
                  alert("زمان آزمون به پایان رسید.");
                }
              }}
            />
            <QuizTaker
              ref={quizTakerRef}
              quiz={current}
              onExit={() => setCurrent(null)}
              integrityBlurCount={examBlurCount} // NEW: pass blur count
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/70 border-0">
          <CardHeader>
            <CardTitle>مرور آزمون‌های موجود</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* جستجو بر اساس عنوان */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Input placeholder="جستجو در عنوان آزمون..." value={qFilter} onChange={(e) => setQFilter(e.target.value)} />
            </div>

            {/* فیلترها: وضعیت / سطح / برچسب */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600">وضعیت</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="published">منتشر شده</SelectItem>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-600">سطح دشواری</label>
                <Select value={diffFilter} onValueChange={setDiffFilter}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="سطح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="beginner">مبتدی</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">پیشرفته</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-600">برچسب</label>
                <Input
                  className="rounded-xl mt-1"
                  placeholder="مثلاً surgery یا anatomy"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                />
              </div>
            </div>

            {/* لیست */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-500">آزمونی مطابق فیلترها یافت نشد.</div>
              ) : (
                filtered.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-800">{q.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{q.description}</div>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          <Badge className="rounded-xl">{q.difficulty}</Badge>
                          {q.time_limit_minutes ? <Badge variant="secondary" className="rounded-xl">{q.time_limit_minutes} دقیقه</Badge> : null}
                          <Badge variant="outline" className="rounded-xl">{q.status === "published" ? "منتشر شده" : "پیش‌نویس"}</Badge>
                          {Array.isArray(q.tags) && q.tags.slice(0, 2).map((t, i) => (
                            <Badge key={i} variant="outline" className="rounded-xl">#{t}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="rounded-xl" onClick={() => setCurrent(q)} disabled={q.status !== "published"}>
                        <Play className="w-4 h-4 mr-1" />شروع
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
