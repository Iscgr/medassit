
import React, { useState, useEffect } from "react";
import { Resource, LearningProgress } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { 
    Upload, 
    FileText, 
    Play, 
    Pause, 
    Mic, 
    Volume2,
    BookOpen,
    Loader2,
    CheckCircle2,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VoiceLearning() {
    const [resources, setResources] = useState([]);
    const [currentResource, setCurrentResource] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newResource, setNewResource] = useState({
        title: '',
        type: 'textbook',
        category: 'internal_medicine',
        species: 'small_animals',
        difficulty_level: 'intermediate'
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const data = await Resource.list('-created_date');
            setResources(data);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!newResource.title.trim()) {
            setError('لطفاً عنوان منبع را وارد کنید');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const { file_url } = await UploadFile({ file });
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Process the file with AI
            setIsProcessing(true);
            const summary = await InvokeLLM({
                prompt: `این یک متن دامپزشکی است. لطفاً خلاصه‌ای جامع و مفصل از این متن به زبان فارسی ارائه دهید. خلاصه باید شامل نکات کلیدی، مفاهیم مهم، و اطلاعات عملی باشد. خلاصه را به صورت ساختار یافته و قابل فهم بنویسید.`,
                file_urls: [file_url]
            });

            const resourceData = {
                ...newResource,
                file_url,
                summary,
                tags: generateTags(newResource.title, newResource.category)
            };

            const createdResource = await Resource.create(resourceData);
            
            setResources(prev => [createdResource, ...prev]);
            setNewResource({
                title: '',
                type: 'textbook',
                category: 'internal_medicine',
                species: 'small_animals',
                difficulty_level: 'intermediate'
            });

        } catch (error) {
            setError('خطا در آپلود فایل: ' + error.message);
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
            setIsProcessing(false);
            setUploadProgress(0);
        }
    };

    const generateTags = (title, category) => {
        const commonTags = {
            'internal_medicine': ['داخلی', 'تشخیص', 'درمان'],
            'surgery': ['جراحی', 'عملیات', 'مهارت عملی'],
            'pathology': ['پاتولوژی', 'بیماری‌شناسی', 'آزمایشگاه'],
            'pharmacology': ['داروشناسی', 'دارو', 'درمان دارویی']
        };
        return [...(commonTags[category] || []), ...title.split(' ').slice(0, 3)];
    };

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) {
            setError('مرورگر شما از تبدیل متن به گفتار پشتیبانی نمی‌کند');
            return;
        }

        if (isPlaying) {
            speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.8;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
            setIsPlaying(false);
            setError('خطا در پخش صوتی');
        };

        speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">یادگیری صوتی</h1>
                <p className="text-gray-600">منابع درسی خود را آپلود کنید و با هوش مصنوعی تعامل کنید</p>
            </div>

            {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200"
                                 style={{
                                     boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                 }}>
                                <Upload className="w-5 h-5 text-purple-600" />
                            </div>
                            آپلود منبع جدید
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">عنوان منبع</Label>
                                <Input
                                    id="title"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="عنوان کتاب یا منبع را وارد کنید"
                                    className="rounded-2xl border-purple-200 focus:border-purple-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>نوع منبع</Label>
                                    <Select value={newResource.type} onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="textbook">کتاب درسی</SelectItem>
                                            <SelectItem value="research_paper">مقاله پژوهشی</SelectItem>
                                            <SelectItem value="guideline">راهنما</SelectItem>
                                            <SelectItem value="case_study">مطالعه موردی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>دسته‌بندی</Label>
                                    <Select value={newResource.category} onValueChange={(value) => setNewResource(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="internal_medicine">طب داخلی</SelectItem>
                                            <SelectItem value="surgery">جراحی</SelectItem>
                                            <SelectItem value="pathology">پاتولوژی</SelectItem>
                                            <SelectItem value="pharmacology">داروشناسی</SelectItem>
                                            <SelectItem value="anatomy">آناتومی</SelectItem>
                                            <SelectItem value="physiology">فیزیولوژی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>گونه هدف</Label>
                                    <Select value={newResource.species} onValueChange={(value) => setNewResource(prev => ({ ...prev, species: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small_animals">حیوانات کوچک</SelectItem>
                                            <SelectItem value="large_animals">حیوانات بزرگ</SelectItem>
                                            <SelectItem value="exotic">اگزوتیک</SelectItem>
                                            <SelectItem value="poultry">طیور</SelectItem>
                                            <SelectItem value="general">عمومی</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>سطح سختی</Label>
                                    <Select value={newResource.difficulty_level} onValueChange={(value) => setNewResource(prev => ({ ...prev, difficulty_level: value }))}>
                                        <SelectTrigger className="rounded-2xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">مبتدی</SelectItem>
                                            <SelectItem value="intermediate">متوسط</SelectItem>
                                            <SelectItem value="advanced">پیشرفته</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-4">
                            <Label>انتخاب فایل</Label>
                            <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
                                isUploading ? 'border-blue-400 bg-blue-50' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                            }`}>
                                {isUploading ? (
                                    <div className="space-y-4">
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                                                <p className="text-blue-600">در حال پردازش با هوش مصنوعی...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <Progress value={uploadProgress} className="mb-2" />
                                                    <p className="text-blue-600">در حال آپلود... {uploadProgress}%</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                             style={{
                                                 boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                             }}>
                                            <FileText className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            فایل PDF یا تصویر خود را انتخاب کنید
                                        </p>
                                        <input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                            disabled={isUploading}
                                        />
                                        <Label htmlFor="file-upload">
                                            <Button asChild className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                                <span>انتخاب فایل</span>
                                            </Button>
                                        </Label>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resources List */}
                <Card className="bg-white/60 backdrop-blur-sm border-0"
                      style={{
                          boxShadow: 'inset -4px -4px 16px rgba(139, 92, 246, 0.1), inset 4px 4px 16px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.08)'
                      }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-gradient-to-br from-green-200 to-teal-200"
                                 style={{
                                     boxShadow: 'inset -2px -2px 6px rgba(34, 197, 94, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                 }}>
                                <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            منابع آپلود شده
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {resources.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">هنوز منبعی آپلود نکرده‌اید</p>
                                </div>
                            ) : (
                                resources.map((resource) => (
                                    <div key={resource.id} 
                                         className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-purple-50 hover:from-blue-50 hover:to-purple-100 transition-all duration-300 cursor-pointer"
                                         style={{
                                             boxShadow: 'inset -2px -2px 8px rgba(139, 92, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)'
                                         }}
                                         onClick={() => setCurrentResource(resource)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-200 to-purple-200"
                                                     style={{
                                                         boxShadow: 'inset -2px -2px 6px rgba(139, 92, 246, 0.3), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                                                     }}>
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">{resource.title}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {resource.category?.replace(/_/g, ' ')} • {resource.species?.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="rounded-2xl hover:bg-white/50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        speakText(resource.summary || 'خلاصه‌ای در دسترس نیست');
                                                    }}
                                                >
                                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                </Button>
                                                <Button size="icon" variant="ghost" className="rounded-2xl hover:bg-white/50">
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {resource.summary && (
                                            <div className="mt-3 p-3 rounded-2xl bg-white/50">
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {resource.summary.substring(0, 150)}...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Resource Detail Modal */}
            {currentResource && (
                <Card className="bg-white/90 backdrop-blur-lg border-0 mt-8"
                      style={{
                          boxShadow: 'inset -6px -6px 20px rgba(139, 92, 246, 0.15), inset 6px 6px 20px rgba(255, 255, 255, 0.9), 0 12px 40px rgba(139, 92, 246, 0.2)'
                      }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{currentResource.title}</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-2xl"
                            onClick={() => setCurrentResource(null)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex gap-2 flex-wrap">
                                {currentResource.tags?.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                                <Button 
                                    className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                    onClick={() => speakText(currentResource.summary || 'خلاصه‌ای در دسترس نیست')}
                                >
                                    <Volume2 className="w-4 h-4 mr-2" />
                                    پخش صوتی
                                </Button>
                                <Button variant="outline" className="rounded-2xl">
                                    <Mic className="w-4 h-4 mr-2" />
                                    پرسش صوتی
                                </Button>
                            </div>

                            {currentResource.summary && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50"
                                     style={{
                                         boxShadow: 'inset -2px -2px 8px rgba(139, 92, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)'
                                     }}>
                                    <h3 className="font-medium mb-2">خلاصه منبع:</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {currentResource.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
