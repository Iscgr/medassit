import React, { useState, useEffect } from "react";
import { Bell, X, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SmartNotifications() {
    const [notifications, setNotifications] = useState([]);
    
    const smartTips = [
        {
            id: 1,
            type: "tip",
            icon: Lightbulb,
            title: "نکته روز",
            message: "صنم جان، یادت باشه که تمرین منظم کلید یادگیری مؤثره! حتی 15 دقیقه روزانه می‌تونه تفاوت بزرگی بسازه 💡",
            color: "yellow"
        }
    ];
    
    useEffect(() => {
        // Show a random notification every few seconds
        const interval = setInterval(() => {
            if (notifications.length < 1) {
                const randomTip = smartTips[Math.floor(Math.random() * smartTips.length)];
                setNotifications(prev => [...prev, { ...randomTip, timestamp: Date.now() }]);
            }
        }, 15000);
        
        return () => clearInterval(interval);
    }, [notifications.length]);
    
    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id || n.timestamp !== id));
    };
    
    if (notifications.length === 0) return null;
    
    return (
        <div className="fixed top-4 left-4 z-50 space-y-3 max-w-sm">
            {notifications.map((notif, index) => (
                <Card key={`${notif.id}-${notif.timestamp}`} 
                      className={`bg-gradient-to-r from-${notif.color}-50 to-${notif.color}-100 border-0 animate-slide-in`}
                      style={{
                          boxShadow: 'inset -2px -2px 8px rgba(0,0,0,0.1), inset 2px 2px 8px rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.1)'
                      }}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-2xl bg-${notif.color}-200`}>
                                <notif.icon className={`w-4 h-4 text-${notif.color}-600`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800 mb-1">{notif.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full w-6 h-6"
                                onClick={() => dismissNotification(`${notif.id}-${notif.timestamp}`)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}