
import React from "react";
import { Quiz } from "@/api/entities";
import { Question } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import QuestionEditor from "./QuestionEditor";

export default function QuizBuilder() {
  const [quiz, setQuiz] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("beginner");
  const [tags, setTags] = React.useState("");
  const [timeLimit, setTimeLimit] = React.useState(10);
  const [shuffle, setShuffle] = React.useState(true);
  const [questions, setQuestions] = React.useState([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [qTypeFilter, setQTypeFilter] = React.useState("all");
  const [qSearch, setQSearch] = React.useState("");

  const saveQuiz = async () => {
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        time_limit_minutes: Number(timeLimit) || 0,
        shuffle_questions: !!shuffle,
        status: "draft"
      };
      const saved = await Quiz.create(payload);
      setQuiz(saved);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = React.useCallback(async () => {
    if (!quiz?.id) return;
    const list = await Question.filter({ quiz_id: quiz.id }, "-updated_date", 100);
    setQuestions(list || []);
  }, [quiz?.id]);

  React.useEffect(() => { loadQuestions(); }, [loadQuestions, refreshKey]);

  const deleteQuestion = async (qId) => {
    await Question.delete(qId);
    setRefreshKey(k => k + 1);
  };

  const visibleQuestions = React.useMemo(() => {
    return (questions || []).filter(q => {
      const byType = qTypeFilter === "all" || q.type === qTypeFilter;
      const byText = !qSearch.trim() || (q.prompt || "").toLowerCase().includes(qSearch.toLowerCase());
      return byType && byText;
    });
  }, [questions, qTypeFilter, qSearch]);

  return (
    <div className="space-y-4" dir="rtl">
      {!quiz ? (
        <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="عنوان آزمون" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="سطح" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">مبتدی</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">پیشرفته</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="زمان (دقیقه)" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
          </div>
          <Textarea rows={3} placeholder="توضیح آزمون" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex items-center gap-3">
            <Input placeholder="برچسب‌ها (با کاما جدا کنید)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
              جابه‌جایی سوالات
            </label>
          </div>
          <Button onClick={saveQuiz} className="rounded-xl" disabled={loading || !title.trim()}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            ساخت آزمون
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/70 border flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-800">{quiz.title}</div>
              <div className="text-sm text-gray-600">شناسه: {quiz.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">{quiz.difficulty}</Badge>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setRefreshKey(k => k + 1)}>
                <RefreshCw className="w-4 h-4 mr-1" />بارگیری سوالات
              </Button>
            </div>
          </div>

          <QuestionEditor quizId={quiz.id} onSaved={() => setRefreshKey(k => k + 1)} />

          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600">جستجو در متن سؤال</label>
                <Input
                  className="rounded-xl mt-1"
                  placeholder="مثلاً «لنفادنوپاتی» یا «anesthesia»"
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                />
              </div>
              <div className="w-48">
                <label className="text-xs text-gray-600">نوع سؤال</label>
                <Select value={qTypeFilter} onValueChange={setQTypeFilter}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue placeholder="نوع سؤال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه</SelectItem>
                    <SelectItem value="mcq">چندگزینه‌ای</SelectItem>
                    <SelectItem value="true_false">درست/نادرست</SelectItem>
                    <SelectItem value="short_answer">پاسخ کوتاه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2">سوالات ثبت‌شده</div>
            <div className="space-y-2">
              {visibleQuestions.length === 0 ? (
                <div className="text-sm text-gray-500">سوالی مطابق فیلترها یافت نشد.</div>
              ) : (
                visibleQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-xl bg-white/60 border flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">Q{idx + 1}. {q.prompt}</div>
                      <div className="text-xs text-gray-500">نوع: {q.type} • امتیاز: {q.points}</div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => deleteQuestion(q.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />حذف
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
