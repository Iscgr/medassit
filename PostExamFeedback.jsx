import React from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Lightbulb } from "lucide-react";

export default function PostExamFeedback({ attempt, quiz, questions }) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");

  const buildPayload = React.useCallback(() => {
    const qpack = (questions || []).map(q => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options || [],
      correct_answers: q.correct_answers || [],
      points: q.points || 1,
      explanation: q.explanation || "",
    }));
    const answers = (attempt?.answers || []).map(a => ({
      question_id: a.question_id,
      response_indices: a.response_indices || [],
      response_text: a.response_text || "",
      is_correct: !!a.is_correct,
      points_awarded: a.points_awarded || 0
    }));
    return { quiz: { id: quiz?.id, title: quiz?.title }, qpack, answers };
  }, [attempt?.answers, questions, quiz?.id, quiz?.title]);

  const analyze = async () => {
    if (!quiz || !Array.isArray(questions) || questions.length === 0 || !attempt) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const payload = buildPayload();
      const prompt = `
تحلیل آموزشی نتیجه آزمون دامپزشکی:
- داده‌های آزمون در ادامه به‌صورت JSON آمده است؛ فقط بر اساس همین داده تحلیل کن.
- خروجی کوتاه، کاربردی و فارسی باشد: نقاط قوت، موارد نیاز به بهبود، موضوعات پیشنهادی برای مطالعه، و در صورت امکان زمان پیشنهادی مطالعه.
- از ارجاع به منابع بیرونی خودداری کن.

JSON:
${JSON.stringify(payload)}
      `.trim();

      const schema = {
        type: "object",
        properties: {
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          recommended_topics: { type: "array", items: { type: "string" } },
          study_minutes_suggestion: { type: "number" }
        },
        required: ["strengths", "weaknesses", "recommended_topics"]
      };

      const res = await InvokeLLM({
        prompt,
        response_json_schema: schema,
        add_context_from_internet: false
      });

      const d = res?.data || res;
      setData(d);
    } catch (e) {
      setError(e?.message || "خطا در تحلیل عملکرد.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-600" />
          بازخورد هوشمند پس از آزمون
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" /> در حال تحلیل نتایج...
          </div>
        )}
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2">
            {error}
          </div>
        )}
        {data && (
          <div className="space-y-4">
            {Array.isArray(data.strengths) && data.strengths.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-emerald-700 mb-2">نقاط قوت</div>
                <div className="flex flex-wrap gap-2">
                  {data.strengths.map((s, i) => (
                    <Badge key={i} className="rounded-xl bg-emerald-100 text-emerald-800 border-emerald-200">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(data.weaknesses) && data.weaknesses.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-rose-700 mb-2">نیاز به بهبود</div>
                <div className="flex flex-wrap gap-2">
                  {data.weaknesses.map((s, i) => (
                    <Badge key={i} className="rounded-xl bg-rose-100 text-rose-800 border-rose-200">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(data.recommended_topics) && data.recommended_topics.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-violet-700 mb-2">موضوعات پیشنهادی مطالعه</div>
                <ul className="list-disc pr-5 text-sm text-gray-700 space-y-1">
                  {data.recommended_topics.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            {typeof data.study_minutes_suggestion === "number" && data.study_minutes_suggestion > 0 && (
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                زمان پیشنهادی مطالعه: {data.study_minutes_suggestion} دقیقه
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}