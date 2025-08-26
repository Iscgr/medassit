
import React from "react";
import { Question } from "@/api/entities";
import { Attempt } from "@/api/entities";
import { User } from "@/api/entities";
import { UserProgress } from "@/api/entities";
import { Achievement } from "@/api/entities";
import RewardsBanner from "@/components/gamification/RewardsBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ChevronRight, CheckCircle2, XCircle, Timer, Save } from "lucide-react";
import PostExamFeedback from "@/components/quizzes/PostExamFeedback";

// تبدیل به forwardRef برای اکسپوز submitNow
const QuizTakerInner = (props, ref) => {
  const {
    quiz,
    onExit,
    integrityBlurCount = 0, // Prop for external blur count, as suggested by outline
  } = props;

  const [questions, setQuestions] = React.useState([]);
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(true); // Changed to true initially for loading
  const [result, setResult] = React.useState(null);
  const [remaining, setRemaining] = React.useState(null);
  const [startedAt, setStartedAt] = React.useState(new Date().toISOString());
  const [rewards, setRewards] = React.useState({ points: 0, unlocked: [] });
  const [blurCount, setBlurCount] = React.useState(0); // Internal state for detailed blur events
  const [integrityWarnings, setIntegrityWarnings] = React.useState([]); // Internal state for detailed integrity warnings

  // Ref to hold the integrityBlurCount from props, used for saving
  const externalBlurRef = React.useRef(integrityBlurCount);
  React.useEffect(() => {
    externalBlurRef.current = integrityBlurCount;
  }, [integrityBlurCount]);

  React.useEffect(() => {
    // ضدتقلب سبک: شمارش خروج از فوکوس
    const onBlur = () => {
      setBlurCount((c) => c + 1);
      setIntegrityWarnings((arr) => [...arr, `خروج از صفحه در ${new Date().toISOString()}`]);
    };
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await Question.filter({ quiz_id: quiz.id }, "-updated_date", 200);
        let q = list || [];
        if (quiz.shuffle_questions) q = q.slice().sort(() => Math.random() - 0.5);
        if (mounted) {
          setQuestions(q);
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        // Handle error appropriately, e.g., show an error message
      } finally {
        if (mounted) {
          setLoading(false);
          setSubmitting(false); // Set submitting to false after loading questions
        }
      }
    })();
    return () => { mounted = false; };
  }, [quiz.id, quiz.shuffle_questions]);

  React.useEffect(() => {
    if (!quiz.time_limit_minutes || quiz.time_limit_minutes <= 0 || questions.length === 0 || loading) return; // Only start timer once questions are loaded

    const endTs = Date.now() + quiz.time_limit_minutes * 60 * 1000;
    setRemaining(endTs - Date.now());
    const it = setInterval(() => {
      const left = endTs - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(it);
        submit("time_up"); // Auto-submit when time runs out, pass reason
      }
    }, 1000);
    return () => clearInterval(it);
  }, [quiz.time_limit_minutes, questions.length, loading]); // Depend on questions.length and loading to ensure timer starts after load

  const selectIndex = (questionId, i, multi) => {
    setAnswers((prev) => {
      const prevAns = prev[questionId] || { indices: [] };
      let next = [];
      if (multi) {
        next = prevAns.indices.includes(i) ? prevAns.indices.filter(x => x !== i) : [...prevAns.indices, i];
      } else {
        next = [i];
      }
      return { ...prev, [questionId]: { ...prevAns, indices: next } };
    });
  };

  const setText = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...(prev[questionId] || {}), text } }));
  };

  // تابع استاندارد ارسال/اتمام آزمون (در منطق موجود صفحه)
  // این تابع تنها وظیفه محاسبه و ایجاد Attempt را دارد و integrity را ذخیره نمی‌کند.
  const _submitCore = async () => {
    let totalPoints = 0;
    let awarded = 0;
    const answerList = [];

    for (const q of questions) {
      const pts = Number(q.points) || 1;
      totalPoints += pts;

      const correct = Array.isArray(q.correct_answers) ? q.correct_answers.slice().sort() : [];
      const resp = answers[q.id] || {};
      let isCorrect = false;
      let pa = 0;

      if (q.type === "mcq" || q.type === "true_false") {
        const picked = Array.isArray(resp.indices) ? resp.indices.slice().sort((a,b) => a-b) : []; // Ensure picked indices are sorted for comparison
        isCorrect = JSON.stringify(picked) === JSON.stringify(correct);
        pa = isCorrect ? pts : 0;
      } else if (q.type === "short_answer") {
        // برای سادگی، پاسخ کوتاه خودکار تصحیح نمی‌شود
        isCorrect = false;
        pa = 0;
      }

      awarded += pa;
      answerList.push({
        question_id: q.id,
        response_indices: resp.indices || [],
        response_text: resp.text || "",
        is_correct: isCorrect,
        points_awarded: pa
      });
    }

    let user = null;
    try { user = await User.me(); } catch { user = null; }

    // Attempt creation now without focus_blur_count and integrity_warnings
    // These will be updated by finalizeAttemptAndSave
    const att = await Attempt.create({
      quiz_id: quiz.id,
      user_email: user?.email || "",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      total_points: totalPoints,
      score_awarded: awarded,
      answers: answerList,
      // focus_blur_count and integrity_warnings will be set by finalizeAttemptAndSave
    });

    // Gamification: calculate percent and time efficiency
    const percent = totalPoints > 0 ? Math.round((awarded / totalPoints) * 100) : 0;
    const totalMillis = (quiz.time_limit_minutes || 0) * 60 * 1000;
    const timeLeftPercent = totalMillis > 0 && remaining !== null ? Math.max(0, Math.round((remaining / totalMillis) * 100)) : 0;

    // Update UserProgress and unlock achievements for logged-in users
    let gainedPoints = 0;
    const unlocked = [];

    if (user?.email) {
      // Load or create user progress
      const list = await UserProgress.list().catch(() => []);
      let up = (list || []).find(u => u.created_by === user.email) || null;
      if (!up) {
        // Default values for new user progress
        up = await UserProgress.create({ total_points: 0, current_level: 1, points_to_next_level: 100, unlocked_achievements: [], created_by: user.email });
      }

      // Base points: percent + completion bonus
      gainedPoints = percent + 5;

      // Check attempts count for user
      const myAttempts = await Attempt.filter({ user_email: user.email }, "-created_date", 1000).catch(() => []);
      const attemptCount = (myAttempts || []).length;

      // Fetch achievements
      const allAch = await Achievement.list("-created_date", 100).catch(() => []);
      const already = new Set((up.unlocked_achievements || []).map(a => a.achievement_id));

      const findByName = (n) => (allAch || []).find(a => (a.name || "").trim() === n.trim());

      const cand = [
        { name: "اولین آزمون", cond: attemptCount >= 1 },
        { name: "سه آزمون", cond: attemptCount >= 3 },
        { name: "نمره بالای ۸۰٪", cond: percent >= 80 },
        { name: "نمره کامل", cond: percent === 100 },
        { name: "استاد زمان", cond: timeLeftPercent >= 30 }
      ];

      const newUnlocked = [];
      for (const c of cand) {
        if (!c.cond) continue;
        const a = findByName(c.name);
        if (!a || already.has(a.id)) continue;
        newUnlocked.push(a);
      }

      // Update points with rewards from achievements
      for (const a of newUnlocked) {
        gainedPoints += Number(a.points_reward || 0);
      }

      // Update UserProgress totals and level
      const newTotal = Number(up.total_points || 0) + gainedPoints;
      const newLevel = Math.max(1, Math.floor(newTotal / 100) + 1); // Assuming 100 points per level
      const pointsToNext = 100 - (newTotal % 100);

      const unlockedRecords = (newUnlocked || []).map(a => ({
        achievement_id: a.id,
        unlocked_at: new Date().toISOString(),
        points_earned: Number(a.points_reward || 0)
      }));

      await UserProgress.update(up.id, {
        total_points: newTotal,
        current_level: newLevel,
        points_to_next_level: pointsToNext,
        unlocked_achievements: [...(up.unlocked_achievements || []), ...unlockedRecords]
      });

      unlocked.push(...newUnlocked);
    }

    setRewards({ points: gainedPoints, unlocked });
    // Enrich result with attempt object for feedback
    setResult({ totalPoints, awarded, attemptId: att.id, attempt: att });
    return att; // Return the created attempt object
  };

  // Helper to finalize attempt by saving integrity data
  const finalizeAttemptAndSave = async (existingSaveFn, extra = {}) => {
    const attemptRecord = await existingSaveFn(); // Call the function that creates/retrieves the attempt

    if (attemptRecord?.id) {
      const outlineWarnings = [];
      const bc = Number(externalBlurRef.current || 0); // Use the external blur count from props
      if (bc >= 1) outlineWarnings.push("page_blur_detected");
      if (extra?.reason === "time_up") outlineWarnings.push("auto_submitted_due_to_timeup");

      // Combine detailed internal integrity warnings with the new outline warnings
      const combinedIntegrityWarnings = [...new Set([...integrityWarnings, ...outlineWarnings])];

      await Attempt.update(attemptRecord.id, {
        focus_blur_count: bc,
        integrity_warnings: combinedIntegrityWarnings
      });
    }
    return attemptRecord; // Return the attempt object
  };

  // This is the main submit function called by the UI buttons and internal timer
  const submit = async (reason) => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      await finalizeAttemptAndSave(_submitCore, { reason }); // Call the wrapper
    } catch (error) {
      console.error("Error submitting quiz or processing gamification:", error);
      // Optionally set an error state to display to the user
    } finally {
      setSubmitting(false);
    }
  };

  // اکسپوز متد submitNow برای والد (پایان زمان، یا فراخوانی دستی)
  React.useImperativeHandle(ref, () => ({
    submitNow: async (extra) => {
      if (submitting || result) {
        console.warn("Attempting to submit quiz that is already submitting or completed.");
        return null;
      }
      setSubmitting(true);
      try {
        const res = await finalizeAttemptAndSave(_submitCore, extra);
        return res;
      } catch (error) {
        console.error("Error force-submitting quiz:", error);
        throw error; // Re-throw to inform parent of failure
      } finally {
        setSubmitting(false);
      }
    }
  }));

  const q = questions[idx];
  const pct = questions.length > 0 ? Math.round(((idx + 1) / questions.length) * 100) : 0;

  if (loading) {
    return <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" />در حال بارگذاری...</div>;
  }

  if (result) {
    const percent = result.totalPoints > 0 ? Math.round((result.awarded / result.totalPoints) * 100) : 0;
    return (
      <Card className="bg-white/70 border-0">
        <CardContent className="p-6 space-y-3">
          <div className="text-xl font-bold text-gray-800">نتیجه آزمون</div>
          <div className="text-sm text-gray-600">نمره: {result.awarded} از {result.totalPoints} ({percent}%)</div>
          <RewardsBanner points={rewards.points} unlocked={rewards.unlocked} />
          {/* بازخورد هوشمند پس از آزمون */}
          <PostExamFeedback attempt={result.attempt} quiz={quiz} questions={questions} />
          <div className="flex gap-2">
            <Button onClick={onExit} className="rounded-xl">بازگشت</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-800">{quiz.title}</div>
        {remaining !== null && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Timer className="w-4 h-4" />
            {remaining > 0 ? `${Math.max(0, Math.floor(remaining / 60000))}:${String(Math.max(0, Math.floor((remaining % 60000) / 1000))).padStart(2, '0')}` : "00:00"}
          </div>
        )}
      </div>

      <Progress value={pct} />

      {q ? (
        <Card className="bg-white/70 border-0">
          <CardContent className="p-6 space-y-3">
            <div className="text-sm text-gray-500">سوال {idx + 1} از {questions.length}</div>
            <div className="font-medium text-gray-800">{q.prompt}</div>

            {q.type === "mcq" && (
              <div className="space-y-2">
                {(q.options || []).map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                    <input
                      type={q.correct_answers?.length > 1 ? "checkbox" : "radio"}
                      name={`q_${q.id}`}
                      checked={(answers[q.id]?.indices || []).includes(i)}
                      onChange={() => selectIndex(q.id, i, (q.correct_answers || []).length > 1)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "true_false" && (
              <div className="space-y-2">
                {["درست", "نادرست"].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      checked={(answers[q.id]?.indices || [])[0] === i}
                      onChange={() => selectIndex(q.id, i, false)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "short_answer" && (
              <textarea
                className="w-full border rounded-xl p-2"
                rows={4}
                placeholder="پاسخ خود را بنویسید"
                value={answers[q.id]?.text || ""}
                onChange={(e) => setText(q.id, e.target.value)}
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
              >
                قبلی
              </Button>
              {idx === questions.length - 1 ? (
                <Button onClick={() => submit()} className="rounded-xl" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}ثبت آزمون
                </Button>
              ) : (
                <Button className="rounded-xl" onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}>
                  بعدی<ChevronRight className="w-4 h-4 mr-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm text-gray-600">سوالی یافت نشد.</div>
      )}
    </div>
  );
};

export default React.forwardRef(QuizTakerInner);
