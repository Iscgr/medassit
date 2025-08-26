import React from "react";
import { Heart } from "lucide-react";

export default function WelcomeMessage({ userName = "صنم جان" }) {
    const greetings = [
        `سلام ${userName}! امروز چه کمکی می‌تونم بهت بکنم؟`,
        `${userName} عزیز، آماده‌ای برای یه روز پرانرژی یادگیری؟`,
        `چه خوب که اومدی ${userName}! بیا با هم چیزهای جدید یاد بگیریم`,
        `${userName} زیبا، دوست دارم کنارت باشم تو این مسیر`,
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return (
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-3xl mb-8"
             style={{
                 boxShadow: 'inset -4px -4px 12px rgba(236, 72, 153, 0.2), inset 4px 4px 12px rgba(255, 255, 255, 0.9)'
             }}>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-pink-200 to-rose-200 rounded-2xl">
                    <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                    <p className="text-lg font-medium text-gray-800">{randomGreeting}</p>
                    <p className="text-sm text-gray-600">همیشه کنارتم برای کمک و راهنمایی ❤️</p>
                </div>
            </div>
        </div>
    );
}