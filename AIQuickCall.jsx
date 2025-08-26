import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VoiceChat from "@/components/shared/VoiceChat";
import { Phone, PhoneOff, Mic, MicOff, Video, Radio } from "lucide-react";

export default function AIQuickCall() {
  const [callActive, setCallActive] = React.useState(false);
  const [micOn, setMicOn] = React.useState(true);
  const [videoOn, setVideoOn] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const timerRef = React.useRef(null);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((v) => v + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCall = async () => {
    setSeconds(0);
    setCallActive(true);
    // کمی تاخیر برای اطمینان از مونت شدن VoiceChat
    setTimeout(async () => {
      if (window.voiceChatInstance) {
        if (videoOn) {
          await window.voiceChatInstance.startCamera();
        }
        window.voiceChatInstance.startListening();
      }
    }, 100);
    startTimer();
  };

  const endCall = () => {
    setCallActive(false);
    if (window.voiceChatInstance) {
      window.voiceChatInstance.stopListening();
      window.voiceChatInstance.stopSpeaking?.();
      if (videoOn) {
        window.voiceChatInstance.stopCamera?.();
      }
    }
    stopTimer();
  };

  const toggleMic = () => {
    setMicOn((v) => {
      const nv = !v;
      if (window.voiceChatInstance) {
        if (nv) window.voiceChatInstance.startListening?.();
        else window.voiceChatInstance.stopListening?.();
      }
      return nv;
    });
  };

  const toggleVideo = async () => {
    if (!window.voiceChatInstance) return;
    if (!videoOn) {
      await window.voiceChatInstance.startCamera?.();
      setVideoOn(true);
    } else {
      window.voiceChatInstance.stopCamera?.();
      setVideoOn(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex justify-center lg:justify-end">
        <Card
          className="rounded-2xl bg-white/70 backdrop-blur px-3 py-2 border-0"
          style={{
            boxShadow:
              "inset -3px -3px 10px rgba(236,72,153,0.12), inset 3px 3px 10px rgba(255,255,255,0.9), 0 8px 22px rgba(236,72,153,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* Status */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                callActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  callActive ? "text-green-600 animate-pulse" : "text-gray-400"
                }`}
              />
              {callActive ? `در حال تماس • ${fmt(seconds)}` : "آماده تماس"}
            </span>

            {/* Start / End */}
            {!callActive ? (
              <Button
                onClick={startCall}
                className="rounded-xl h-8 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Phone className="w-4 h-4 ml-1" />
                شروع تماس هوشمند
              </Button>
            ) : (
              <Button onClick={endCall} variant="destructive" className="rounded-xl h-8 px-3">
                <PhoneOff className="w-4 h-4 ml-1" />
                پایان
              </Button>
            )}

            {/* Video toggle */}
            <Button
              size="sm"
              variant={videoOn ? "secondary" : "outline"}
              className="rounded-xl h-8 px-3"
              onClick={toggleVideo}
              disabled={!callActive && !videoOn}
              title={videoOn ? "ویدیو روشن" : "ویدیو خاموش"}
            >
              <Video className={`w-4 h-4 ${videoOn ? "text-indigo-700" : ""}`} />
            </Button>

            {/* Mic toggle */}
            <Button
              size="sm"
              variant={micOn ? "secondary" : "outline"}
              className="rounded-xl h-8 px-3"
              onClick={toggleMic}
              disabled={!callActive && micOn}
              title={micOn ? "میکروفون روشن" : "میکروفون خاموش"}
            >
              {micOn ? (
                <Mic className="w-4 h-4 text-emerald-700" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Stream engine (پنهان) */}
      <div className="hidden">
        <VoiceChat
          onMessage={(text) => {
            // پاس‌کاری پیام‌های گفتاری به ماژول‌های بالادستی در صورت نیاز
            // فعلاً سایلنت تا فقط تماس سریع از داشبورد فراهم شود
          }}
          onAnalyzeImage={() => {}}
          className="hidden"
          autoStart={callActive}
          onCallStatusChange={() => {}}
        />
      </div>
    </>
  );
}