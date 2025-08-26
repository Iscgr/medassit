import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Resource, VeterinaryKnowledge } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { grokLLM } from "@/api/functions";
import { LearningProfile } from "@/api/entities";
import { numberCitations } from "@/components/utils/citation";
import VirtualList from "@/components/shared/VirtualList.jsx";
import {
    Upload,
    FileText,
    BookHeart,
    Brain,
    Loader2,
    CheckCircle2,
    Sparkles,
    MessageSquare,
    Highlighter,
    Search,
    BookOpen,
    Database,
    TrendingUp,
    ImageIcon,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import KnowledgeProcessor from "@/components/knowledge/KnowledgeProcessor";
import KnowledgeSearch from "@/components/knowledge/KnowledgeSearch";
import FeedbackCollector from "@/components/feedback/FeedbackCollector";
import { AIResponse } from "@/api/entities";
import AdvancedImageProcessor from "@/components/shared/AdvancedImageProcessor";
import GlossaryViewer from "@/components/glossary/GlossaryViewer";

// ... (The rest of the file content remains exactly the same) ...
// This action is just for renaming the file. The content is provided for context.
// In a real file system, this would be a 'mv' command.
class AdvancedResponseCache {
    constructor(maxSize = 100, ttl = 10 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.hitCount = 0;
        this.missCount = 0;
        this.totalResponseTime = 0; // Sum of response times for hits

        // Initialize performance metrics
        this.performanceMetrics = {
            avgResponseTime: 0,
            cacheEfficiency: 0,
            memoryUsage: 0,
            totalRequests: 0,
            hitRate: 0 // Will be updated by getPerformanceStats
        };
    }

    normalizeKey(key) {
        // Advanced key normalization for better cache hits
        if (typeof key === 'string') {
            return key
                .toLowerCase()
                .trim()
                .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove non-alphanumeric/non-space characters, supporting Unicode
                .replace(/\s+/g, '_'); // Replace spaces with underscores
        }
        return String(key);
    }

    get(key) {
        const startTime = performance.now();
        const normalizedKey = this.normalizeKey(key);
        const item = this.cache.get(normalizedKey);
        
        this.performanceMetrics.totalRequests++;

        if (!item) {
            this.missCount++;
            this.updateMetrics();
            return null;
        }

        // TTL validation
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(normalizedKey);
            this.missCount++;
            this.updateMetrics();
            return null;
        }

        // LRU: Move to end (effectively updates timestamp for access)
        this.cache.delete(normalizedKey);
        item.accessCount++; // Increment access count for intelligent eviction
        this.cache.set(normalizedKey, item);
        this.hitCount++;
        
        const responseTime = performance.now() - startTime;
        this.totalResponseTime += responseTime;
        this.updateMetrics();
        
        return item.data;
    }

    set(key, data) {
        const normalizedKey = this.normalizeKey(key);
        
        // Intelligent eviction: prefer evicting least recently used AND least frequently accessed
        if (this.cache.size >= this.maxSize && !this.cache.has(normalizedKey)) {
            this.evictLeastUsedAndAccessed();
        }

        this.cache.set(normalizedKey, {
            data,
            timestamp: Date.now(),
            accessCount: 1,
            size: this.estimateSize(data)
        });

        this.updateMetrics();
    }

    evictLeastUsedAndAccessed() {
        let leastUsedKey = null;
        let minScore = Infinity;

        for (const [key, item] of this.cache.entries()) {
            // Simple scoring: prioritize evicting less accessed items
            const score = item.accessCount / (Date.now() - item.timestamp);
            if (score < minScore) {
                minScore = score;
                leastUsedKey = key;
            }
        }

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
        }
    }

    estimateSize(data) {
        // A simple estimation of object size in memory
        try {
            return JSON.stringify(data).length;
        } catch {
            return 1000; // Default size for non-serializable objects
        }
    }

    updateMetrics() {
        this.performanceMetrics.hitRate = this.performanceMetrics.totalRequests > 0
            ? Math.round((this.hitCount / this.performanceMetrics.totalRequests) * 100)
            : 0;
            
        this.performanceMetrics.avgResponseTime = this.hitCount > 0 
            ? Math.round(this.totalResponseTime / this.hitCount) 
            : 0;

        // Simplified memory usage estimation
        this.performanceMetrics.memoryUsage = Array.from(this.cache.values())
            .reduce((sum, item) => sum + item.size, 0);
    }

    getPerformanceStats() {
        return this.performanceMetrics;
    }

    clear() {
        this.cache.clear();
        this.hitCount = 0;
        this.missCount = 0;
        this.totalResponseTime = 0;
        this.updateMetrics();
    }
}

