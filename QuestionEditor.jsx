import React from "react";
import { Question } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";

export default function QuestionEditor({ quizId, onSaved }) {
  const [type, setType] = React.useState("mcq");
  const [prompt, setPrompt] = React.useState("");
  const [options, setOptions] = React.useState(["", ""]);
  const [correct, setCorrect] = React.useState([]);
  const [points, setPoints] = React.useState(1);
  const [explanation, setExplanation] = React.useState("");

  const addOption = () => setOptions((o) => [...o, ""]);
  const updateOption = (i, v) => setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));
  const toggleCorrect = (i) =>
    setCorrect((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  const reset = () => {
    setType("mcq"); setPrompt(""); setOptions(["", ""]); setCorrect([]); setPoints(1); setExplanation("");
  };

  const save = async () => {
    const payload = {
      quiz_id: quizId,
      type,
      prompt,
      options: type === "short_answer" ? [] : options.filter((x) => x.trim().length > 0),
      correct_answers: type === "short_answer" ? [] : correct.sort(),
      points: Number(points) || 1,
      explanation: explanation || ""
    };
    await Question.create(payload);
    reset();
    onSaved && onSaved();
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-white/70 border">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input placeholder="صورت سوال" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="نوع سوال" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">چهارگزینه‌ای</SelectItem>
            <SelectItem value="true_false">درست/نادرست</SelectItem>
            <SelectItem value="short_answer">پاسخ کوتاه</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" placeholder="امتیاز" value={points} onChange={(e) => setPoints(e.target.value)} />
      </div>

      {type !== "short_answer" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">گزینه‌ها و پاسخ(ها)</div>
            <Button variant="outline" size="sm" onClick={addOption} className="rounded-xl"><Plus className="w-4 h-4 mr-1" />افزودن گزینه</Button>
          </div>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={correct.includes(idx)}
                  onChange={() => toggleCorrect(idx)}
                />
                <Input value={opt} onChange={(e) => updateOption(idx, e.target.value)} placeholder={`گزینه ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Textarea rows={3} placeholder="توضیح/کلید سوال (اختیاری)" value={explanation} onChange={(e) => setExplanation(e.target.value)} />

      <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" onClick={reset} className="rounded-xl"><Trash2 className="w-4 h-4 mr-1" />ریست</Button>
        <Button onClick={save} className="rounded-xl"><Save className="w-4 h-4 mr-1" />ذخیره سوال</Button>
      </div>
    </div>
  );
}