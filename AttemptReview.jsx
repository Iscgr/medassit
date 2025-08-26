
import React from "react";
import { Attempt } from "@/api/entities";
import { Quiz } from "@/api/entities";
import { Question } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { exportAttempt } from "@/api/functions";
import PostExamFeedback from "@/components/quizzes/PostExamFeedback";

export default function AttemptReview() {
  const url = new URLSearchParams(window.location.search);
  const attemptId = url.get("attempt_id");

  const [loading, setLoading] = React.useState(true);
  const [attempt, setAttempt] = React.useState(null);
  const [quiz, setQuiz] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);

  // بارگذاری سوالات و اطلاعات آزمون برای تحلیل پس از آزمون
  const [feedbackQuiz, setFeedbackQuiz] = React.useState(null);
  const [feedbackQuestions, setFeedbackQuestions] = React.useState([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const a = await Attempt.get(attemptId);
      const qz = await Quiz.get(a.quiz_id);
      const qs = await Question.filter({ quiz_id: a.quiz_id }, "-updated_date", 500);
      setAttempt(a);
      setQuiz(qz);
      setQuestions(qs);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  React.useEffect(() => { if (attemptId) load(); }, [attemptId, load]);

  React.useEffect(() => {
    let mounted = true;
    async function loadFeedbackData() {
      // assume 'attempt' object already loaded in the page
      if (!attempt || !attempt.quiz_id) return;

      // بارگذاری اطلاعات آزمون
      const qz = await Quiz.filter({ id: attempt.quiz_id }).catch(() => []);
      if (mounted) setFeedbackQuiz(Array.isArray(qz) && qz.length ? qz[0] : null);

      // بارگذاری سوالات آزمون
      const qs = await Question.filter({ quiz_id: attempt.quiz_id }, "-updated_date", 200).catch(() => []);
      if (mounted) setFeedbackQuestions(qs || []);
    }
    loadFeedbackData();
    return () => { mounted = false; };
  }, [attempt?.quiz_id]);

  const totalPoints = React.useMemo(() => {
    return (questions || []).reduce((s, q) => s + (Number(q.points || 1) || 1), 0);
  }, [questions]);

  const awarded = React.useMemo(() => {
    return (attempt?.answers || []).reduce((s, a) => s + (Number(a.points_awarded || 0) || 0), 0);
  }, [attempt?.answers]);

  const pct = totalPoints > 0 ? Math.round((awarded / totalPoints) * 100) : 0;

  const handleExport = async () => {
    const { data } = await exportAttempt({ attemptId }); // fixed param key
    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attempt_${attemptId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  if (loading) {
    return <div className="text-sm text-gray-600">در حال بارگذاری...</div>;
  }

  if (!attempt || !quiz) {
    return <div className="text-sm text-gray-600">موردی یافت نشد.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-white/70 border-0">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={pct >= 60 ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"}>
              {pct}%
            </Badge>
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> خروجی PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(questions || []).map((q, i) => {
            const ans = (attempt.answers || []).find(a => a.question_id === q.id);
            const isCorrect = !!ans?.is_correct;
            return (
              <div key={q.id} className="p-3 rounded-xl bg-white/60 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-800">سوال {i + 1}: {q.prompt}</div>
                  <Badge className={isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                    {isCorrect ? "صحیح" : "غلط"}
                  </Badge>
                </div>
                {q.type !== "short_answer" && Array.isArray(q.options) && q.options.length > 0 && (
                  <ul className="list-disc pr-5 text-sm text-gray-700 space-y-1">
                    {q.options.map((opt, idx) => {
                      const picked = (ans?.response_indices || []).includes(idx);
                      const correct = (q.correct_answers || []).includes(idx);
                      return (
                        <li key={idx} className={`${picked ? "font-semibold" : ""} ${correct ? "text-emerald-700" : ""}`}>
                          {opt} {picked ? (isCorrect ? <CheckCircle2 className="inline w-4 h-4 mr-1 text-emerald-600" /> : <XCircle className="inline w-4 h-4 mr-1 text-rose-600" />) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {q.explanation ? (
                  <div className="text-xs text-gray-600 mt-2">توضیح: {q.explanation}</div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* بازخورد هوشمند پس از آزمون */}
      {attempt && feedbackQuiz && feedbackQuestions.length > 0 && (
        <PostExamFeedback
          attempt={attempt}
          quiz={feedbackQuiz}
          questions={feedbackQuestions}
        />
      )}
    </div>
  );
}