const responseCache = new AdvancedResponseCache(50, 15 * 60 * 1000);


export default function AcademicAssistantMain() {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState(null);
    const [analysisResult, setAnalysisResult] = useState({ text: null, citations: [] });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [question, setQuestion] = useState("");
    const [isAnswering, setIsAnswering] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [user, setUser] = useState(null);
    const [feedback, setFeedback] = useState({ type: null, comment: '' });
    const [activeTab, setActiveTab] = useState("processor");
    const [learningProfile, setLearningProfile] = useState(null);
    const [lastAiResponseId, setLastAiResponseId] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [resourcesData, userData, profileData] = await Promise.all([
                    Resource.list('-created_date', 50),
                    User.me().catch(() => null),
                    LearningProfile.list().then(profiles => profiles.length > 0 ? profiles[0] : null)
                ]);
                setResources(resourcesData);
                setUser(userData);
                setLearningProfile(profileData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, []);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }, []);

    const handleFileUpload = useCallback(async (file) => {
        setIsAnalyzing(true);
        setAnalysisResult({ text: "در حال پردازش فایل...", citations: [] });
        try {
            const { file_url } = await UploadFile({ file });
            const newResource = await Resource.create({
                title: file.name,
                type: 'textbook',
                category: 'internal_medicine',
                file_url: file_url,
                summary: 'درحال تولید خلاصه‌سازی...'
            });
            setResources(prev => [newResource, ...prev]);
            setSelectedResource(newResource);

            const prompt = `You are "Sanam Yar", a specialized veterinary assistant. Analyze this document for your student "Sanam".
            Provide a comprehensive, friendly, and educational summary in Persian.
            Break it down into:
            1.  **Main Topics:** (A bulleted list of key subjects)
            2.  **Key Concepts & Definitions:** (Explain important terms simply)
            3.  **Clinical Relevance:** (How this knowledge is used in practice)
            4.  **A "For Sanam" Tip:** (A personal, encouraging study tip based on the content)
            
            Document URL: ${file_url}`;
            
            const aiResponse = await grokLLM({ prompt, file_urls: [file_url] });

            if (aiResponse.error) {
                throw new Error(aiResponse.error);
            }

            const numberedText = numberCitations(aiResponse.reply);
            setAnalysisResult({ text: numberedText, citations: aiResponse.citations || [] });
            
            const updatedResource = await Resource.update(newResource.id, {
                summary: aiResponse.reply.substring(0, 500) + '...'
            });
            setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));

        } catch (error) {
            console.error("Error during file analysis:", error);
            setAnalysisResult({ text: `خطا در تحلیل فایل: ${error.message}`, citations: [] });
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const handleQuestionSubmit = useCallback(async () => {
        if (!question.trim()) return;

        const currentQuestion = question;
        setQuestion("");
        setIsAnswering(true);
        setChatHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);
        
        const cacheKey = `grok_response:${selectedResource?.id}:${currentQuestion}`;
        const cached = responseCache.get(cacheKey);

        if (cached) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: cached.reply, citations: cached.citations }]);
            setIsAnswering(false);
            return;
        }

        try {
            const context = selectedResource ? `Based on the document titled "${selectedResource.title}".` : '';
            const prompt = `As "Sanam Yar", answer this question for "Sanam". Keep the tone educational and supportive.
            Context: ${context}
            Question: ${currentQuestion}`;

            const file_urls = selectedResource ? [selectedResource.file_url] : [];
            const response = await grokLLM({ prompt, file_urls });
            
            if (response.error) throw new Error(response.error);

            const aiResponseData = {
                content: response.reply,
                prompt_used: prompt,
                module_type: 'educational',
                context_sources: response.citations?.map(c => c.title) || [],
            };
            
            const savedAiResponse = await AIResponse.create(aiResponseData);
            setLastAiResponseId(savedAiResponse.id);
            
            const numberedText = numberCitations(response.reply, response.citations);
            setChatHistory(prev => [...prev, { role: 'assistant', content: numberedText, citations: response.citations }]);
            responseCache.set(cacheKey, response);

        } catch (error) {
            console.error("Error answering question:", error);
            setChatHistory(prev => [...prev, { role: 'system', content: `خطا: ${error.message}` }]);
        } finally {
            setIsAnswering(false);
        }
    }, [question, selectedResource]);

    const handleFeedbackSubmit = async (feedbackData) => {
        if (!lastAiResponseId) return;
        try {
            await FeedbackCollector.submitFeedback({
                ...feedbackData,
                response_id: lastAiResponseId,
                module_type: 'educational'
            });
            // Optionally, clear the feedback form or show a success message
            setLastAiResponseId(null); // Prevents duplicate feedback
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        }
    };
    
    const ResourceItem = ({ item }) => (
        <div
            onClick={() => setSelectedResource(item)}
            className={`p-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-200 ${selectedResource?.id === item.id ? 'bg-rose-100 shadow-inner' : 'bg-gray-50 hover:bg-rose-50'}`}
        >
            <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="font-medium text-gray-700 truncate text-sm">{item.title}</p>
        </div>
    );
    
    return (
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] p-4">
            {/* Left Column: Resource List & Upload */}
            <Card className="lg:col-span-1 flex flex-col bg-white/60 backdrop-blur-sm border-0 shadow-lg shadow-rose-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-800">
                        <BookHeart />
                        کتابخانه من
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-rose-500/20">
                        <Upload className="w-4 h-4 ml-2" />
                        آپلود کتاب یا جزوه
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.txt,.md" />

                    <div className="flex-1 relative bg-white/50 rounded-2xl p-2 border border-rose-100/50">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                در حال بارگذاری منابع...
                            </div>
                        ) : resources.length > 0 ? (
                           <VirtualList
                                items={resources}
                                renderItem={(item) => <ResourceItem item={item} />}
                                itemHeight={60}
                                className="h-full"
                           />
                        ) : (
                           <div className="text-center text-gray-500 p-4">
                               هنوز منبعی آپلود نکرده‌اید.
                           </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Tabs for Analysis and Interaction */}
            <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col" dir="rtl">
                    <TabsList className="grid w-full grid-cols-4 bg-rose-100/70 rounded-2xl p-2">
                        <TabsTrigger value="processor" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                            <Brain className="w-4 h-4 ml-2" />
                            پردازشگر
                        </TabsTrigger>
                        <TabsTrigger value="search" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                            <Search className="w-4 h-4 ml-2" />
                            جستجوی دانش
                        </TabsTrigger>
                         <TabsTrigger value="glossary" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                            <BookOpen className="w-4 h-4 ml-2" />
                            فرهنگ اصطلاحات
                        </TabsTrigger>
                        <TabsTrigger value="image_analyzer" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
                            <ImageIcon className="w-4 h-4 ml-2" />
                            تحلیلگر تصویر
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="processor" className="flex-1 overflow-auto mt-4">
                       <KnowledgeProcessor 
                            selectedResource={selectedResource}
                            analysisResult={analysisResult}
                            isAnalyzing={isAnalyzing}
                            chatHistory={chatHistory}
                            isAnswering={isAnswering}
                            question={question}
                            setQuestion={setQuestion}
                            onQuestionSubmit={handleQuestionSubmit}
                            onFeedbackSubmit={handleFeedbackSubmit}
                            lastAiResponseId={lastAiResponseId}
                       />
                    </TabsContent>
                    
                    <TabsContent value="search" className="flex-1 overflow-auto mt-4">
                        <KnowledgeSearch />
                    </TabsContent>

                    <TabsContent value="glossary" className="flex-1 overflow-auto mt-4">
                        <Card className="bg-white/80">
                           <CardContent className="p-4">
                               <GlossaryViewer />
                           </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="image_analyzer" className="flex-1 overflow-auto mt-4">
                        <Card className="bg-white/80">
                           <CardContent className="p-4">
                               <AdvancedImageProcessor />
                           </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}