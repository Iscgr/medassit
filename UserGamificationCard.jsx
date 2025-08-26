import React from "react";
import { User } from "@/api/entities";
import { UserProgress } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award } from "lucide-react";

export default function UserGamificationCard() {
  const [me, setMe] = React.useState(null);
  const [up, setUp] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const user = await User.me().catch(() => null);
      setMe(user);
      const list = await UserProgress.list().catch(() => []);
      const mine = (list || []).find(u => u.created_by === user?.email) || null;
      setUp(mine);
    })();
  }, []);

  const total = up?.total_points || 0;
  const level = up?.current_level || 1;
  const toNext = up?.points_to_next_level ?? Math.max(0, 100 - (total % 100));
  const pct = Math.min(100, Math.round((100 - toNext) || (total % 100)));

  const unlockedCount = Array.isArray(up?.unlocked_achievements) ? up.unlocked_achievements.length : 0;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Trophy className="w-5 h-5" />
          وضعیت پیشرفت گیمیفیکیشن
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-amber-800">
          <div>سطح فعلی: <span className="font-bold">{level}</span></div>
          <div>امتیاز کل: <span className="font-bold">{total}</span></div>
        </div>
        <Progress value={pct} />
        <div className="flex items-center justify-between text-xs text-amber-700">
          <div>تا سطح بعد: {toNext} امتیاز</div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            نشان‌ها: {unlockedCount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}