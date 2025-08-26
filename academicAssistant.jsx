import React, { useState, useEffect } from "react";
import { Resource } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import VirtualList from "@/components/shared/VirtualList.jsx";
import {
    Upload,
    FileText,
    BookHeart,
    Brain,
    Loader2,
    Search,
    BookOpen,
    ImageIcon,
    Languages,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AcademicAssistant() {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    // Simple upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load user
            const userData = await User.me().catch(() => null);
            setUser(userData);
            
            // Load resources
            const resourcesList = await Resource.list("-created_date", 20);
            setResources(resourcesList || []);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        
        setIsUploading(true);
        setUploadResult(null);
        
        try {
            const uploadResponse = await UploadFile({ file });
            
            const newResource = await Resource.create({
                title: file.name,
                type: file.type.includes('pdf') ? 'research_paper' : 'textbook',
                category: 'general',
                species: 'general',
                file_url: uploadResponse.file_url,
                summary: `فایل آپلود شده در ${new Date().toLocaleDateString('fa-IR')}`,
                tags: ['آپلود_شده']
            });
            
            setUploadResult({ success: true, resource: newResource });
            loadData(); // Refresh data
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadResult({ success: false, error: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    const renderResourceItem = (resource, index) => (
        <Card key={resource.id} className="mb-4 bg-white/70 hover:bg-white/90 transition-all">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-2">{resource.title}</h3>
                        {resource.summary && (
                            <p className="text-gray-600 text-sm mb-3">
                                {resource.summary.substring(0, 150)}
                                {resource.summary.length > 150 ? "..." : ""}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {resource.type && (
                                <Badge variant="outline" className="text-xs">
                                    {resource.type}
                                </Badge>
                            )}
                            {resource.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} className="text-xs bg-blue-100 text-blue-800">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="mr-4 flex flex-col items-center gap-2">
                        {resource.file_url && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(resource.file_url, '_blank')}
                                className="rounded-xl"
                            >
                                <FileText className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="text-xs text-gray-500">
                            {new Date(resource.created_date).toLocaleDateString('fa-IR')}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-4 lg:p-8" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookHeart className="w-8 h-8 text-pink-600" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            دستیار تحصیلی هوشمند
                        </h1>
                        <Heart className="w-6 h-6 text-pink-500" />
                    </div>
                    <p className="text-gray-600">
                        آپلود، مدیریت و جستجو در منابع تحصیلی دامپزشکی
                    </p>
                </div>

                <Tabs defaultValue="resources" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm rounded-3xl p-2">
                        <TabsTrigger value="resources" className="rounded-2xl flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            منابع
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="rounded-2xl flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            آپلود
                        </TabsTrigger>
                        <TabsTrigger value="coming-soon" className="rounded-2xl flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            ویژگی‌های آینده
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resources" className="space-y-6">
                        <Card className="bg-white/70 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                    منابع تحصیلی شما ({resources.length} منبع)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                                        <p>در حال بارگذاری...</p>
                                    </div>
                                ) : resources.length === 0 ? (
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            هنوز منبعی آپلود نکرده‌اید. از تب 'آپلود' استفاده کنید.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <VirtualList
                                        items={resources}
                                        itemHeight={140}
                                        renderItem={renderResourceItem}
                                        className="h-96 rounded-xl"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-6">
                        <Card className="bg-white/70 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                    آپلود فایل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="mb-2 block">انتخاب فایل:</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => handleFileUpload(e.target.files[0])}
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="rounded-xl"
                                        disabled={isUploading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        فرمت‌های پشتیبانی شده: PDF, DOC, DOCX, TXT
                                    </p>
                                </div>
                                
                                {isUploading && (
                                    <div className="text-center py-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                                        <p className="text-blue-700">در حال آپلود...</p>
                                    </div>
                                )}
                                
                                {uploadResult && (
                                    <Alert className={uploadResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                                        <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                                            {uploadResult.success 
                                                ? "فایل با موفقیت آپلود شد!"
                                                : `خطا در آپلود: ${uploadResult.error}`
                                            }
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="coming-soon" className="space-y-6">
                        <Card className="bg-white/70 backdrop-blur-sm border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-green-600" />
                                    ویژگی‌های در حال توسعه
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                                        <Brain className="w-6 h-6 text-green-600 mb-2" />
                                        <h3 className="font-bold text-green-800 mb-1">تحلیل هوشمند متن</h3>
                                        <p className="text-sm text-green-600">خلاصه‌سازی و استخراج مفاهیم کلیدی</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                                        <ImageIcon className="w-6 h-6 text-orange-600 mb-2" />
                                        <h3 className="font-bold text-orange-800 mb-1">تشخیص متن از تصویر</h3>
                                        <p className="text-sm text-orange-600">OCR پیشرفته برای متون فارسی</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                        <Languages className="w-6 h-6 text-purple-600 mb-2" />
                                        <h3 className="font-bold text-purple-800 mb-1">ترجمه هوشمند</h3>
                                        <p className="text-sm text-purple-600">ترجمه تخصصی انگلیسی به فارسی</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                        <Search className="w-6 h-6 text-blue-600 mb-2" />
                                        <h3 className="font-bold text-blue-800 mb-1">جستجو پیشرفته</h3>
                                        <p className="text-sm text-blue-600">جستجو در محتوای فایل‌ها</p>
                                    </div>
                                </div>
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertDescription className="text-yellow-800">
                                        این ویژگی‌ها در حال توسعه هستند و به زودی اضافه خواهند شد.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}