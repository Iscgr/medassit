import React, { useState } from "react";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/api/integrations";
import { Upload, FileText, Image, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function FileProcessor({ onProcessComplete, onError }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState('');
    const [progress, setProgress] = useState(0);
    const [processingDetails, setProcessingDetails] = useState('');

    const processFile = async (file) => {
        setIsProcessing(true);
        setProgress(0);
        
        try {
            // Step 1: Upload
            setCurrentStep('آپلود فایل');
            setProcessingDetails('صنم جان، دارم فایلت رو آپلود می‌کنم...');
            
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + 8, 95));
            }, 200);
            
            const { file_url } = await UploadFile({ file });
            clearInterval(progressInterval);
            setProgress(100);
            
            // Step 2: Text Extraction
            setCurrentStep('استخراج متن');
            setProcessingDetails('حالا دارم متن رو از فایلت استخراج می‌کنم...');
            setProgress(0);
            
            let extractedContent = '';
            
            if (file.type === 'application/pdf') {
                // Enhanced PDF processing
                const extractResult = await ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: {
                        type: "object",
                        properties: {
                            content: { type: "string" },
                            pages: { type: "number" },
                            language: { type: "string" }
                        }
                    }
                });
                extractedContent = extractResult.output?.content || '';
            } else if (file.type.startsWith('image/')) {
                // Enhanced OCR for handwritten text
                setProcessingDetails('این تصویر داره... دارم دست‌نوشته‌هات رو می‌خونم (ممکنه کمی وقت ببره)');
                
                const ocrResult = await InvokeLLM({
                    prompt: `این تصویر حاوی متن فارسی دست‌نویس یا تایپ شده است. لطفاً تمام متن موجود در تصویر را با دقت بالا استخراج کن. اگر متن دست‌نویس است، سعی کن با توجه به زمینه دامپزشکی، کلمات مبهم را تشخیص دهی. فقط متن استخراج شده را برگردان، بدون توضیح اضافی.`,
                    file_urls: [file_url]
                });
                extractedContent = ocrResult || '';
            }
            
            setProgress(50);
            
            // Step 3: AI Analysis and Summary
            setCurrentStep('تحلیل هوشمند');
            setProcessingDetails('الان دارم کل محتوا رو تحلیل می‌کنم و برات خلاصه درست می‌کنم...');
            
            const summary = await InvokeLLM({
                prompt: `سلام! من صنم یار هستم، دستیار دامپزشکی تو. این محتوا رو مطالعه کردم:

${extractedContent}

حالا می‌خوام برات یه خلاصه عالی و کاربردی تهیه کنم. لطفاً:

1. نکات کلیدی رو به صورت ساده و قابل فهم بنویس
2. مفاهیم مهم رو برجسته کن
3. اگر نکات عملی و کاربردی هست، حتماً اونا رو ذکر کن
4. اگر جاهایی مبهم یا ناخوانا بوده، بگو که کجاها نیاز به وضوح بیشتر داره

خلاصه رو به صورت دوستانه و انگیزه‌بخش بنویس، انگار داری با یه دوست صمیمی حرف می‌زنی.`
            });
            
            setProgress(100);
            setCurrentStep('تکمیل شد');
            setProcessingDetails('تمام! حالا می‌تونی از کتابت سوال بپرسی 🎉');
            
            // Return processed data
            const processedData = {
                originalFile: file,
                file_url,
                extractedContent,
                summary,
                processingInfo: {
                    fileType: file.type,
                    fileSize: file.size,
                    processedAt: new Date().toISOString()
                }
            };
            
            if (onProcessComplete) {
                onProcessComplete(processedData);
            }
            
        } catch (error) {
            console.error('File processing error:', error);
            setCurrentStep('خطا');
            setProcessingDetails('متأسفم، یه مشکلی پیش اومد. دوباره امتحان کن؟');
            if (onError) {
                onError(error);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {isProcessing && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="animate-spin">
                            <Loader2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-800">{currentStep}</h3>
                            <p className="text-sm text-blue-600">{processingDetails}</p>
                        </div>
                    </div>
                    <Progress value={progress} className="mb-2" />
                    <p className="text-xs text-blue-500 text-center">{progress}% تکمیل شده</p>
                </div>
            )}
        </div>
    );
}