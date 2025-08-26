import React, { useState, useEffect } from "react";
import { VeterinaryKnowledge } from "@/api/entities";
import { Search, BookOpen, Filter, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KnowledgeSearch({ onKnowledgeSelect }) {
    const [knowledgeBase, setKnowledgeBase] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadKnowledgeBase();
    }, []);

    useEffect(() => {
        filterResults();
    }, [searchTerm, selectedCategory, selectedSpecies, knowledgeBase]);

    const loadKnowledgeBase = async () => {
        try {
            const data = await VeterinaryKnowledge.list('-last_updated');
            setKnowledgeBase(data);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterResults = () => {
        let results = knowledgeBase;

        // Text search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            results = results.filter(item =>
                item.title.toLowerCase().includes(term) ||
                item.simplified_content?.toLowerCase().includes(term) ||
                item.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                item.key_concepts?.some(concept => 
                    concept.concept.toLowerCase().includes(term) ||
                    concept.definition_persian?.toLowerCase().includes(term)
                )
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            results = results.filter(item => item.category === selectedCategory);
        }

        // Species filter
        if (selectedSpecies !== 'all') {
            results = results.filter(item => 
                item.species?.includes(selectedSpecies) || item.species?.includes('all')
            );
        }

        setFilteredResults(results);
    };

    const categories = [...new Set(knowledgeBase.map(item => item.category))].filter(Boolean);
    const allSpecies = [...new Set(knowledgeBase.flatMap(item => item.species || []))].filter(Boolean);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="bg-white/60 backdrop-blur-sm border-0"
                  style={{
                      boxShadow: 'inset -2px -2px 8px rgba(59, 130, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="صنم جان، دنبال چی می‌گردی؟ (مثلاً جراحی، قلب، سگ...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 rounded-2xl border-blue-200"
                            />
                        </div>
                        
                        <div className="flex gap-3 flex-wrap">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48 rounded-2xl">
                                    <SelectValue placeholder="دسته‌بندی" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">همه دسته‌ها</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category.replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                                <SelectTrigger className="w-48 rounded-2xl">
                                    <SelectValue placeholder="گونه حیوان" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">همه حیوانات</SelectItem>
                                    {allSpecies.map(species => (
                                        <SelectItem key={species} value={species}>
                                            {species}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{filteredResults.length} مورد یافت شد</span>
                            {(searchTerm || selectedCategory !== 'all' || selectedSpecies !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('all');
                                        setSelectedSpecies('all');
                                    }}
                                    className="rounded-2xl"
                                >
                                    پاک کردن فیلترها
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                        <Card key={item.id} 
                              className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0"
                              style={{
                                  boxShadow: 'inset -2px -2px 8px rgba(59, 130, 246, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.9), 0 4px 16px rgba(59, 130, 246, 0.1)'
                              }}
                              onClick={() => onKnowledgeSelect?.(item)}>
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                            {item.simplified_content?.substring(0, 150)}...
                                        </p>
                                        
                                        <div className="flex gap-2 flex-wrap mb-2">
                                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                                                {item.category?.replace(/_/g, ' ')}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {item.difficulty_level}
                                            </Badge>
                                            {item.species?.slice(0, 2).map((species, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {species}
                                                </Badge>
                                            ))}
                                        </div>

                                        {item.key_concepts?.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Tag className="w-3 h-3" />
                                                <span>{item.key_concepts.length} مفهوم کلیدی</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">
                            {searchTerm ? 'هیچ نتیجه‌ای یافت نشد' : 'هنوز دانشی در کتابخانه نیست'}
                        </p>
                        <p className="text-sm">
                            {searchTerm 
                                ? 'سعی کن با کلمات دیگری جستجو کنی صنم جان'
                                : 'اول یه متن انگلیسی پردازش کن تا اینجا نمایش داده بشه'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}