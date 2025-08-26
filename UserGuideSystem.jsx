import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    BookOpen, 
    Search, 
    Play, 
    CheckCircle2,
    ArrowRight,
    Lightbulb,
    Heart,
    Stethoscope,
    Scissors,
    Phone,
    Database,
    Brain,
    Shield,
    TestTube2,
    HelpCircle,
    MessageCircle,
    Video,
    FileText,
    Zap,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// COMPREHENSIVE USER GUIDE SYSTEM
export default function UserGuideSystem({ initialTopic = null, onClose }) {
    const [activeSection, setActiveSection] = useState(initialTopic || 'getting_started');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState(new Set());

    // Comprehensive guide structure
    const guideStructure = {
        getting_started: {
            title: 'شروع کار با صنم یار',
            icon: Heart,
            color: 'pink',
            description: 'راهنمای کامل شروع استفاده از سیستم',
            sections: [
                {
                    id: 'welcome',
                    title: 'خوش آمدگویی',
                    content: `
                        <h3>سلام و خوش آمدید به صنم یار! 💕</h3>
                        
                        <p>صنم یار یک دستیار هوشمند و تخصصی برای آموزش دامپزشکی است که با استفاده از آخرین تکنولوژی‌های هوش مصنوعی، تجربه یادگیری شما را بهبود می‌بخشد.</p>
                        
                        <h4>قابلیت‌های اصلی:</h4>
                        <ul>
                            <li>📚 مطالعه هوشمند کتاب‌ها و منابع علمی</li>
                            <li>🩺 تحلیل کیس‌های کلینیکی</li>
                            <li>✂️ شبیه‌سازی عمل‌های جراحی</li>
                            <li>🗣️ گفتگوی صوتی و تصویری</li>
                            <li>📊 ردیابی پیشرفت یادگیری</li>
                        </ul>
                    `,
                    duration: '5 دقیقه'
                },
                {
                    id: 'first_steps',
                    title: 'اولین قدم‌ها',
                    content: `
                        <h3>چگونه شروع کنیم؟</h3>
                        
                        <div class="step-by-step">
                            <div class="step">
                                <span class="step-number">1</span>
                                <div>
                                    <h4>آپلود اولین کتاب</h4>
                                    <p>به بخش "دستیار تحصیلی" بروید و اولین کتاب یا جزوه خود را آپلود کنید</p>
                                </div>
                            </div>
                            
                            <div class="step">
                                <span class="step-number">2</span>
                                <div>
                                    <h4>ایجاد پروفایل یادگیری</h4>
                                    <p>سیستم به طور خودکار سبک یادگیری شما را تشخیص می‌دهد</p>
                                </div>
                            </div>
                            
                            <div class="step">
                                <span class="step-number">3</span>
                                <div>
                                    <h4>شروع اولین جلسه مطالعه</h4>
                                    <p>با صنم یار گفتگو کنید و سوالات خود را بپرسید</p>
                                </div>
                            </div>
                        </div>
                    `,
                    duration: '10 دقیقه'
                }
            ]
        },
        
        academic_assistant: {
            title: 'دستیار تحصیلی',
            icon: BookOpen,
            color: 'blue',
            description: 'راهنمای استفاده از قابلیت‌های مطالعه هوشمند',
            sections: [
                {
                    id: 'file_upload',
                    title: 'آپلود فایل‌ها',
                    content: `
                        <h3>آپلود و پردازش منابع علمی</h3>
                        
                        <h4>فرمت‌های پشتیبانی شده:</h4>
                        <ul>
                            <li>📄 PDF - کتاب‌ها و مقالات</li>
                            <li>📝 Word Documents (.docx)</li>
                            <li>🖼️ تصاویر - اسکن شده یا عکس</li>
                            <li>🎥 ویدیو - فایل‌های آموزشی</li>
                        </ul>
                    `,
                    duration: '12 دقیقه'
                }
            ]
        },

        surgery_lab: {
            title: 'آزمایشگاه مجازی جراحی',
            icon: Scissors,
            color: 'orange',
            description: 'راهنمای استفاده از شبیه‌سازی جراحی',
            sections: [
                {
                    id: 'surgery_simulation',
                    title: 'شبیه‌سازی عمل جراحی',
                    content: `
                        <h3>انواع عمل‌های جراحی در دسترس</h3>
                        
                        <div class="surgery-categories">
                            <div class="category">
                                <h4>🦴 جراحی ارتوپدی</h4>
                                <ul>
                                    <li>ترمیم شکستگی‌ها</li>
                                    <li>جراحی مفاصل</li>
                                    <li>پیوند استخوان</li>
                                </ul>
                            </div>
                        </div>
                    `,
                    duration: '20 دقیقه'
                }
            ]
        },

        clinical_cases: {
            title: 'تحلیل کیس‌های کلینیکی',
            icon: Stethoscope,
            color: 'green',
            description: 'راهنمای تحلیل و تشخیص کیس‌های دامپزشکی',
            sections: [
                {
                    id: 'case_analysis',
                    title: 'تحلیل کیس',
                    content: `
                        <h3>فرآیند تحلیل کیس کلینیکی</h3>
                        <p>مراحل تحلیل کیس کلینیکی</p>
                    `,
                    duration: '18 دقیقه'
                }
            ]
        },

        troubleshooting: {
            title: 'رفع مشکلات',
            icon: Shield,
            color: 'red',
            description: 'راهنمای رفع مشکلات رایج سیستم',
            sections: [
                {
                    id: 'common_issues',
                    title: 'مشکلات رایج',
                    content: `
                        <h3>مشکلات رایج و راه‌حل‌ها</h3>
                        <p>راهنمای رفع مشکلات معمول</p>
                    `,
                    duration: '10 دقیقه'
                }
            ]
        }
    };

    // Filter sections based on search
    const filteredSections = searchQuery ? 
        Object.entries(guideStructure).reduce((acc, [key, section]) => {
            const matchingSections = section.sections.filter(s => 
                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matchingSections.length > 0) {
                acc[key] = { ...section, sections: matchingSections };
            }
            return acc;
        }, {}) : guideStructure;

    const toggleExpanded = (itemId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <div className="max-w-6xl mx-auto p-6" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">راهنمای کاربری صنم یار</h1>
                    <p className="text-gray-600">همه چیزی که برای استفاده از سیستم نیاز دارید</p>
                </div>
                {onClose && (
                    <Button variant="outline" onClick={onClose}>
                        بستن راهنما
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="جستجو در راهنما..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>فهرست راهنما</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(filteredSections).map(([key, section]) => {
                                const IconComponent = section.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveSection(key)}
                                        className={`w-full text-right p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                                            activeSection === key 
                                                ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 shadow-md' 
                                                : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        <div className="text-right">
                                            <div className="font-medium">{section.title}</div>
                                            <div className="text-xs text-gray-500">{section.sections.length} بخش</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {filteredSections[activeSection] && (
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="mb-6">
                                    <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full bg-${filteredSections[activeSection].color}-100`}>
                                                <filteredSections[activeSection].icon className={`w-8 h-8 text-${filteredSections[activeSection].color}-600`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl">{filteredSections[activeSection].title}</CardTitle>
                                                <p className="text-gray-600 mt-1">{filteredSections[activeSection].description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                {/* Sections */}
                                <div className="space-y-4">
                                    {filteredSections[activeSection].sections.map((section, index) => (
                                        <Card key={section.id}>
                                            <CardHeader 
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleExpanded(section.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{section.title}</CardTitle>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {section.duration}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${
                                                        expandedItems.has(section.id) ? 'rotate-90' : ''
                                                    }`} />
                                                </div>
                                            </CardHeader>
                                            
                                            <AnimatePresence>
                                                {expandedItems.has(section.id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <CardContent className="pt-0">
                                                            <div 
                                                                className="prose prose-sm max-w-none guide-content"
                                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                                            />
                                                        </CardContent>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .guide-content h3 {
                    color: #1f2937;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                .guide-content h4 {
                    color: #374151;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 1rem 0 0.5rem 0;
                }
                
                .guide-content ul, .guide-content ol {
                    margin: 0.5rem 0;
                    padding-right: 1.5rem;
                }
                
                .guide-content li {
                    margin: 0.25rem 0;
                    line-height: 1.6;
                }
                
                .step-by-step .step {
                    display: flex;
                    gap: 1rem;
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 0.5rem;
                    border-right: 4px solid #ec4899;
                }
                
                .step-number {
                    background: #ec4899;
                    color: white;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .surgery-categories .category {
                    background: #fef7ee;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #fed7aa;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    );
}