import React from "react";
import { Quiz } from "@/api/entities";
import { Question } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

export default function AutoQuestionGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [quizzes, setQuizzes] = React.useState([]);
  const [quizId, setQuizId] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("intermediate");
  const [count, setCount] = React.useState(5);
  const [lastResult, setLastResult] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const list = await Quiz.list("-updated_date", 100).catch(() => []);
      setQuizzes(list || []);
      if ((list || []).length > 0 && !quizId) setQuizId(list[0].id);
    })();
  }, [quizId]);

  const sanitizeQuestions = (items) => {
    const arr = Array.isArray(items) ? items : [];
    return arr
      .map((q, idx) => {
        const type = ["mcq", "true_false", "short_answer"].includes(q?.type) ? q.type : "mcq";
        let options = Array.isArray(q?.options) ? q.options.filter(o => typeof o === "string" && o.trim().length > 0) : [];
        let correct = Array.isArray(q?.correct_answers) ? q.correct_answers.filter(n => Number.isInteger(n)) : [];
        let points = Number(q?.points || 1);
        if (type === "true_false") {
          options = ["True", "False"];
          if (correct.length === 0 || ![0,1].includes(correct[0])) correct = [0];
        }
        if (type === "mcq") {
          if (options.length < 2) options = ["Option A", "Option B", "Option C", "Option D"];
          correct = correct.filter(ix => ix >= 0 && ix < options.length);
          if (correct.length === 0) correct = [0];
        }
        if (type === "short_answer") {
          options = [];
          // correct answers by index not applicable; keep empty; explanation holds expected answer
          correct = [];
        }
        if (!Number.isFinite(points) || points <= 0) points = 1;

        return {
          type,
          prompt: (q?.prompt || "").toString().trim().slice(0, 1200),
          options,
          correct_answers: correct,
          points,
          explanation: (q?.explanation || "").toString().slice(0, 1500)
        };
      })
      .filter(q => q.prompt && (q.type !== "mcq" || q.options.length >= 2));
  };

  const handleGenerate = async () => {
    setError("");
    setLastResult(null);
    if (!quizId) {
      setError("ابتدا یک آزمون را انتخاب کنید.");
      return;
    }
    if (!topic.trim()) {
      setError("موضوع تولید سؤال را وارد کنید.");
      return;
    }
    const n = Math.min(15, Math.max(1, Number(count) || 1));

    setLoading(true);
    try {
      const prompt = `
تولید سوالات آزمون دامپزشکی به زبان فارسی (Case-friendly).
- نوع سوال‌ها: mcq یا true_false (از short_answer فقط در صورت نیاز استفاده کن).
- سطح دشواری: ${difficulty}.
- موضوع: ${topic}.
- برای mcq حداقل 4 گزینه بده.
- خروجی را دقیقا مطابق JSON schema خواسته‌شده برگردان.

نکات علمی:
- از منابع معتبر دامپزشکی الهام بگیر.
- از سوگیری و ادعاهای غیرمعتبر پرهیز کن.
- برای هر سوال، در صورت امکان یک توضیح کوتاه (explanation) اضافه کن.

خروجی فقط JSON معتبر باشد.`;

      const schema = {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["mcq", "true_false", "short_answer"] },
                prompt: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answers: { type: "array", items: { type: "number" } },
                points: { type: "number" },
                explanation: { type: "string" }
              },
              required: ["type", "prompt"]
            }
          }
        },
        required: ["questions"]
      };

      const res = await InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      const raw = res?.questions || res?.data?.questions || res;
      const sanitized = sanitizeQuestions(raw?.questions || raw);
      setLastResult({ total: sanitized.length, preview: sanitized.slice(0, 3) });

      if (sanitized.length === 0) {
        setError("نتیجه‌ای از AI دریافت نشد یا نامعتبر بود.");
        setLoading(false);
        return;
      }

      setSaving(true);
      const payload = sanitized.map(q => ({ ...q, quiz_id: quizId }));
      if (payload.length === 1) {
        await Question.create(payload[0]);
      } else {
        await Question.bulkCreate(payload);
      }
    } catch (e) {
      setError(e?.message || "خطا در تولید یا ذخیره سوالات.");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-600" />
          تولید خودکار سؤال با هوش مصنوعی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-sm text-gray-600">آزمون مقصد</Label>
            <Select value={quizId} onValueChange={(v) => setQuizId(v)}>
              <SelectTrigger className="rounded-xl mt-1">
                <SelectValue placeholder="انتخاب آزمون" />
              </SelectTrigger>
              <SelectContent>
                {(quizzes || []).map(q => (
                  <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-gray-600">موضوع</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-xl mt-1" placeholder="مثلاً: بیهوشی در سگ‌ها" />
          </div>
          <div>
            <Label className="text-sm text-gray-600">سطح دشواری</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="rounded-xl mt-1">
                <SelectValue placeholder="انتخاب سطح" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">beginner</SelectItem>
                <SelectItem value="intermediate">intermediate</SelectItem>
                <SelectItem value="advanced">advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-gray-600">تعداد سؤال</Label>
            <Input type="number" min={1} max={15} value={count} onChange={(e) => setCount(e.target.value)} className="rounded-xl mt-1" />
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleGenerate} disabled={loading || saving || !quizId || !topic.trim()} className="rounded-xl">
            {loading || saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            تولید و ذخیره
          </Button>
          {lastResult?.total ? (
            <Badge className="rounded-xl bg-emerald-100 text-emerald-800 border-emerald-200">
              ثبت شد: {lastResult.total} سؤال
            </Badge>
          ) : null}
        </div>

        {lastResult?.preview?.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-600 mb-1">نمونه پیش‌نمایش:</div>
            <ul className="list-disc pr-5 text-sm text-gray-800 space-y-1">
              {lastResult.preview.map((p, i) => (
                <li key={i}>{p.prompt?.slice(0, 120)}{p.prompt?.length > 120 ? "..." : ""}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}