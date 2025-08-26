import React from "react";
import { TrendingUp, Target, Clock, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressTracker({ studyMinutes = 0, casesCompleted = 0, weeklyGoal = 300 }) {
    const weeklyProgress = Math.min((studyMinutes / weeklyGoal) * 100, 100);
    
    const motivationalMessages = [
        "عالی داری پیش میری صنم جان! 🌟",
        "ادامه بده، داری فوق‌العاده عمل می‌کنی! 💪",
        "واقعاً افتخار می‌کنم بهت! 🎯",
        "این روند عالی رو ادامه بده عزیزم! ✨"
    ];
    
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 mb-6"
              style={{
                  boxShadow: 'inset -3px -3px 10px rgba(168, 85, 247, 0.15), inset 3px 3px 10px rgba(255, 255, 255, 0.9)'
              }}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">پیشرفت هفتگی تو</h3>
                    <div className="flex items-center gap-2 text-purple-600">
                        <Award className="w-5 h-5" />
                        <span className="font-medium">{Math.round(weeklyProgress)}%</span>
                    </div>
                </div>
                
                <Progress value={weeklyProgress} className="mb-4" />
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-2xl mx-auto mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{studyMinutes}</p>
                        <p className="text-xs text-gray-600">دقیقه مطالعه</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-2xl mx-auto mb-2">
                            <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{casesCompleted}</p>
                        <p className="text-xs text-gray-600">کیس حل شده</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-2xl mx-auto mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{weeklyGoal}</p>
                        <p className="text-xs text-gray-600">هدف هفتگی</p>
                    </div>
                </div>
                
                {weeklyProgress > 50 && (
                    <div className="text-center p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl">
                        <p className="text-sm font-medium text-gray-700">
                            {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}