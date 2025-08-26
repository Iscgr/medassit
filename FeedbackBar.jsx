import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIResponse } from "@/api/entities";
import { Feedback } from "@/api/entities";
import { Star } from "lucide-react";

export default function FeedbackBar({ aiResponseId, onSubmitted }) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!aiResponseId) return null;

  const stars = [1, 2, 3, 4, 5];

  const submitFeedback = async () => {
    if (!aiResponseId || rating < 1) return;
    setSubmitting(true);

    // 1) create Feedback record
    await Feedback.create({
      response_id: aiResponseId,
      feedback_type: "rating",
      rating,
      comment: comment?.trim() || "",
      module_type: "conversational",
      tags: []
    });

    // 2) update AIResponse aggregate scores (simple incremental average)
    try {
      const r = await AIResponse.get(aiResponseId);
      const prevCount = Number(r?.feedback_count || 0);
      const prevAvg = Number(r?.average_rating || 0);
      const nextCount = prevCount + 1;
      const nextAvg = Math.round(((prevAvg * prevCount + rating) / nextCount) * 100) / 100;

      await AIResponse.update(aiResponseId, {
        feedback_count: nextCount,
        average_rating: nextAvg
      });
    } catch (e) {
      // let errors bubble via platform; no try/catch needed generally
      // here it's isolated and non-blocking for UX
    }

    setSubmitting(false);
    if (typeof onSubmitted === "function") onSubmitted({ rating, comment });
  };

  return (
    <div className="p-3 bg-white/70 border rounded-2xl flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">ارزیابی این پاسخ:</span>
        <div className="flex items-center gap-1">
          {stars.map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="p-1"
              aria-label={`rating-${s}`}
              title={`${s} ستاره`}
            >
              <Star
                className={`w-5 h-5 ${((hover || rating) >= s) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        placeholder="اگر نکته‌ای هست همین‌جا بنویس…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[72px]"
      />
      <div className="flex justify-end">
        <Button
          onClick={submitFeedback}
          disabled={submitting || rating < 1}
          className="rounded-2xl"
        >
          {submitting ? "در حال ثبت…" : "ثبت بازخورد"}
        </Button>
      </div>
    </div>
  );
}