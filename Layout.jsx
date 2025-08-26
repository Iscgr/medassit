
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Home, 
    BookHeart,
    HeartPulse,
    Scissors,
    Phone,
    Menu,
    BookOpen,
    Database,
    ShieldCheck,
    TestTube2,
    MessageSquare,
    BarChart3,
    ClipboardList 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import LogoSB from "@/components/shared/LogoSB";
import VoiceChatProvider from "@/components/shared/VoiceChatProvider";
import PerfGuard from "@/components/utils/PerfGuard";

const navigationItems = [
    {
        title: "داشبورد",
        url: createPageUrl("Dashboard"),
        icon: Home,
        description: "نمای کلی پیشرفت"
    },
    {
        title: "گفتگوها",
        url: createPageUrl("Conversations"),
        icon: MessageSquare,
        description: "مدیریت و ادامه مکالمات"
    },
    {
        title: "تحلیل کیفیت",
        url: createPageUrl("QualityAnalytics"),
        icon: BarChart3,
        description: "بازخوردها و امتیازات پاسخ‌ها"
    },
    {
        title: "آزمون‌ها", 
        url: createPageUrl("Quizzes"),
        icon: ClipboardList,
        description: "ایجاد و شرکت در آزمون‌ها"
    },
    {
        title: "نتایج آزمون‌ها",
        url: createPageUrl("QuizResults"),
        icon: BarChart3,
        description: "مشاهده و تحلیل نتایج آزمون‌ها"
    },
    {
        title: "تماس با دستیار",
        url: createPageUrl("ContactAssistant"),
        icon: Phone,
        description: "مشاوره صوتی و تصویری"
    },
    {
        title: "آزمایشگاه مجازی جراحی",
        url: createPageUrl("VirtualSurgeryLab"),
        icon: Scissors,
        description: "تمرین عملیات جراحی"
    },
    {
        title: "سیستم درمان حیوانات",
        url: createPageUrl("AnimalTreatment"),
        icon: HeartPulse,
        description: "مدیریت کیس‌های کلینیکی"
    },
    {
        title: "دستیار تحصیلی",
        url: createPageUrl("academicAssistant"),
        icon: BookHeart,
        description: "کتابخانه و جزوات شما"
    },
    {
        title: "فرهنگ اصطلاحات",
        url: createPageUrl("Glossary"),
        icon: BookOpen,
        description: "اصطلاحات تخصصی دامپزشکی"
    },
    {
        title: "مدیریت منابع",
        url: createPageUrl("DataIntegration"),
        icon: Database,
        description: "ثبت URL، دیتاست و مدیای جراحی"
    },
    { 
        title: "سلامت سیستم",
        url: createPageUrl("Diagnostics"),
        icon: ShieldCheck,
        description: "تست و پایش عملکرد"
    },
    { 
        title: "اعتبارسنجی سیستم",
        url: createPageUrl("SystemTesting"),
        icon: TestTube2, 
        description: "تست‌های جامع و ارزیابی کیفیت"
    }
];

export default function Layout({ children }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [lowPower, setLowPower] = React.useState(false);

    React.useEffect(() => {
        // Verify no horizontal overflow on mount
        const hasHOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        if (hasHOverflow) {
            console.warn("[Layout] Horizontal overflow detected. Check widths/margins.");
        } else {
            console.log("[Layout] No horizontal overflow detected.");
        }
    }, []);

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <LogoSB size={64} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Vazirmatn', 'Segoe UI', sans-serif" }}>
                            صنم یار
                        </h1>
                        <p className="text-sm text-gray-500">دستیار هوشمند دامپزشکی</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-3">
                {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                        <Link
                            key={item.title}
                            to={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                                isActive
                                    ? 'bg-gradient-to-r from-pink-100 to-rose-100 shadow-lg shadow-rose-200/30'
                                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-pink-50'
                            }`}
                            style={isActive ? {
                                boxShadow: 'inset -2px -2px 8px rgba(236, 72, 153, 0.20), inset 2px 2px 8px rgba(255, 255, 255, 0.90), 0 4px 16px rgba(236, 72, 153, 0.12)'
                            } : {}}
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-300 ${
                                isActive 
                                    ? 'bg-gradient-to-br from-pink-200 to-fuchsia-200 shadow-inner' 
                                    : 'bg-gradient-to-br from-gray-100 to-pink-100 group-hover:from-pink-100 group-hover:to-rose-100'
                            }`}
                                 style={{
                                     boxShadow: isActive 
                                         ? 'inset -2px -2px 6px rgba(236, 72, 153, 0.28), inset 2px 2px 6px rgba(255, 255, 255, 0.75)'
                                         : 'inset -1px -1px 3px rgba(236, 72, 153, 0.18), inset 1px 1px 3px rgba(255, 255, 255, 0.85)'
                                 }}>
                                <item.icon className={`w-5 h-5 ${
                                    isActive ? 'text-pink-600' : 'text-gray-600 group-hover:text-pink-500'
                                }`} />
                            </div>
                            <div className="flex-1 text-right">
                                <div className={`font-medium ${
                                    isActive ? 'text-pink-700' : 'text-gray-700 group-hover:text-pink-600'
                                }`}>
                                    {item.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    return (
        <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 ${lowPower ? 'motion-reduce' : ''}`} dir="rtl">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
                    * {
                        font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }

                    html, body {
                        overflow-x: hidden;
                        -webkit-text-size-adjust: 100%;
                        text-size-adjust: 100%;
                    }
                    img, video, canvas, svg {
                        max-width: 100%;
                        height: auto;
                    }
                    a, button {
                        -webkit-tap-highlight-color: transparent;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        * {
                            animation: none !important;
                            transition: none !important;
                            scroll-behavior: auto !important;
                        }
                    }

                    .motion-reduce * {
                        transition: none !important;
                        animation: none !important;
                        box-shadow: none !important;
                    }
                `}
            </style>

            <VoiceChatProvider />

            <PerfGuard
              onDegrade={() => setLowPower(true)}
              onRestore={() => setLowPower(false)}
              checkIntervalMs={1200}
              thresholdMs={350}
              windowSize={6}
              enableAutoOptimization={true}
            />

            <aside className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white/60 backdrop-blur-xl border-l border-rose-100/50 p-8 overflow-y-auto"
                   style={{
                       boxShadow: 'inset 2px 0 16px rgba(236, 72, 153, 0.10), -8px 0 32px rgba(236, 72, 153, 0.06)'
                   }}>
                <NavContent />
            </aside>

            <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-rose-100/50 p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LogoSB size={40} />
                        <h1 className="text-lg font-bold text-gray-800">صنم یار</h1>
                    </div>
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-2xl">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80 bg-white/90 backdrop-blur-xl p-8 h-[100dvh] max-h-[100dvh] overflow-y-auto">
                            <div className="pb-24">
                                <NavContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            <main className="lg:mr-80 min-h-screen">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
