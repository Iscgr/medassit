import React from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, CheckCircle2, Pill, Loader2 } from "lucide-react";

export default function SmartTreatmentAlerts({ treatmentPlan, animalProfile }) {
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const analyzeInteractions = React.useCallback(async () => {
    if (!treatmentPlan?.medications || !Array.isArray(treatmentPlan.medications) || treatmentPlan.medications.length === 0) {
      setAlerts([]);
      return;
    }

    setLoading(true);
    setError("");
    setAlerts([]);

    try {
      const medData = treatmentPlan.medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration
      }));

      const speciesInfo = {
        species: animalProfile?.species || "نامشخص",
        breed: animalProfile?.breed || "",
        age: animalProfile?.age || ""
      };

      const prompt = `
بررسی هوشمند طرح درمان دامپزشکی:

اطلاعات بیمار:
گونه: ${speciesInfo.species}
نژاد: ${speciesInfo.breed}
سن: ${speciesInfo.age}

داروهای تجویز شده:
${JSON.stringify(medData, null, 2)}

لطفاً موارد زیر را بررسی کنید:
1. تداخلات دارویی احتمالی بین داروهای تجویز شده
2. مناسب بودن دوز برای گونه و سن حیوان
3. نکات مهم مراقبتی و پروتکل‌های نظارت
4. هشدارهای ضروری برای صاحب حیوان

پاسخ را به صورت ساختاری در قالب JSON ارائه دهید.
      `;

      const schema = {
        type: "object",
        properties: {
          drug_interactions: {
            type: "array",
            items: {
              type: "object", 
              properties: {
                drugs: { type: "array", items: { type: "string" } },
                severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                description: { type: "string" }
              }
            }
          },
          dosage_warnings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                drug: { type: "string" },
                issue: { type: "string" },
                severity: { type: "string", enum: ["low", "moderate", "high", "critical"] }
              }
            }
          },
          monitoring_protocols: { type: "array", items: { type: "string" } },
          owner_alerts: { type: "array", items: { type: "string" } }
        },
        required: ["drug_interactions", "dosage_warnings", "monitoring_protocols", "owner_alerts"]
      };

      const res = await InvokeLLM({
        prompt,
        response_json_schema: schema,
        add_context_from_internet: false
      });

      const data = res?.data || res || {};
      
      const alertList = [
        ...(data.drug_interactions || []).map(interaction => ({
          type: "interaction",
          severity: interaction.severity,
          icon: AlertTriangle,
          title: `تداخل دارویی: ${interaction.drugs?.join(" + ")}`,
          description: interaction.description
        })),
        ...(data.dosage_warnings || []).map(warning => ({
          type: "dosage",
          severity: warning.severity,
          icon: Pill,
          title: `هشدار دوز: ${warning.drug}`,
          description: warning.issue
        })),
        ...(data.monitoring_protocols || []).map(protocol => ({
          type: "monitoring",
          severity: "moderate",
          icon: Shield,
          title: "پروتکل نظارت",
          description: protocol
        })),
        ...(data.owner_alerts || []).map(alert => ({
          type: "owner",
          severity: "moderate", 
          icon: CheckCircle2,
          title: "نکته برای صاحب حیوان",
          description: alert
        }))
      ];

      setAlerts(alertList);

    } catch (e) {
      setError(e?.message || "خطا در تحلیل طرح درمان");
    } finally {
      setLoading(false);
    }
  }, [treatmentPlan?.medications, animalProfile?.species, animalProfile?.breed, animalProfile?.age]);

  React.useEffect(() => {
    analyzeInteractions();
  }, [analyzeInteractions]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/70 border-0">
        <CardContent className="p-4 flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          در حال بررسی تداخلات دارویی و صحت طرح درمان...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>خطا در تحلیل طرح درمان: {error}</AlertDescription>
      </Alert>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div className="text-green-800 font-medium">طرح درمان بررسی شد - هیچ هشدار مهمی یافت نشد</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          هشدارهای هوشمند طرح درمان
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const IconComponent = alert.icon;
          return (
            <div key={index} className={`p-3 rounded-xl border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start gap-3">
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium mb-1">{alert.title}</div>
                  <div className="text-sm">{alert.description}</div>
                </div>
                <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                  {alert.severity === "critical" ? "بحرانی" :
                   alert.severity === "high" ? "مهم" :
                   alert.severity === "moderate" ? "متوسط" : "کم"}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}