import React from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Microscope, Loader2, Lightbulb } from "lucide-react";

export default function AdvancedDiagnosticSimulator({ animalProfile, currentCase }) {
  const [symptoms, setSymptoms] = React.useState("");
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (currentCase?.chief_complaint && !symptoms.trim()) {
      setSymptoms(currentCase.chief_complaint);
    }
  }, [currentCase?.chief_complaint, symptoms]);

  const runDiagnosticAnalysis = async () => {
    if (!symptoms.trim() || !animalProfile) return;

    setLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const prompt = `
تحلیل تشخیصی پیشرفته دامپزشکی:

اطلاعات بیمار:
- گونه: ${animalProfile.species}
- نژاد: ${animalProfile.breed || 'نامشخص'}
- سن: ${animalProfile.age || 'نامشخص'}

علائم و شکایات اصلی:
${symptoms}

لطفاً تحلیل جامع تشخیصی شامل موارد زیر ارائه دهید:
1. تشخیص‌های افتراقی محتمل
2. آزمایش‌های تشخیصی پیشنهادی
3. اولویت‌بندی تشخیص‌ها
4. نکات مهم بالینی

پاسخ به فارسی و در قالب JSON ساختاری ارائه دهید.
      `;

      const schema = {
        type: "object",
        properties: {
          differential_diagnoses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                diagnosis: { type: "string" },
                probability: { type: "string", enum: ["high", "moderate", "low"] },
                reasoning: { type: "string" }
              }
            }
          },
          recommended_tests: {
            type: "array",
            items: {
              type: "object",
              properties: {
                test_name: { type: "string" },
                priority: { type: "string", enum: ["urgent", "high", "moderate", "low"] },
                purpose: { type: "string" }
              }
            }
          },
          clinical_notes: { type: "array", items: { type: "string" } }
        },
        required: ["differential_diagnoses", "recommended_tests", "clinical_notes"]
      };

      const res = await InvokeLLM({
        prompt,
        response_json_schema: schema,
        add_context_from_internet: false
      });

      const data = res?.data || res;
      setAnalysisResult(data);

    } catch (e) {
      setError(e?.message || "خطا در تحلیل تشخیصی");
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (prob) => {
    switch (prob) {
      case "high": return "bg-red-100 text-red-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          شبیه‌ساز تشخیص پیشرفته
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            علائم و شکایات اصلی:
          </label>
          <Textarea
            placeholder="علائم بالینی، رفتار غیرعادی، تغییرات فیزیکی و..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="rounded-xl"
            rows={4}
          />
        </div>

        <Button 
          onClick={runDiagnosticAnalysis}
          disabled={loading || !symptoms.trim()}
          className="w-full rounded-xl bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              در حال تحلیل...
            </>
          ) : (
            <>
              <Microscope className="w-4 h-4 mr-2" />
              تحلیل تشخیصی هوشمند
            </>
          )}
        </Button>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="space-y-4">
            {Array.isArray(analysisResult.differential_diagnoses) && analysisResult.differential_diagnoses.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  تشخیص‌های افتراقی
                </h4>
                <div className="space-y-2">
                  {analysisResult.differential_diagnoses.map((dx, i) => (
                    <div key={i} className={`p-3 rounded-xl ${getProbabilityColor(dx.probability)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{dx.diagnosis}</div>
                          <div className="text-sm mt-1">{dx.reasoning}</div>
                        </div>
                        <Badge className="rounded-xl bg-white/50">
                          {dx.probability === 'high' ? 'احتمال بالا' :
                           dx.probability === 'moderate' ? 'احتمال متوسط' : 'احتمال پایین'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(analysisResult.recommended_tests) && analysisResult.recommended_tests.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">آزمایش‌های پیشنهادی</h4>
                <div className="space-y-2">
                  {analysisResult.recommended_tests.map((test, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{test.test_name}</div>
                          <div className="text-sm text-gray-600 mt-1">{test.purpose}</div>
                        </div>
                        <Badge className={`rounded-xl ${getPriorityColor(test.priority)}`}>
                          {test.priority === 'urgent' ? 'فوری' :
                           test.priority === 'high' ? 'بالا' :
                           test.priority === 'moderate' ? 'متوسط' : 'پایین'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(analysisResult.clinical_notes) && analysisResult.clinical_notes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">نکات بالینی</h4>
                <div className="space-y-1">
                  {analysisResult.clinical_notes.map((note, i) => (
                    <div key={i} className="text-sm text-gray-700 p-2 rounded-lg bg-blue-50">
                      • {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}