import React from "react";
import { Achievement, UserProgress, LearningProgress } from "@/api/entities";
import { User } from "@/api/entities";

export default function AchievementSystem() {
  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const user = await User.me().catch(() => null);
      setMe(user);
    })();
  }, []);

  // سیستم بررسی و اعطای نشان‌ها
  const checkAndAwardAchievements = React.useCallback(async () => {
    if (!me?.email) return;

    try {
      // بارگذاری پیشرفت کاربر
      const progressList = await UserProgress.list();
      const userProgress = progressList.find(up => up.created_by === me.email);
      
      // بارگذاری فعالیت‌های یادگیری
      const learningActivities = await LearningProgress.filter({ created_by: me.email });
      
      // بارگذاری نشان‌های موجود
      const allAchievements = await Achievement.list();
      
      if (!userProgress) return;

      // محاسبه آمار فعلی کاربر
      const stats = {
        studyMinutes: learningActivities.reduce((sum, lp) => sum + (lp.time_spent || 0), 0),
        casesAnalyzed: learningActivities.filter(lp => lp.case_id).length,
        resourcesStudied: learningActivities.filter(lp => lp.resource_id).length,
        currentStreak: userProgress.study_streak || 0,
        totalPoints: userProgress.total_points || 0
      };

      // نشان‌های قابل دریافت
      const eligibleAchievements = allAchievements.filter(achievement => {
        // بررسی اینکه آیا کاربر قبلاً این نشان را دریافت کرده یا نه
        const alreadyUnlocked = (userProgress.unlocked_achievements || [])
          .some(ua => ua.achievement_id === achievement.id);
        
        if (alreadyUnlocked) return false;

        // بررسی معیارهای دریافت نشان
        const criteria = achievement.unlock_criteria;
        switch (criteria.type) {
          case 'study_time':
            return stats.studyMinutes >= criteria.threshold;
          case 'case_count':
            return stats.casesAnalyzed >= criteria.threshold;
          case 'resource_count':
            return stats.resourcesStudied >= criteria.threshold;
          case 'streak':
            return stats.currentStreak >= criteria.threshold;
          case 'accuracy':
            // محاسبه دقت بر اساس quiz scores
            const quizScores = learningActivities
              .filter(lp => lp.quiz_scores && lp.quiz_scores.length > 0)
              .flatMap(lp => lp.quiz_scores);
            if (quizScores.length === 0) return false;
            const avgAccuracy = quizScores.reduce((sum, qs) => 
              sum + (qs.score / qs.max_score * 100), 0) / quizScores.length;
            return avgAccuracy >= criteria.threshold;
          default:
            return false;
        }
      });

      // اعطای نشان‌های جدید
      for (const achievement of eligibleAchievements) {
        const newUnlock = {
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString(),
          points_earned: achievement.points_reward
        };

        // به‌روزرسانی UserProgress
        const updatedUnlocks = [...(userProgress.unlocked_achievements || []), newUnlock];
        const updatedPoints = userProgress.total_points + achievement.points_reward;
        const newLevel = Math.floor(updatedPoints / 100) + 1;

        await UserProgress.update(userProgress.id, {
          unlocked_achievements: updatedUnlocks,
          total_points: updatedPoints,
          current_level: newLevel,
          points_to_next_level: ((newLevel * 100) - updatedPoints)
        });

        // نمایش اطلاع‌رسانی (ساده)
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            alert(`🏆 نشان جدید: ${achievement.name}\n${achievement.description}\n+${achievement.points_reward} امتیاز!`);
          }, 500);
        }
      }

    } catch (error) {
      console.error('خطا در بررسی نشان‌ها:', error);
    }
  }, [me?.email]);

  // بررسی نشان‌ها در بارگذاری و با تأخیر برای جلوگیری از فشار
  React.useEffect(() => {
    if (me?.email) {
      const timer = setTimeout(checkAndAwardAchievements, 2000);
      return () => clearTimeout(timer);
    }
  }, [me?.email, checkAndAwardAchievements]);

  // این کامپوننت invisible است و فقط منطق را اجرا می‌کند
  return null;
}