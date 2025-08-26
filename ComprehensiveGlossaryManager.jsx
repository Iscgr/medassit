import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    BookOpen, 
    Search, 
    Filter, 
    Star, 
    Volume2, 
    Eye,
    Brain,
    Languages,
    Bookmark,
    Download,
    Upload,
    Settings,
    ChevronRight,
    Play,
    Pause,
    RotateCcw,
    Zap,
    Target,
    Award,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    Database,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VeterinaryGlossary } from "@/api/entities";
import { glossaryManager } from "@/api/functions";

// ADVANCED GLOSSARY MANAGEMENT SYSTEM
export default function ComprehensiveGlossaryManager({ 
    initialSearchTerm = '', 
    onTermSelect,
    embedded = false,
    learningMode = false 
}) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('detailed'); // detailed, compact, cards
    const [sortBy, setSortBy] = useState('alphabetical');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [bookmarkedTerms, setBookmarkedTerms] = useState(new Set());
    const [studyMode, setStudyMode] = useState(false);
    const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
    const [studyProgress, setStudyProgress] = useState(0);
    const [pronunciationEnabled, setPronunciationEnabled] = useState(true);
    
    // Advanced search features
    const [searchFilters, setSearchFilters] = useState({
        difficulty: 'all',
        species: 'all',
        specialty: 'all',
        frequency: 'all'
    });
    
    const searchTimeoutRef = useRef(null);
    const audioRef = useRef(null);

    // Load glossary data on mount
    useEffect(() => {
        loadCategories();
        if (initialSearchTerm) {
            performSearch(initialSearchTerm);
        } else {
            loadPopularTerms();
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (searchTerm.trim()) {
                performSearch(searchTerm);
            } else {
                loadPopularTerms();
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, selectedCategory, searchFilters, sortBy]);

    const loadCategories = async () => {
        try {
            const response = await glossaryManager({
                action: 'getCategories'
            });
            
            if (response.data?.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadPopularTerms = async () => {
        setIsLoading(true);
        try {
            const response = await glossaryManager({
                action: 'getPopularTerms',
                limit: 20
            });
            
            if (response.data?.terms) {
                setSearchResults(response.data.terms);
            }
        } catch (error) {
            console.error('Failed to load popular terms:', error);
            // Fallback to local data
            try {
                const fallbackTerms = await VeterinaryGlossary.list('-usage_statistics.view_count', 20);
                setSearchResults(fallbackTerms || []);
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
                setSearchResults([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const performSearch = async (query) => {
        if (!query.trim()) return;
        
        setIsLoading(true);
        try {
            const response = await glossaryManager({
                action: 'searchTerms',
                query,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                filters: searchFilters,
                sortBy,
                limit: 50
            });
            
            if (response.data?.results) {
                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Fallback search
            try {
                const allTerms = await VeterinaryGlossary.list();
                const filtered = (allTerms || []).filter(term => 
                    term.term_english?.toLowerCase().includes(query.toLowerCase()) ||
                    term.term_persian?.toLowerCase().includes(query.toLowerCase()) ||
                    term.definition_comprehensive?.definition_english?.toLowerCase().includes(query.toLowerCase()) ||
                    term.definition_comprehensive?.definition_persian?.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
            } catch (fallbackError) {
                console.error('Fallback search failed:', fallbackError);
                setSearchResults([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTermClick = async (term) => {
        setSelectedTerm(term);
        
        // Track usage
        try {
            await glossaryManager({
                action: 'trackUsage',
                termId: term.id,
                interactionType: 'view'
            });
        } catch (error) {
            console.error('Failed to track usage:', error);
        }

        if (onTermSelect) {
            onTermSelect(term);
        }
    };

    const toggleBookmark = (termId) => {
        setBookmarkedTerms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(termId)) {
                newSet.delete(termId);
            } else {
                newSet.add(termId);
            }
            return newSet;
        });
    };

    const playPronunciation = async (term, language = 'english') => {
        if (!pronunciationEnabled) return;

        try {
            const audioUrl = language === 'english' 
                ? term.pronunciation_guide?.audio_url_english 
                : term.pronunciation_guide?.audio_url_persian;

            if (audioUrl) {
                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    await audioRef.current.play();
                }
            } else {
                // Fallback: use text-to-speech
                const text = language === 'english' ? term.term_english : term.term_persian;
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = language === 'english' ? 'en-US' : 'fa-IR';
                    speechSynthesis.speak(utterance);
                }
            }
        } catch (error) {
            console.error('Pronunciation failed:', error);
        }
    };

    const startStudyMode = () => {
        if (searchResults.length === 0) return;
        
        setStudyMode(true);
        setCurrentStudyIndex(0);
        setStudyProgress(0);
        setSelectedTerm(searchResults[0]);
    };

    const nextStudyTerm = () => {
        if (currentStudyIndex < searchResults.length - 1) {
            const nextIndex = currentStudyIndex + 1;
            setCurrentStudyIndex(nextIndex);
            setSelectedTerm(searchResults[nextIndex]);
            setStudyProgress((nextIndex / searchResults.length) * 100);
        } else {
            // Study session complete
            setStudyMode(false);
            alert('جلسه مطالعه تکمیل شد! 🎉');
        }
    };

    const exitStudyMode = () => {
        setStudyMode(false);
        setCurrentStudyIndex(0);
        setStudyProgress(0);
    };

    const renderTermCard = (term, index) => {
        const isBookmarked = bookmarkedTerms.has(term.id);
        
        return (
            <motion.div
                key={term.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-300 ${
                        selectedTerm?.id === term.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    }`}
                    onClick={() => handleTermClick(term)}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-lg text-gray-800">{term.term_english}</h3>
                                    {pronunciationEnabled && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPronunciation(term, 'english');
                                            }}
                                            className="p-1"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="text-right mb-2">
                                    <span className="text-lg font-medium text-gray-700">{term.term_persian}</span>
                                    {pronunciationEnabled && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPronunciation(term, 'persian');
                                            }}
                                            className="p-1 mr-2"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {term.definition_comprehensive?.definition_persian || 'تعریف در دسترس نیست'}
                                </p>

                                <div className="flex flex-wrap gap-1 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {term.category}
                                    </Badge>
                                    {term.assessment_information?.difficulty_level && (
                                        <Badge 
                                            variant={term.assessment_information.difficulty_level === 'advanced' ? 'destructive' : 'outline'}
                                            className="text-xs"
                                        >
                                            {term.assessment_information.difficulty_level}
                                        </Badge>
                                    )}
                                    {term.clinical_context?.frequency_of_use && (
                                        <Badge variant="outline" className="text-xs">
                                            {term.clinical_context.frequency_of_use}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(term.id);
                                    }}
                                    className={isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
                                >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                </Button>
                                
                                {term.quality_metrics?.user_rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs">{term.quality_metrics.user_rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const renderDetailedView = (term) => {
        if (!term) return null;

        return (
            <div className="space-y-6">
                {/* Main Term Information */}
                <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl text-blue-900 mb-2">
                                    {term.term_english}
                                </CardTitle>
                                <div className="text-xl text-right text-gray-700">
                                    {term.term_persian}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {pronunciationEnabled && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => playPronunciation(term, 'english')}
                                        >
                                            <Volume2 className="w-4 h-4 mr-1" />
                                            EN
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => playPronunciation(term, 'persian')}
                                        >
                                            <Volume2 className="w-4 h-4 mr-1" />
                                            FA
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {term.pronunciation_guide && (
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-800 mb-2">راهنمای تلفظ:</h4>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    {term.pronunciation_guide.phonetic_english && (
                                        <div>
                                            <span className="font-medium">انگلیسی:</span> 
                                            <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {term.pronunciation_guide.phonetic_english}
                                            </span>
                                        </div>
                                    )}
                                    {term.pronunciation_guide.phonetic_persian && (
                                        <div className="text-right">
                                            <span className="font-medium">فارسی:</span> 
                                            <span className="mr-2 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {term.pronunciation_guide.phonetic_persian}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {term.definition_comprehensive && (
                            <div className="space-y-4">
                                {term.definition_comprehensive.definition_english && (
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">English Definition:</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            {term.definition_comprehensive.definition_english}
                                        </p>
                                    </div>
                                )}
                                
                                {term.definition_comprehensive.definition_persian && (
                                    <div className="text-right">
                                        <h4 className="font-medium text-gray-800 mb-2">تعریف فارسی:</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            {term.definition_comprehensive.definition_persian}
                                        </p>
                                    </div>
                                )}

                                {term.definition_comprehensive.etymology && (
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">ریشه‌شناسی:</h4>
                                        <p className="text-sm text-gray-600">
                                            {term.definition_comprehensive.etymology}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Clinical Context */}
                {term.clinical_context && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-600" />
                                اهمیت کلینیکی
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {term.clinical_context.clinical_significance && (
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-1">اهمیت:</h4>
                                    <p className="text-gray-700 text-sm">
                                        {term.clinical_context.clinical_significance}
                                    </p>
                                </div>
                            )}
                            
                            {term.clinical_context.frequency_of_use && (
                                <div>
                                    <span className="font-medium text-gray-800">میزان استفاده:</span>
                                    <Badge className="mr-2">
                                        {term.clinical_context.frequency_of_use}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Species Relevance */}
                {term.species_relevance && term.species_relevance.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-600" />
                                ارتباط با گونه‌ها
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {term.species_relevance.map((species, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{species.species}</span>
                                        <Badge variant={
                                            species.relevance_level === 'critical' ? 'destructive' :
                                            species.relevance_level === 'major' ? 'default' : 'secondary'
                                        }>
                                            {species.relevance_level}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Related Terms */}
                {term.related_terms && term.related_terms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                اصطلاحات مرتبط
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                {term.related_terms.map((related, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                        <span className="text-gray-700">{related.related_term}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {related.relationship_type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Learning Aids */}
                {term.learning_aids && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                ابزارهای یادگیری
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {term.learning_aids.mnemonics && term.learning_aids.mnemonics.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">کمک حافظه:</h4>
                                    {term.learning_aids.mnemonics.map((mnemonic, index) => (
                                        <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                                            <p className="font-medium text-yellow-800">{mnemonic.mnemonic}</p>
                                            {mnemonic.explanation && (
                                                <p className="text-sm text-yellow-700 mt-1">{mnemonic.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {term.learning_aids.common_mistakes && term.learning_aids.common_mistakes.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">اشتباهات رایج:</h4>
                                    {term.learning_aids.common_mistakes.map((mistake, index) => (
                                        <div key={index} className="p-3 bg-red-50 rounded-lg">
                                            <p className="text-red-800"><strong>اشتباه:</strong> {mistake.mistake}</p>
                                            <p className="text-red-700"><strong>صحیح:</strong> {mistake.correction}</p>
                                            {mistake.explanation && (
                                                <p className="text-sm text-red-600 mt-1">{mistake.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className={`space-y-6 ${embedded ? '' : 'p-6'}`}>
            <audio ref={audioRef} />
            
            {/* Header and Controls */}
            {!embedded && (
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">فرهنگ اصطلاحات دامپزشکی</h1>
                        <p className="text-gray-600">جستجو و مطالعه اصطلاحات تخصصی دامپزشکی</p>
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                onClick={startStudyMode}
                                variant="outline"
                                className="gap-2"
                            >
                                <Brain className="w-4 h-4" />
                                حالت مطالعه
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPronunciationEnabled(!pronunciationEnabled)}
                                className={pronunciationEnabled ? 'bg-green-100' : ''}
                            >
                                <Volume2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Study Mode Progress */}
            {studyMode && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">حالت مطالعه فعال</span>
                                <Badge>{currentStudyIndex + 1} از {searchResults.length}</Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={exitStudyMode}>
                                خروج از مطالعه
                            </Button>
                        </div>
                        <Progress value={studyProgress} className="mb-3" />
                        <div className="flex justify-between">
                            <Button 
                                onClick={nextStudyTerm} 
                                disabled={currentStudyIndex >= searchResults.length - 1}
                            >
                                اصطلاح بعدی
                                <ChevronRight className="w-4 h-4 mr-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filters */}
            {!studyMode && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {/* Main Search */}
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="جستجو اصطلاحات (انگلیسی یا فارسی)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                                <Button variant="outline">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Filters Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="دسته‌بندی" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">همه دسته‌ها</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={searchFilters.difficulty} onValueChange={(value) => 
                                    setSearchFilters(prev => ({...prev, difficulty: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="سطح دشواری" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">همه سطوح</SelectItem>
                                        <SelectItem value="basic">مقدماتی</SelectItem>
                                        <SelectItem value="intermediate">متوسط</SelectItem>
                                        <SelectItem value="advanced">پیشرفته</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={searchFilters.frequency} onValueChange={(value) => 
                                    setSearchFilters(prev => ({...prev, frequency: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="میزان استفاده" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">همه</SelectItem>
                                        <SelectItem value="very_common">بسیار رایج</SelectItem>
                                        <SelectItem value="common">رایج</SelectItem>
                                        <SelectItem value="uncommon">غیررایج</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="مرتب‌سازی" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alphabetical">الفبایی</SelectItem>
                                        <SelectItem value="popularity">محبوبیت</SelectItem>
                                        <SelectItem value="difficulty">دشواری</SelectItem>
                                        <SelectItem value="recent">جدیدترین</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Terms List */}
                <div className={`space-y-4 ${selectedTerm ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">در حال جستجو...</p>
                        </div>
                    )}

                    {!isLoading && searchResults.length === 0 && searchTerm && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">هیچ اصطلاحی یافت نشد.</p>
                                <p className="text-sm text-gray-500 mt-1">کلمات کلیدی مختلفی امتحان کنید.</p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && searchResults.length === 0 && !searchTerm && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">برای شروع یک اصطلاح جستجو کنید</p>
                                <p className="text-sm text-gray-500 mt-1">یا از اصطلاحات محبوب زیر استفاده کنید</p>
                            </CardContent>
                        </Card>
                    )}

                    <AnimatePresence>
                        {searchResults.map((term, index) => renderTermCard(term, index))}
                    </AnimatePresence>
                </div>

                {/* Term Details */}
                {selectedTerm && (
                    <div className="lg:col-span-2">
                        {renderDetailedView(selectedTerm)}
                    </div>
                )}
            </div>
        </div>
    );
}