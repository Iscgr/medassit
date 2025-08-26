
import React, { useState } from "react";
import { VeterinaryKnowledge } from "@/api/entities";
import { grokLLM } from "@/api/functions";
import { Brain, BookOpen, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function KnowledgeProcessor({ onKnowledgeAdded }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [progress, setProgress] = useState(0);
    const [sourceInput, setSourceInput] = useState('');
    const [processedKnowledge, setProcessedKnowledge] = useState(null);

    const processEnglishSource = async (englishContent, sourceInfo = {}) => {
        setIsProcessing(true);
        setProgress(0);
        
        try {
            // مرحله 1: استخراج مفاهیم کلیدی با Grok
            setProcessingStep('استخراج مفاهیم کلیدی...');
            setProgress(20);
            
            const conceptsResponse = await grokLLM({
                prompt: `به عنوان متخصص دامپزشکی، این متن انگلیسی دامپزشکی را تحلیل کن:

${englishContent}

مفاهیم مهم دامپزشکی، تعاریف و اهمیت بالینی آنها را استخراج کن. روی اطلاعات عملی و بالینی تمرکز کن.

لطفاً خروجی را در قالب JSON با ساختار زیر ارائه ده:
{
  "key_concepts": [
    {
      "concept": "نام مفهوم",
      "definition_english": "تعریف انگلیسی", 
      "clinical_significance": "اهمیت بالینی"
    }
  ],
  "category": "یکی از: internal_medicine, surgery, pathology, pharmacology, anatomy, physiology, parasitology, microbiology, nutrition, reproduction, anesthesia, diagnostic_imaging, emergency_care, exotic_animals",
  "species": ["گونه‌های مربوطه"],
  "difficulty_level": "یکی از: beginner, intermediate, advanced"
}`
            });

            const conceptsData = JSON.parse(conceptsResponse.data?.reply || conceptsResponse.reply || '{}');
            setProgress(50);

            // مرحله 2: تبدیل به فارسی محاوره‌ای با Grok
            setProcessingStep('تبدیل به زبان فارسی محاوره‌ای...');
            
            const persianResponse = await grokLLM({
                prompt: `تو دستیار دامپزشکی "صنم یار" هستی که با کاربر صمیمی‌ات صنم جان صحبت می‌کنی. 

این متن انگلیسی دامپزشکی رو به زبان فارسی محاوره‌ای، دوستانه و قابل فهم تبدیل کن:

${englishContent}

مهم:
- لحن باید دوستانه و صمیمی باشه (مثل اینکه با دوست صمیمی صحبت می‌کنی)
- اصطلاحات پیچیده رو ساده توضیح بده
- از عبارات محاوره‌ای استفاده کن
- مثال‌های عملی بزن
- به جای ترجمه خشک، مفهوم رو به زبان ساده بگو

مثال لحن: "صنم جان، ببین این موضوع خیلی جالبه..." یا "تو باید بدونی که..."

لطفاً پاسخ را در قالب JSON ارائه ده:
{
  "simplified_content": "محتوای ساده‌شده",
  "clinical_applications": [
    {
      "scenario": "سناریو",
      "application": "کاربرد",
      "practical_tips": "نکات عملی"
    }
  ]
}`
            });

            const persianData = JSON.parse(persianResponse.data?.reply || persianResponse.reply || '{}');
            setProgress(80);

            // مرحله 3: ترجمه مفاهیم کلیدی با Grok
            setProcessingStep('ترجمه مفاهیم کلیدی...');
            
            const translatedConcepts = await Promise.all(
                (conceptsData.key_concepts || []).map(async (concept) => {
                    const translatedResponse = await grokLLM({
                        prompt: `این مفهوم دامپزشکی انگلیسی رو به فارسی ساده و قابل فهم ترجمه کن:
                        
مفهوم: ${concept.concept}
تعریف: ${concept.definition_english}

ترجمه باید دقیق ولی ساده باشه تا صنم جان راحت بفهمه.`
                    });
                    
                    return {
                        ...concept,
                        definition_persian: translatedResponse.data?.reply || translatedResponse.reply || ''
                    };
                })
            );

            setProgress(100);

            // مرحله 4: ایجاد شیء دانش
            const knowledgeData = {
                title: sourceInfo.title || 'دانش دامپزشکی جدید',
                original_source: sourceInfo,
                category: conceptsData.category || 'internal_medicine',
                species: conceptsData.species || ['all'],
                original_content: englishContent,
                key_concepts: translatedConcepts,
                simplified_content: persianData.simplified_content || '',
                clinical_applications: persianData.clinical_applications || [],
                tags: extractTags(englishContent),
                difficulty_level: conceptsData.difficulty_level || 'intermediate',
                last_updated: new Date().toISOString(),
                verification_status: 'pending'
            };

            // ذخیره در پایگاه داده
            const savedKnowledge = await VeterinaryKnowledge.create(knowledgeData);
            setProcessedKnowledge(savedKnowledge);
            
            if (onKnowledgeAdded) {
                onKnowledgeAdded(savedKnowledge);
            }

            setProcessingStep('تکمیل شد! دانش جدید به کتابخانه اضافه شد 🎉');

        } catch (error) {
            console.error('خطا در پردازش دانش:', error);
            setProcessingStep('خطا در پردازش. دوباره تلاش کنید.');
        } finally {
            setIsProcessing(false);
        }
    };

    const extractTags = (content) => {
        // استخراج ساده تگ - می‌توان با NLP بهبود داد
        const commonTerms = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const uniqueTerms = [...new Set(commonTerms)];
        return uniqueTerms.slice(0, 15); // 15 تگ برتر
    };

    const handleSourceSubmit = () => {
        if (!sourceInput.trim()) return;
        
        processEnglishSource(sourceInput, {
            title: 'منبع کاربر',
            language: 'english',
            source_type: 'manual_input'
        });
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0"
                  style={{
                      boxShadow: 'inset -3px -3px 10px rgba(59, 130, 246, 0.15), inset 3px 3px 10px rgba(255, 255, 255, 0.9)'
                  }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-800">
                        <Brain className="w-6 h-6" />
                        پردازشگر دانش دامپزشکی
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-blue-700 text-sm">
                        صنم جان، متن انگلیسی دامپزشکی رو اینجا بذار تا برات به زبان ساده تبدیلش کنم! 📚
                    </p>
                    
                    <Textarea
                        placeholder="متن انگلیسی از کتاب، مقاله یا منبع دامپزشکی رو اینجا کپی کن..."
                        value={sourceInput}
                        onChange={(e) => setSourceInput(e.target.value)}
                        rows={6}
                        className="rounded-2xl border-blue-200"
                    />
                    
                    <Button 
                        onClick={handleSourceSubmit}
                        disabled={isProcessing || !sourceInput.trim()}
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                در حال پردازش...
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-4 h-4 mr-2" />
                                تبدیل به زبان ساده
                            </>
                        )}
                    </Button>

                    {isProcessing && (
                        <div className="space-y-3">
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-blue-600 text-center">{processingStep}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {processedKnowledge && (
                <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-0"
                      style={{
                          boxShadow: 'inset -3px -3px 10px rgba(34, 197, 94, 0.15), inset 3px 3px 10px rgba(255, 255, 255, 0.9)'
                      }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-green-800">
                            <CheckCircle2 className="w-6 h-6" />
                            دانش پردازش شده
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-green-800 mb-2">محتوای ساده‌شده:</h3>
                            <div className="p-4 bg-white/50 rounded-2xl">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {processedKnowledge.simplified_content}
                                </p>
                            </div>
                        </div>

                        {processedKnowledge.key_concepts?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-green-800 mb-2">مفاهیم کلیدی:</h3>
                                <div className="space-y-2">
                                    {processedKnowledge.key_concepts.map((concept, index) => (
                                        <div key={index} className="p-3 bg-white/50 rounded-2xl">
                                            <h4 className="font-medium text-gray-800">{concept.concept}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{concept.definition_persian}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-800">
                                {processedKnowledge.category?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                                {processedKnowledge.difficulty_level}
                            </Badge>
                            {processedKnowledge.species?.map((species, index) => (
                                <Badge key={index} variant="outline">
                                    {species}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
