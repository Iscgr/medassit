import React, { useState } from "react";
import { Highlighter, Save, Edit3, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function NoteTaking({ resourceId, initialNotes = [] }) {
    const [notes, setNotes] = useState(initialNotes);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
    const [editingId, setEditingId] = useState(null);

    const saveNote = async () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;
        
        const noteData = {
            ...newNote,
            id: Date.now(),
            resourceId,
            createdAt: new Date().toISOString(),
            color: `hsl(${Math.random() * 360}, 70%, 85%)`
        };
        
        setNotes(prev => [noteData, ...prev]);
        setNewNote({ title: '', content: '', tags: [] });
        setIsAddingNote(false);
        
        // TODO: Save to backend
    };

    const deleteNote = (id) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        // TODO: Delete from backend
    };

    const addTag = (tag) => {
        if (tag && !newNote.tags.includes(tag)) {
            setNewNote(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Highlighter className="w-5 h-5 text-purple-600" />
                    یادداشت‌های تو
                </h3>
                <Button 
                    onClick={() => setIsAddingNote(true)}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    یادداشت جدید
                </Button>
            </div>

            {isAddingNote && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-purple-800">یادداشت جدید</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="عنوان یادداشت..."
                            value={newNote.title}
                            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                            className="rounded-2xl"
                        />
                        <Textarea
                            placeholder="صنم جان، اینجا یادداشتت رو بنویس..."
                            value={newNote.content}
                            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="rounded-2xl"
                        />
                        <div className="flex gap-2">
                            <Input
                                placeholder="تگ اضافه کن..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="rounded-2xl"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {newNote.tags.map((tag, index) => (
                                <Badge key={index} className="bg-purple-100 text-purple-800">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={saveNote} className="rounded-2xl">
                                <Save className="w-4 h-4 mr-2" />
                                ذخیره
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsAddingNote(false)}
                                className="rounded-2xl"
                            >
                                انصراف
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                    <Card key={note.id} 
                          className="border-0 hover:scale-105 transition-transform duration-200"
                          style={{ backgroundColor: note.color }}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-gray-800">{note.title}</h4>
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="w-6 h-6 rounded-full">
                                        <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="w-6 h-6 rounded-full hover:bg-red-100"
                                        onClick={() => deleteNote(note.id)}
                                    >
                                        <Trash2 className="w-3 h-3 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{note.content}</p>
                            <div className="flex gap-1 flex-wrap">
                                {note.tags?.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {notes.length === 0 && !isAddingNote && (
                <div className="text-center py-12 text-gray-500">
                    <Highlighter className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">هنوز یادداشتی نداری صنم جان</p>
                    <p className="text-sm">وقتی مطالعه می‌کنی، نکات مهم رو اینجا یادداشت کن تا فراموش نشه!</p>
                </div>
            )}
        </div>
    );
}