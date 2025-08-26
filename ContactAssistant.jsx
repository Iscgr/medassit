
// بازطراحی حرفه‌ای با معماری پایدار و کم-مصرف
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assistantTextChat } from "@/api/functions";
import { User } from "@/api/entities";
import { Send, Phone, Loader2, Smile, Tags, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import VirtualizedMessageList from "@/components/chat/VirtualizedMessageList";
import CallControls from "@/components/chat/CallControls";
import PerfGuard from "@/components/utils/PerfGuard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { exportConversation } from "@/api/functions";
import FeedbackBar from "@/components/feedback/FeedbackBar";
import { AIResponse } from "@/api/entities";
import { Feedback } from "@/api/entities";
import RewardsBanner from "@/components/gamification/RewardsBanner";

export default function ContactAssistant() {
  // Messages (immutable)
  const [messages, setMessages] = useState(() => [
    {
      id: `init-${Date.now()}`,
      content: "سلام صنم جان! من دستیار هوشمندت هستم. می‌تونی با من چت کنی یا تماس بگیری.",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);

  // UI/Input
  const [inputState, setInputState] = useState({ message: "", isLoading: false });

  // NEW: persistent session and topic tags
  const [sessionId, setSessionId] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem("sy_chat_session_id");
      }
    } catch {
      // In SSR or environment where localStorage is not available
      return null;
    }
    return null;
  });
  const [topicTags, setTopicTags] = useState([]);

  // NEW: track last AI response id for feedback
  const [lastAiResponseId, setLastAiResponseId] = useState(null);

  // Call
  const [callState, setCallState] = useState({
    active: false,
    duration: 0,
    micEnabled: false,
    videoEnabled: false,
    speakerEnabled: true
  });

  // Performance mode
  const [lowPowerMode, setLowPowerMode] = useState(false);

  // Refs
  const abortRef = useRef(null);
  const callTimerRef = useRef(null);
  const voiceChatRef = useRef(null); // keep for compatibility, but calls go to window.voiceChatInstance

  // Load user (optional)
  useEffect(() => {
    User.me().catch(() => null);
  }, []);

  // Call timer (with cleanup)
  useEffect(() => {
    if (callState.active) {
      callTimerRef.current = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      setCallState((prev) => ({ ...prev, duration: 0 }));
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState.active]);

  // Persist sessionId to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (sessionId) {
          localStorage.setItem("sy_chat_session_id", sessionId);
        } else {
          localStorage.removeItem("sy_chat_session_id");
        }
      }
    } catch {}
  }, [sessionId]);

  // Send message (safe, cancellable)
  const handleSendMessage = useCallback(async () => {
    const text = (inputState.message || "").trim();
    if (!text || inputState.isLoading) return;

    // Cancel pending
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const userMsg = { id: `${Date.now()}-${Math.random()}`, content: text, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputState({ message: "", isLoading: true });

    try {
      const history = [...messages, userMsg].slice(-6).map((m) => ({ role: m.sender, content: m.content }));
      // CHANGED: pass sessionId to backend
      const { data } = await assistantTextChat({ message: text, history, sessionId, signal: abortRef.current.signal });
      const reply = typeof data?.reply === "string" ? data.reply : (data?.reply?.content || "");
      const assistantMsg = {
        id: `${Date.now()}-assistant`,
        content: reply || "پاسخی دریافت نشد.",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // NEW: capture aiResponseId for feedback
      setLastAiResponseId(data?.aiResponseId || null);

      // NEW: update sessionId and topicTags from backend response
      if (data?.sessionId) setSessionId(data.sessionId);
      if (Array.isArray(data?.topicTags)) setTopicTags(data.topicTags);

      // Use global singleton instead of local ref
      if (callState.active && callState.speakerEnabled && window.voiceChatInstance?.startSpeaking) {
        window.voiceChatInstance.startSpeaking(assistantMsg.content);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-err`,
            content: "متاسفانه در ارسال یا دریافت پاسخ مشکلی پیش آمد.",
            sender: "system",
            timestamp: new Date()
          }
        ]);
      }
    } finally {
      setInputState((p) => ({ ...p, isLoading: false }));
      abortRef.current = null;
    }
  }, [inputState.message, inputState.isLoading, messages, sessionId, callState.active, callState.speakerEnabled]);

  // Voice transcript handler (guards for string)
  const handleVoiceTranscript = useCallback(
    (t) => {
      const text = typeof t === "string" ? t.trim() : "";
      if (!text) return;
      const m = { id: `${Date.now()}-voice`, content: text, sender: "user", timestamp: new Date() };
      setMessages((prev) => [...prev, m]);
      setInputState((p) => ({ ...p, message: "" }));
      // Reuse send pipeline
      (async () => {
        // Pass sessionId to assistantTextChat for voice transcripts too
        const { data } = await assistantTextChat({ message: text, history: [{ role: "user", content: text }], sessionId });
        const assistantMsg = {
          id: `${Date.now()}-voice-resp`,
          content: data?.reply || "پاسخی دریافت نشد.",
          sender: "assistant",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);
        // NEW: capture aiResponseId here as well
        setLastAiResponseId(data?.aiResponseId || null);
        // Update sessionId and topicTags from voice response
        if (data?.sessionId) setSessionId(data.sessionId);
        if (Array.isArray(data?.topicTags)) setTopicTags(data.topicTags);
      })();
    },
    [sessionId] // Add sessionId to dependencies
  );

  // Call control functions
  const startCall = useCallback(() => {
    if (callState.active) return;
    setCallState((p) => ({ ...p, active: true, micEnabled: true }));
    setMessages((prev) => [...prev, { id: `${Date.now()}-sys`, content: "تماس شروع شد", sender: "system", timestamp: new Date() }]);
    // Use global singleton instead of per-page stub
    window.voiceChatInstance?.startListening?.();
  }, [callState.active]);

  const endCall = useCallback(() => {
    if (!callState.active) return;
    const dur = callState.duration;
    setCallState({ active: false, duration: 0, micEnabled: false, videoEnabled: false, speakerEnabled: true });
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-sys2`, content: `تماس پایان یافت (مدت ${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")})`, sender: "system", timestamp: new Date() }
    ]);
    // Stop all resources on the singleton
    window.voiceChatInstance?.stopAll?.();
  }, [callState.active, callState.duration]);

  const handleToggle = useCallback((type) => {
    const inst = window.voiceChatInstance;
    if (!inst) return;
    setCallState((prev) => {
      const next = { ...prev };
      if (type === "mic") {
        next.micEnabled = !prev.micEnabled;
        next.micEnabled ? inst.startListening?.() : inst.stopListening?.();
      } else if (type === "video") {
        next.videoEnabled = !prev.videoEnabled;
        next.videoEnabled ? inst.startCamera?.() : inst.stopCamera?.();
      } else if (type === "speaker") {
        next.speakerEnabled = !prev.speakerEnabled;
        if (!next.speakerEnabled) inst.stopSpeaking?.();
      }
      return next;
    });
  }, []);

  // Input handlers
  const onChangeInput = useCallback((e) => setInputState((p) => ({ ...p, message: e.target.value })), []);
  const onKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Expose transcript handler for global VoiceChat instance to use
  // This ensures the ContactAssistant component can receive transcripts
  // even if the VoiceChat component is mounted globally.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__sanam_onTranscript = handleVoiceTranscript;
    }
    return () => {
      if (typeof window !== 'undefined' && window.__sanam_onTranscript === handleVoiceTranscript) {
        delete window.__sanam_onTranscript;
      }
    };
  }, [handleVoiceTranscript]);

  // NEW: reset conversation (start a new one)
  const startNewConversation = useCallback(() => {
    setSessionId(null); // Resets session ID
    setTopicTags([]); // Clears existing topic tags
    setLastAiResponseId(null); // Clear any pending feedback for the previous session
    setMessages((prev) => [
      // Adds a system message indicating new conversation
      ...prev,
      { id: `${Date.now()}-sys-new`, content: "گفتگوی جدید آغاز شد.", sender: "system", timestamp: new Date() }
    ]);
  }, []);

  // NEW: handle export current conversation to PDF
  const handleExportCurrent = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { data } = await exportConversation({ sessionId });
      // Ensure data is an ArrayBuffer or Blob
      if (!(data instanceof Blob)) {
        console.error("Expected Blob data for PDF export, got:", data);
        alert("خطا در دریافت فایل PDF. لطفاً دوباره تلاش کنید.");
        return;
      }
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Failed to export conversation:", error);
      alert("خطا در خروجی گرفتن گفتگو به صورت PDF. لطفاً دوباره تلاش کنید.");
    }
  }, [sessionId]);

  return (
    <div className="p-4 lg:p-8 flex items-center justify-center min-h-[85vh]" dir="rtl">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col rounded-3xl shadow-2xl shadow-pink-200/30 bg-white/80 backdrop-blur-sm border border-rose-100/50">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-rose-100/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold">SY</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg text-gray-800">صنم یار</h2>
              <p className="text-sm text-gray-600">دستیار هوشمند دامپزشکی</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* NEW: show topic tags if available */}
            {topicTags?.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <Tags className="w-4 h-4 text-rose-600" />
                <div className="flex flex-wrap gap-1 max-w-[40vw] justify-end">
                  {topicTags.slice(0, 5).map((t, i) => (
                    <Badge key={i} variant="secondary" className="rounded-full text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200">
                      {t}
                    </Badge>
                  ))}
                  {topicTags.length > 5 && (
                    <Badge variant="secondary" className="rounded-full text-xs bg-pink-50 text-pink-500 border-pink-100">
                      +{topicTags.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-pink-100 hidden sm:inline-flex" // Hide on small screens to save space
              onClick={startNewConversation}
              title="شروع گفتگوی جدید"
            >
              گفتگوی جدید
            </Button>
            {/* Show as icon on small screens */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-pink-100 sm:hidden"
              onClick={startNewConversation}
              title="شروع گفتگوی جدید"
            >
              <Smile className="w-5 h-5 text-pink-600" /> {/* Reusing Smile icon for "New chat" button */}
            </Button>
            {sessionId && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-pink-100"
                onClick={handleExportCurrent}
                title="خروجی PDF گفتگو"
              >
                <Download className="w-5 h-5 text-pink-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-pink-100"
              onClick={startCall}
              disabled={callState.active}
              title="شروع تماس"
            >
              <Phone className={`w-5 h-5 ${callState.active ? "text-gray-400" : "text-pink-600"}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <PerfGuard onDegrade={() => setLowPowerMode(true)} onRestore={() => setLowPowerMode(false)} />
          {/* نمایش compact پیشرفت گامیفیکیشن */}
          <div className="p-3 border-b border-rose-100/50">
            <RewardsBanner compact={true} />
          </div>
          <VirtualizedMessageList
            messages={messages}
            isLoading={inputState.isLoading}
            estimatedItemHeight={96}
          />
          {/* NEW: feedback bar for last AI answer */}
          {lastAiResponseId && (
            <div className="p-3 border-t border-rose-100/50 bg-white/60">
              <FeedbackBar
                aiResponseId={lastAiResponseId}
                onSubmitted={() => setLastAiResponseId(null)}
              />
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t border-rose-100/50 space-y-3">
          <CallControls
            callActive={callState.active}
            callDuration={callState.duration}
            micEnabled={callState.micEnabled}
            videoEnabled={callState.videoEnabled}
            speakerEnabled={callState.speakerEnabled}
            onToggle={handleToggle}
            onEndCall={endCall}
          />
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="پیام خود را بنویسید..."
                value={inputState.message}
                onChange={onChangeInput}
                onKeyPress={onKeyPress}
                disabled={inputState.isLoading}
                className="rounded-full pl-12 pr-4 py-3 border-gray-300 focus:border-pink-400 focus:ring-pink-400 bg-white/70"
              />
              <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 hover:bg-gray-100" title="ایموجی‌ها">
                <Smile className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={inputState.isLoading || !inputState.message.trim()}
              size="icon"
              className="rounded-full bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white w-11 h-11 flex-shrink-0 shadow-lg shadow-pink-500/25"
              title="ارسال"
            >
              {inputState.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
