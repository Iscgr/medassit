
import React, { useEffect, useState, useCallback } from "react";
import { ConversationSession } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Clock, Tag, RefreshCw, Plus, Search, Trash2, Edit3, FileText, Download, CheckSquare, Square, Archive } from "lucide-react";
import { Star } from "lucide-react";
import { grokLLM } from "@/api/functions";
import { exportConversation } from "@/api/functions";
import { exportConversationsBatch } from "@/api/functions";

export default function Conversations() {
  const [sessions, setSessions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [busyExportList, setBusyExportList] = useState(false);
  // NEW: multi-select and bulk ops state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [busyBulk, setBusyBulk] = useState(false);
  // NEW: pinned filter
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me().catch(() => null);
      setMe(user);
      let list = [];
      if (user?.email) {
        list = await ConversationSession.filter({ created_by: user.email }, "-last_interaction", 50);
      } else {
        list = await ConversationSession.list("-updated_date", 50);
      }
      setSessions(list || []);
      setFiltered(list || []);
      clearSelection(); // Clear selection on load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = (query || "").trim();
    if (!q) {
      setFiltered(sessions);
      return;
    }
    const ql = q.toLowerCase();
    setFiltered(
      (sessions || []).filter((s) => {
        const title = (s.title || "").toLowerCase();
        const tags = (Array.isArray(s.topic_tags) ? s.topic_tags.join(" ") : "").toLowerCase();
        const summary = (s.summary || "").toLowerCase();
        return title.includes(ql) || tags.includes(ql) || summary.includes(ql);
      })
    );
    clearSelection(); // Clear selection when filter changes
  }, [query, sessions]);

  // NEW: selection helpers
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const isSelected = (id) => selectedIds.has(id);
  const clearSelection = () => setSelectedIds(new Set());
  const selectAllFiltered = () => setSelectedIds(new Set((filtered || []).map(s => s.id)));
  const allSelected = (filtered || []).length > 0 && selectedIds.size === (filtered || []).length;

  const fmtTime = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString("fa-IR");
    } catch {
      return "—";
    }
  };

  const handleResume = (sessionId) => {
    try {
      localStorage.setItem("sy_chat_session_id", sessionId);
    } catch {}
    window.location.href = createPageUrl("ContactAssistant");
  };

  const toggleArchive = async (s) => {
    setBusyId(s.id);
    await ConversationSession.update(s.id, { is_active: !s.is_active });
    setBusyId(null);
    load();
  };

  // NEW: toggle pinned on a single session
  const togglePinned = async (s) => {
    setBusyId(s.id);
    await ConversationSession.update(s.id, { is_pinned: !s.is_pinned });
    setBusyId(null);
    load();
  };

  const handleStartNew = () => {
    try {
      localStorage.removeItem("sy_chat_session_id");
    } catch {}
    window.location.href = createPageUrl("ContactAssistant");
  };

  const renameSession = async (s) => {
    const next = window.prompt("عنوان جدید گفتگو را وارد کنید:", s.title || "");
    if (next && next.trim()) {
      setBusyId(s.id);
      await ConversationSession.update(s.id, { title: next.trim() });
      setBusyId(null);
      load();
    }
  };

  const deleteSession = async (s) => {
    const ok = window.confirm("آیا از حذف این گفتگو مطمئن هستید؟ این عملیات برگشت‌پذیر نیست.");
    if (!ok) return;
    setBusyId(s.id);
    await ConversationSession.delete(s.id);
    setBusyId(null);
    load();
  };

  const regenerateSummary = async (s) => {
    // تولید خلاصه کوتاه فارسی با مدل grok-4-0709
    const history = Array.isArray(s.message_history) ? s.message_history : [];
    const joined = history
      .filter(m => m && typeof m.content === "string")
      .slice(-16) // محدود کردن ورودی
      .map(m => `${m.role === "user" ? "کاربر" : "دستیار"}: ${m.content}`)
      .join("\n");
    const prompt = `خلاصه فارسیِ ۲-۳ جمله‌ای و حرفه‌ای از این گفتگو تولید کن. بدون مقدمه و جمع‌بندی اضافه:
${joined}`;

    setBusyId(s.id);
    try {
      const { data } = await grokLLM({ prompt, temperature: 0.3, model: "grok-4-0709", max_tokens: 180 });
      const summary = (data?.reply || "").trim().slice(0, 400);
      if (summary) {
        await ConversationSession.update(s.id, { summary });
        load();
      }
    } finally {
      setBusyId(null);
    }
  };

  const exportPdf = async (s) => {
    try {
      setBusyId(s.id);
      const { data } = await exportConversation({ sessionId: s.id });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${s.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setBusyId(null);
    }
  };

  const handleExportFiltered = async () => {
    if (!filtered || filtered.length === 0) return;
    try {
      setBusyExportList(true);
      const ids = filtered.map(s => s.id);
      const { data } = await exportConversationsBatch({ sessionIds: ids });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-filtered.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setBusyExportList(false);
    }
  };

  // NEW: bulk operations
  const bulkArchive = async (active) => {
    if (selectedIds.size === 0) return;
    setBusyBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(async (id) => {
        // Ensure we only update items that are currently active/inactive as intended
        const item = (sessions || []).find(s => s.id === id);
        if (item && item.is_active !== active) { // Only update if state needs to change
          await ConversationSession.update(id, { is_active: active });
        }
      }));
      clearSelection();
      await load();
    } finally {
      setBusyBulk(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = window.confirm("حذف گفتگوهای انتخاب‌شده انجام شود؟ این عملیات برگشت‌پذیر نیست.");
    if (!ok) return;
    setBusyBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id => ConversationSession.delete(id)));
      clearSelection();
      await load();
    } finally {
      setBusyBulk(false);
    }
  };

  const bulkExportPdf = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBusyExportList(true);
      const ids = Array.from(selectedIds);
      const { data } = await exportConversationsBatch({ sessionIds: ids });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-selected.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setBusyExportList(false);
    }
  };

  // NEW: bulk pin/unpin
  const bulkPin = async (pin) => {
    if (selectedIds.size === 0) return;
    setBusyBulk(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(async (id) => {
        const item = (sessions || []).find(s => s.id === id);
        if (!item) return;
        if (!!item.is_pinned !== !!pin) {
          await ConversationSession.update(id, { is_pinned: !!pin });
        }
      }));
      clearSelection();
      await load();
    } finally {
      setBusyBulk(false);
    }
  };

  // NEW: derive displayed list with pinned filter + sort pinned first
  const displayed = (filtered || [])
    .filter(s => (showPinnedOnly ? !!s.is_pinned : true))
    .slice()
    .sort((a, b) => {
      const pinDelta = (b?.is_pinned ? 1 : 0) - (a?.is_pinned ? 1 : 0);
      if (pinDelta !== 0) return pinDelta;
      const ta = a?.last_interaction ? new Date(a.last_interaction).getTime() : 0;
      const tb = b?.last_interaction ? new Date(b.last_interaction).getTime() : 0;
      return tb - ta;
    });

  return (
    <div className="space-y-6 p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-rose-700" />
          <h1 className="text-2xl font-bold text-gray-800">جلسات گفتگو</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* NEW: select all / clear selection */}
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={allSelected ? clearSelection : selectAllFiltered}
            disabled={busyExportList || busyBulk || (filtered?.length || 0) === 0}
            title={allSelected ? "لغو انتخاب همه" : "انتخاب همه"}
          >
            {allSelected ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
            {allSelected ? "لغو انتخاب" : "انتخاب همه"}
          </Button>

          {/* Existing refresh */}
          <Button variant="outline" className="rounded-2xl" onClick={load} disabled={busyExportList || busyBulk}>
            <RefreshCw className="w-4 h-4 mr-1" /> بروزرسانی
          </Button>

          {/* NEW: show only pinned toggle */}
          <Button
            variant="outline"
            className={`rounded-2xl ${showPinnedOnly ? 'bg-yellow-50 border-yellow-200' : ''}`}
            onClick={() => setShowPinnedOnly(v => !v)}
            disabled={busyExportList || busyBulk}
            title="نمایش فقط گفتگوهای نشان‌گذاری‌شده"
          >
            <Star className={`w-4 h-4 mr-1 ${showPinnedOnly ? 'text-yellow-500 fill-yellow-500' : ''}`} />
            فقط نشان‌شده‌ها
          </Button>

          {/* Existing export filtered */}
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={handleExportFiltered}
            disabled={busyExportList || busyBulk || (filtered?.length || 0) === 0}
            title={(filtered?.length || 0) === 0 ? "موردی برای خروجی وجود ندارد" : "خروجی PDF از فهرست فعلی"}
          >
            {busyExportList ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            خروجی PDF (فهرست)
          </Button>

          {/* NEW: bulk actions on selected */}
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={bulkExportPdf}
            disabled={busyExportList || busyBulk || selectedIds.size === 0}
            title="خروجی PDF از موارد انتخاب‌شده"
          >
            {busyExportList ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            خروجی PDF (انتخاب‌شده‌ها)
          </Button>
          {/* NEW: bulk pin/unpin */}
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => bulkPin(true)}
            disabled={busyExportList || busyBulk || selectedIds.size === 0}
            title="نشان‌گذاری موارد انتخاب‌شده"
          >
            <Star className="w-4 h-4 mr-1 text-yellow-600" /> نشان‌گذاری
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => bulkPin(false)}
            disabled={busyExportList || busyBulk || selectedIds.size === 0}
            title="برداشتن نشان از موارد انتخاب‌شده"
          >
            <Star className="w-4 h-4 mr-1" /> برداشتن نشان
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => bulkArchive(false)}
            disabled={busyBulk || selectedIds.size === 0}
            title="آرشیو کردن انتخاب‌شده‌ها"
          >
            <Archive className="w-4 h-4 mr-1" /> آرشیو
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => bulkArchive(true)}
            disabled={busyBulk || selectedIds.size === 0}
            title="فعال‌سازی انتخاب‌شده‌ها"
          >
            <Archive className="w-4 h-4 mr-1 rotate-180" /> فعال‌سازی
          </Button>
          <Button
            variant="destructive"
            className="rounded-2xl"
            onClick={bulkDelete}
            disabled={busyBulk || selectedIds.size === 0}
            title="حذف انتخاب‌شده‌ها"
          >
            {busyBulk ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
            حذف
          </Button>

          {/* Existing start new */}
          <Button className="rounded-2xl bg-rose-600 hover:bg-rose-700" onClick={handleStartNew} disabled={busyExportList || busyBulk}>
            <Plus className="w-4 h-4 mr-1" /> گفتگوی جدید
          </Button>
        </div>
      </div>

      <Card className="bg-white/70 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-rose-800">
            <MessageSquare className="w-5 h-5" /> جلسات اخیر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در عنوان، برچسب‌ها یا خلاصه…"
              className="pr-9 rounded-2xl"
              disabled={busyBulk}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
              <span className="mr-2 text-gray-600">در حال بارگذاری…</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              هنوز گفتگویی ثبت نشده است.
            </div>
          ) : (
            <div className="grid gap-3">
              {displayed.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border transition-all duration-200 ${isSelected(s.id) ? 'ring-2 ring-rose-300 border-rose-300' : 'hover:from-pink-100 hover:to-rose-100'}`}
                  style={{
                    boxShadow: "inset -2px -2px 8px rgba(236, 72, 153, 0.1), inset 2px 2px 8px rgba(255, 255, 255, 0.8)"
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* NEW: selection checkbox */}
                      <button
                        onClick={() => toggleSelect(s.id)}
                        className="mt-1 text-rose-700 hover:opacity-80"
                        title={isSelected(s.id) ? "لغو انتخاب" : "انتخاب"}
                        disabled={busyBulk}
                      >
                        {isSelected(s.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>

                      {/* NEW: pin toggle next to checkbox */}
                      <button
                        onClick={() => togglePinned(s)}
                        className="mt-1 hover:opacity-80"
                        title={s.is_pinned ? "برداشتن نشان" : "نشان‌گذاری"}
                        disabled={busyId === s.id || busyBulk}
                      >
                        <Star className={`w-5 h-5 ${s.is_pinned ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 line-clamp-1">{s.title || "بدون عنوان"}</span>
                          <Badge className={s.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                            {s.is_active ? "فعال" : "آرشیو"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" /> آخرین تعامل: {fmtTime(s.last_interaction)}
                          <span className="mx-1">•</span>
                          <MessageSquare className="w-3 h-3" /> {Array.isArray(s.message_history) ? s.message_history.length : 0} پیام
                        </div>
                        {s.summary && (
                          <p className="mt-2 text-xs text-gray-700 line-clamp-2">{s.summary}</p>
                        )}
                        {Array.isArray(s.topic_tags) && s.topic_tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-2">
                            <Tag className="w-3 h-3 text-rose-600" />
                            {s.topic_tags.slice(0, 6).map((t, i) => (
                              <Badge key={i} variant="secondary" className="rounded-full text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-32">
                      <Button size="sm" className="rounded-2xl" onClick={() => handleResume(s.id)} disabled={busyId === s.id || busyBulk}>
                        ادامه گفتگو
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => toggleArchive(s)}
                        disabled={busyId === s.id || busyBulk}
                      >
                        {s.is_active ? "آرشیو" : "فعال‌سازی"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => renameSession(s)}
                        disabled={busyId === s.id || busyBulk}
                      >
                        <Edit3 className="w-3 h-3 ml-1" /> تغییر عنوان
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => regenerateSummary(s)}
                        disabled={busyId === s.id || busyBulk}
                      >
                        <FileText className="w-3 h-3 ml-1" /> خلاصه جدید
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => exportPdf(s)}
                        disabled={busyId === s.id || busyBulk}
                      >
                        <Download className="w-3 h-3 ml-1" /> خروجی PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-2xl"
                        onClick={() => deleteSession(s)}
                        disabled={busyId === s.id || busyBulk}
                      >
                        <Trash2 className="w-3 h-3 ml-1" /> حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
