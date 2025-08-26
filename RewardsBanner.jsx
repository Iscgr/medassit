import React from "react";
import { UserProgress } from "@/api/entities";
import { Achievement } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Target } from "lucide-react";

export default function RewardsBanner({ compact = false }) {
  const [me, setMe] = React.useState(null);
  const [userProgress, setUserProgress] = React.useState(null);
  const [recentAchievements, setRecentAchievements] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const user = await User.me().catch(() => null);
      setMe(user);

      if (user?.email) {
        const progressList = await UserProgress.list().catch(() => []);
        const progress = progressList.find(up => up.created_by === user.email);
        setUserProgress(progress);

        if (progress?.unlocked_achievements?.length > 0) {
          // نمایش ۳ نشان اخیر
          const recent = progress.unlocked_achievements
            .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
            .slice(0, 3);
          
          // بارگذاری جزئیات نشان‌ها
          const achievements = await Achievement.list().catch(() => []);
          const recentWithDetails = recent.map(unlock => {
            const achievement = achievements.find(a => a.id === unlock.achievement_id);
            return { ...unlock, ...achievement };
          }).filter(item => item.name);

          setRecentAchievements(recentWithDetails);
        }
      }
    })();
  }, []);

  if (!userProgress) return null;

  const level = userProgress.current_level || 1;
  const totalPoints = userProgress.total_points || 0;
  const toNext = userProgress.points_to_next_level || (level * 100 - totalPoints);
  const progressPct = Math.min(100, Math.max(0, ((level * 100 - toNext) / (level * 100)) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">سطح {level}</span>
        </div>
        <div className="flex-1">
          <Progress value={progressPct} className="h-2" />
        </div>
        <div className="text-xs text-amber-600">{toNext} امتیاز تا سطح بعد</div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <div className="font-bold text-amber-800">سطح {level}</div>
              <div className="text-xs text-amber-600">{totalPoints} امتیاز کل</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">{toNext} امتیاز تا سطح بعد</span>
          </div>
        </div>

        <Progress value={progressPct} className="mb-4 h-3" />

        {recentAchievements.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              نشان‌های اخیر
            </div>
            <div className="flex flex-wrap gap-2">
              {recentAchievements.map((achievement, i) => (
                <Badge 
                  key={i} 
                  className={`rounded-xl px-3 py-1 ${
                    achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    achievement.rarity === 'epic' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  }`}
                  title={achievement.description}
                >
                  <span className="mr-1">{achievement.icon || '🏆'}</span>
                  {achievement.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* آمار سریع */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200">
          <div className="flex items-center gap-4 text-xs text-amber-700">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {userProgress.study_streak || 0} روز متوالی
            </div>
            <div>
              {(userProgress.unlocked_achievements || []).length} نشان
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}