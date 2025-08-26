import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function PostOpDocumentation({ session, onSave }) {
  const [doc, setDoc] = React.useState(session?.documentation || {});
  React.useEffect(() => { setDoc(session?.documentation || {}); }, [session?.id]);
  const f = (k) => (e) => setDoc((d) => ({ ...d, [k]: e.target.value }));

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5" /> مستندسازی عمل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {["preop_assessment","anesthesia","procedure_summary","intraoperative_findings","complications","suture_materials","counts","post_op_plan","client_communication","team_communication"].map((k)=>(
          <div key={k}>
            <div className="text-sm font-medium text-gray-700 mb-1">{labelMap[k]}</div>
            <Textarea rows={3} value={doc?.[k] || ""} onChange={f(k)} />
          </div>
        ))}
        <div className="flex justify-end">
          <Button className="rounded-xl" onClick={()=>onSave?.(doc)}>ذخیره مستندسازی</Button>
        </div>
      </CardContent>
    </Card>
  );
}

const labelMap = {
  preop_assessment: "ارزیابی پیش‌عمل",
  anesthesia: "بیهوشی",
  procedure_summary: "خلاصه عمل",
  intraoperative_findings: "یافته‌های حین عمل",
  complications: "عوارض",
  suture_materials: "نخ‌ها/مواد",
  counts: "شمارش ابزار/گاز",
  post_op_plan: "پلان پس از عمل",
  client_communication: "گفت‌وگو با صاحب حیوان",
  team_communication: "هماهنگی تیمی"
};