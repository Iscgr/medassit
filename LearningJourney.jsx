import React from "react";
import { learningJourney } from "@/api/functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Compass, Target, Brain, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { User } from "@/api/entities";

export default function LearningJourney() {
  const [loading, setLoading] = React.useState(false);
  const [journey, setJourney] = React.useState([]);
  const [profile, setProfile] = React.useState(null);
  const [recs, setRecs] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [lastFetch, setLastFetch] = React.useState(0);
  const [unauthorized, setUnauthorized] = React.useState(false);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchData = React.useCallback(async () => {
    const now = Date.now();
    
    if (lastFetch > 0 && (now - lastFetch < CACHE_DURATION)) {
      return;
    }

    setLoading(true);
    setError(null);
    setUnauthorized(false);

    try {
      const res = await learningJourney({ action: "analyzeAndGet" });
      const payload = res?.data || res || {};
      
      // Extract journey metrics from progress analytics
      const progressData = payload.progress_analytics || {};
      const j = [
        { label: "دقیقه مطالعه", value: progressData.total_study_minutes || 0, unit: "دقیقه" },
        { label: "میانگین نمرات", value: progressData.knowledge_mastery || 0, unit: "%" },
        { label: "کیس‌های تحلیل‌شده", value: progressData.cases_completed || 0, unit: "کیس" },
        { label: "تسلط مهارت", value: progressData.skill_development || 0, unit: "%" }
      ];

      const p = payload.user_profile || null;
      const r = payload.personalized_recommendations?.immediate_actions || [];

      setJourney(j);
      setProfile(p);
      setRecs(r);
      
    } catch (e) {
      const status = e?.response?.status || 0;
      const msg = e?.message || "";
      
      if (status === 401 || /unauthorized/i.test(msg)) {
        setUnauthorized(true);
        setError("Unauthorized");
      } else {
        console.warn('خطا در بارگیری مسیر یادگیری:', e?.message || e);
        setError(e?.message || "خطا");
        
        // Fallback data
        setJourney([
          { label: "مطالعه کل", value: 0, unit: "دقیقه" },
          { label: "میانگین نمرات", value: 0, unit: "%" },
          { label: "کیس‌های تحلیل‌شده", value: 0, unit: "کیس" },
          { label: "تمرین‌های جراحی", value: 0, unit: "جلسه" }
        ]);
        setProfile({ strengths: [], preferred_learning_styles: [] });
        setRecs([
          {
            title: "شروع با مطالعه منابع پایه",
            description: "برای ایجاد پایه محکم در علوم دامپزشکی",
            estimated_time: 30,
            page: "AcademicAssistant"
          }
        ]);
      }
    } finally {
      setLastFetch(Date.now());
      setLoading(false);
    }
  }, [lastFetch, CACHE_DURATION]);

  React.useEffect(() => {
    const timer = setTimeout(fetchData, 1000);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // نمایش حالت Unauthorized با CTA ورود
  if (unauthorized && !loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-indigo-800">نیاز به ورود</h3>
              <p className="text-sm text-indigo-600">
                برای تحلیل مسیر یادگیری، لطفاً وارد حساب کاربری خود شوید.
              </p>
            </div>
            <Button
              onClick={() => User.loginWithRedirect(window.location.href)}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600"
            >
              ورود به حساب
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-0">
        <CardContent className="p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          <div className="text-sm text-violet-700">در حال تحلیل مسیر یادگیری تو...</div>
        </CardContent>
      </Card>
    );
  }

  if (error && error.includes('Rate limit')) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-bold text-orange-800">تحلیل مسیر یادگیری</h3>
              <p className="text-sm text-orange-600">
                سیستم مشغول است. تحلیل دقیق‌تر کمی بعد در دسترس خواهد بود.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm" 
            className="mt-3"
            disabled={loading}
          >
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile && !loading) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-bold text-gray-800">مسیر یادگیری</h3>
              <p className="text-sm text-gray-600">
                برای تحلیل مسیر یادگیری، کمی فعالیت در برنامه انجام دهید.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-violet-50 to-pink-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-violet-800">
              <Compass className="w-5 h-5" />
              <h3 className="font-bold">مسیر یادگیری تو</h3>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span className="text-xs text-gray-600">تحلیل خودکار</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {journey.map((j, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/70">
                <div className="text-xs text-gray-500">{j.label}</div>
                <div className="text-xl font-bold text-gray-800">
                  {j.value} <span className="text-sm font-medium text-gray-500">{j.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {profile && (profile.strengths?.length > 0 || profile.preferred_learning_styles?.length > 0) && (
        <Card className="bg-white/70 backdrop-blur border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-fuchsia-800 mb-3">
              <Brain className="w-5 h-5" />
              <h3 className="font-bold">نقاط قوت و سبک‌های یادگیری</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {(profile.strengths || []).map((s, i) => (
                <Badge key={i} className="bg-green-100 text-green-800 rounded-xl">{s}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.preferred_learning_styles || []).map((s, i) => (
                <Badge key={i} variant="outline" className="rounded-xl">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recs.length > 0 && (
        <Card className="bg-white/70 backdrop-blur border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-rose-800 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="font-bold">گام‌های پیشنهادی بعدی</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {recs.map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50">
                  <div className="font-semibold text-gray-800">{r.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{r.description}</div>
                  <div className="text-xs text-gray-500 mt-2">زمان تقریبی: {r.estimated_time} دقیقه</div>
                  <Link to={createPageUrl(r.page)}>
                    <Button size="sm" className="mt-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                      شروع
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}