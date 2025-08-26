import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, MessageSquare, Edit, HelpCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Feedback, AIResponse } from '@/api/entities';
import { toast } from 'sonner';

const FEEDBACK_TAGS = [
    { value: 'accurate', label: 'دقیق', color: 'green' },
    { value: 'inaccurate', label: 'نادقیق', color: 'red' },
    { value: 'complete', label: 'کامل', color: 'blue' },
    { value: 'incomplete', label: 'ناقص', color: 'orange' },
    { value: 'helpful', label: 'مفید', color: 'green' },
    { value: 'confusing', label: 'نامفهوم', color: 'red' },
    { value: 'well_explained', label: 'خوب توضیح داده شده', color: 'blue' },
    { value: 'needs_examples', label: 'نیاز به مثال', color: 'orange' },
    { value: 'missing_sources', label: 'فاقد منابع', color: 'yellow' },
    { value: 'outdated_info', label: 'اطلاعات قدیمی', color: 'gray' }
];

export default function FeedbackCollector({ responseId, responseContent, moduleType, onFeedbackSubmitted }) {
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackType, setFeedbackType] = useState('rating');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [correctedContent, setCorrectedContent] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleTag = (tagValue) => {
        setSelectedTags(prev => 
            prev.includes(tagValue) 
                ? prev.filter(t => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    const getTagColor = (tagValue) => {
        const tag = FEEDBACK_TAGS.find(t => t.value === tagValue);
        return tag?.color || 'gray';
    };

    const submitFeedback = async () => {
        if (!comment.trim() && feedbackType !== 'rating') {
            toast.error('لطفاً توضیحاتی وارد کنید');
            return;
        }

        if (feedbackType === 'rating' && rating === 0) {
            toast.error('لطفاً امتیازی انتخاب کنید');
            return;
        }

        setIsSubmitting(true);

        try {
            // ثبت بازخورد
            const feedbackData = {
                response_id: responseId,
                feedback_type: feedbackType,
                rating: feedbackType === 'rating' ? rating : undefined,
                comment: comment,
                corrected_content: feedbackType === 'correction' ? correctedContent : undefined,
                tags: selectedTags,
                module_type: moduleType
            };

            await Feedback.create(feedbackData);

            // به‌روزرسانی آمار پاسخ
            await updateResponseStats(responseId, feedbackType, rating);

            // Reset form
            setShowFeedbackForm(false);
            setRating(0);
            setComment('');
            setCorrectedContent('');
            setSelectedTags([]);
            setFeedbackType('rating');

            toast.success('با تشکر از بازخورد شما! این کمک می‌کند تا پاسخ‌ها را بهبود دهیم.');
            
            if (onFeedbackSubmitted) {
                onFeedbackSubmitted(feedbackData);
            }

        } catch (error) {
            console.error('خطا در ثبت بازخورد:', error);
            toast.error('خطا در ثبت بازخورد. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateResponseStats = async (responseId, feedbackType, rating) => {
        try {
            // دریافت بازخوردهای موجود برای این پاسخ
            const existingFeedbacks = await Feedback.filter({ response_id: responseId });
            const ratings = existingFeedbacks
                .filter(f => f.feedback_type === 'rating' && f.rating)
                .map(f => f.rating);
            
            if (feedbackType === 'rating' && rating) {
                ratings.push(rating);
            }

            const averageRating = ratings.length > 0 ? 
                ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

            // به‌روزرسانی آمار در AIResponse (اگر وجود دارد)
            const aiResponse = await AIResponse.filter({ id: responseId });
            if (aiResponse.length > 0) {
                await AIResponse.update(responseId, {
                    feedback_count: existingFeedbacks.length + 1,
                    average_rating: averageRating,
                    has_corrections: existingFeedbacks.some(f => f.feedback_type === 'correction') || feedbackType === 'correction'
                });
            }
        } catch (error) {
            console.error('خطا در به‌روزرسانی آمار:', error);
        }
    };

    if (!showFeedbackForm) {
        return (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFeedbackForm(true)}
                    className="text-gray-600 hover:text-blue-600"
                >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    بازخورد به این پاسخ
                </Button>
            </div>
        );
    }

    return (
        <Card className="mt-4 border-2 border-blue-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-blue-800">ارسال بازخورد</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFeedbackForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={feedbackType} onValueChange={setFeedbackType}>
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="rating" className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            امتیازدهی
                        </TabsTrigger>
                        <TabsTrigger value="correction" className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            اصلاح
                        </TabsTrigger>
                        <TabsTrigger value="additional_info" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            اطلاعات تکمیلی
                        </TabsTrigger>
                        <TabsTrigger value="question" className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            پرسش
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rating" className="space-y-4">
                        <div className="text-center">
                            <Label className="text-base">چقدر از این پاسخ راضی بودید؟</Label>
                            <div className="flex justify-center items-center gap-2 mt-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-2xl transition-colors ${
                                            rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                        } hover:text-yellow-400`}
                                    >
                                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {rating === 0 && 'امتیازی انتخاب نکرده‌اید'}
                                {rating === 1 && 'خیلی ضعیف'}
                                {rating === 2 && 'ضعیف'}
                                {rating === 3 && 'متوسط'}
                                {rating === 4 && 'خوب'}
                                {rating === 5 && 'عالی'}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="correction" className="space-y-4">
                        <div>
                            <Label>محتوای اصلاح شده</Label>
                            <Textarea
                                value={correctedContent || responseContent}
                                onChange={(e) => setCorrectedContent(e.target.value)}
                                rows={6}
                                className="mt-2"
                                placeholder="لطفاً محتوای صحیح را وارد کنید..."
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="additional_info" className="space-y-4">
                        <div>
                            <Label>اطلاعات تکمیلی</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="mt-2"
                                placeholder="چه اطلاعاتی می‌تواند به این پاسخ اضافه شود؟"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="question" className="space-y-4">
                        <div>
                            <Label>سوال شما</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="mt-2"
                                placeholder="سوال یا ابهام خود را مطرح کنید..."
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* توضیحات اضافی */}
                {feedbackType !== 'correction' && (
                    <div className="mt-4">
                        <Label>توضیحات (اختیاری)</Label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="توضیحات بیشتر..."
                            rows={3}
                            className="mt-2"
                        />
                    </div>
                )}

                {/* انتخاب برچسب‌ها */}
                <div className="mt-4">
                    <Label>برچسب‌ها (اختیاری)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {FEEDBACK_TAGS.map(tag => (
                            <Badge
                                key={tag.value}
                                variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${
                                    selectedTags.includes(tag.value) 
                                        ? `bg-${tag.color}-500 hover:bg-${tag.color}-600` 
                                        : `hover:bg-${tag.color}-100`
                                }`}
                                onClick={() => toggleTag(tag.value)}
                            >
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* دکمه‌های عمل */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setShowFeedbackForm(false)}
                        disabled={isSubmitting}
                    >
                        انصراف
                    </Button>
                    <Button 
                        onClick={submitFeedback}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <>در حال ارسال...</>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                ثبت بازخورد
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}