import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, FileText, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadFile } from '@/api/integrations';
import { enhancedPersianOCR } from '@/api/functions';

export default function AdvancedImageProcessor({ onTextExtracted, onError, className = "" }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            onError?.('لطفاً فقط فایل‌های تصویری انتخاب کنید.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            onError?.('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
            return;
        }

        try {
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);

            // Upload file
            setIsProcessing(true);
            setProcessingStep('در حال آپلود تصویر...');
            setProgress(10);

            const uploadResult = await UploadFile({ file });
            setUploadedImage({
                url: uploadResult.file_url,
                name: file.name,
                size: file.size
            });

            setProgress(20);
            setProcessingStep('آپلود کامل شد، آماده برای پردازش OCR');

        } catch (error) {
            console.error('خطا در آپلود:', error);
            setIsProcessing(false);
            onError?.('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
        }
    };

    const processImage = async () => {
        if (!uploadedImage) {
            onError?.('لطفاً ابتدا تصویری انتخاب کنید.');
            return;
        }

        try {
            setIsProcessing(true);
            setProgress(20);
            setProcessingStep('شروع پردازش OCR پیشرفته...');

            // Call advanced OCR function
            const ocrResponse = await enhancedPersianOCR({
                action: 'processImage',
                payload: {
                    imageUrl: uploadedImage.url
                }
            });

            if (ocrResponse.data) {
                setResult(ocrResponse.data);
                setProgress(100);
                setProcessingStep('پردازش کامل شد!');
                
                // Notify parent component
                if (onTextExtracted) {
                    onTextExtracted({
                        originalText: ocrResponse.data.raw_text,
                        correctedText: ocrResponse.data.corrected_text,
                        structuredContent: ocrResponse.data.structured_content,
                        confidence: ocrResponse.data.confidence_score,
                        result: ocrResponse.data
                    });
                }
            } else {
                throw new Error('پاسخ نامعتبر از سرور OCR');
            }

        } catch (error) {
            console.error('خطا در پردازش OCR:', error);
            setProcessingStep('خطا در پردازش OCR');
            onError?.('خطا در پردازش تصویر. لطفاً دوباره تلاش کنید.');
        } finally {
            setTimeout(() => {
                if (!result) setIsProcessing(false);
            }, 2000);
        }
    };

    const resetProcessor = () => {
        setIsProcessing(false);
        setProcessingStep('');
        setProgress(0);
        setResult(null);
        setUploadedImage(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadResult = () => {
        if (!result) return;

        const content = `نتیجه استخراج متن - OCR پیشرفته فارسی
==============================================

متن اصلی:
${result.raw_text}

متن اصلاح شده:
${result.corrected_text}

اطلاعات فنی:
- امتیاز اطمینان: ${result.confidence_score}%
- زمان پردازش: ${result.processing_time_ms} میلی‌ثانیه
- روش‌های OCR: ${result.processing_methods?.join(', ')}
- تعداد اصلاحات: ${result.correction_count}
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-result-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-0 ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-800">
                    <ImageIcon className="w-6 h-6" />
                    پردازشگر تصویر پیشرفته
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {!uploadedImage && !isProcessing && !result && (
                    <div className="space-y-4">
                        <div 
                            className="border-2 border-dashed border-blue-300 rounded-3xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <p className="text-blue-700 font-medium mb-2">
                                کلیک کنید یا تصویر را اینجا بکشید
                            </p>
                            <p className="text-sm text-blue-600">
                                فرمت‌های پشتیبانی شده: JPG, PNG, PDF
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                                حداکثر حجم: ۱۰ مگابایت
                            </p>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertTriangle className="w-4 h-4 text-blue-600" />
                            <AlertDescription className="text-blue-700">
                                <strong>نکات مهم برای بهترین نتیجه:</strong>
                                <ul className="mt-2 text-sm space-y-1">
                                    <li>• تصویر باید وضوح خوبی داشته باشد</li>
                                    <li>• متن به وضوح قابل خواندن باشد</li>
                                    <li>• نورپردازی مناسب و بدون سایه</li>
                                    <li>• صفحه کج نباشد</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {uploadedImage && !result && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800">{uploadedImage.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {(uploadedImage.size / 1024 / 1024).toFixed(2)} مگابایت
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={processImage}
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            در حال پردازش...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            استخراج متن
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={resetProcessor}>
                                    انتخاب مجدد
                                </Button>
                            </div>
                        </div>

                        {previewImage && (
                            <div className="text-center">
                                <img 
                                    src={previewImage} 
                                    alt="پیش‌نمایش" 
                                    className="max-h-64 mx-auto rounded-2xl shadow-lg"
                                />
                            </div>
                        )}
                    </div>
                )}

                {isProcessing && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="font-medium text-blue-800 mb-2">{processingStep}</p>
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-blue-600 mt-2">{progress}% کامل شده</p>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription className="text-blue-700 text-sm">
                                <strong>در حال انجام:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• تحلیل کیفیت تصویر</li>
                                    <li>• بهبود تصویر برای OCR</li>
                                    <li>• استخراج متن با روش‌های متعدد</li>
                                    <li>• اصلاح و بهبود متن فارسی</li>
                                    <li>• تحلیل ساختاری محتوا</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {result && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-bold text-green-800">پردازش موفق!</h3>
                            </div>
                            <div className="flex gap-2">
                                <Badge className={`${
                                    result.confidence_score >= 90 ? 'bg-green-100 text-green-800' :
                                    result.confidence_score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    اطمینان: {result.confidence_score}%
                                </Badge>
                                <Button variant="outline" size="sm" onClick={downloadResult}>
                                    <Download className="w-4 h-4 mr-2" />
                                    دانلود نتیجه
                                </Button>
                                <Button variant="outline" size="sm" onClick={resetProcessor}>
                                    تصویر جدید
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="corrected" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="corrected">متن اصلاح شده</TabsTrigger>
                                <TabsTrigger value="original">متن خام</TabsTrigger>
                                <TabsTrigger value="structured">محتوای ساختاریافته</TabsTrigger>
                            </TabsList>

                            <TabsContent value="corrected" className="space-y-4">
                                <div className="p-4 bg-white rounded-2xl border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800">متن اصلاح شده</span>
                                    </div>
                                    <div className="text-gray-800 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                                        {result.corrected_text}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="original" className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">متن خام OCR</span>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                                        {result.raw_text}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="structured" className="space-y-4">
                                <div className="space-y-3">
                                    {result.structured_content?.title && (
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <h4 className="font-bold text-blue-800">عنوان:</h4>
                                            <p className="text-blue-700">{result.structured_content.title}</p>
                                        </div>
                                    )}

                                    {result.structured_content?.sections?.map((section, index) => (
                                        <div key={index} className="p-3 bg-white rounded-2xl border">
                                            <h5 className="font-medium text-gray-800 mb-2">{section.heading}</h5>
                                            <p className="text-gray-700 text-sm">{section.content}</p>
                                            <Badge variant="outline" className="mt-2">
                                                {section.type}
                                            </Badge>
                                        </div>
                                    ))}

                                    {result.structured_content?.medical_concepts?.length > 0 && (
                                        <div className="p-3 bg-green-50 rounded-2xl">
                                            <h4 className="font-bold text-green-800 mb-2">مفاهیم پزشکی شناسایی شده:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {result.structured_content.medical_concepts.map((concept, i) => (
                                                    <Badge key={i} className="bg-green-100 text-green-700">
                                                        {concept}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-white rounded-2xl">
                                <div className="text-2xl font-bold text-blue-600">
                                    {result.processing_time_ms}ms
                                </div>
                                <div className="text-xs text-gray-600">زمان پردازش</div>
                            </div>
                            <div className="p-3 bg-white rounded-2xl">
                                <div className="text-2xl font-bold text-green-600">
                                    {result.processing_methods?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">روش OCR</div>
                            </div>
                            <div className="p-3 bg-white rounded-2xl">
                                <div className="text-2xl font-bold text-purple-600">
                                    {result.correction_count || 0}
                                </div>
                                <div className="text-xs text-gray-600">تعداد اصلاحات</div>
                            </div>
                            <div className="p-3 bg-white rounded-2xl">
                                <div className="text-2xl font-bold text-orange-600">
                                    {result.veterinary_terms_found?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">اصطلاح تخصصی</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}