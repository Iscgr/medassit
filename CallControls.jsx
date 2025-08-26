import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneOff, Radio } from "lucide-react";

export default function CallControls({ callActive, callDuration, micEnabled, videoEnabled, speakerEnabled, onToggle, onEndCall }) {
  const fmt = useCallback((s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }, []);

  if (!callActive) return null;

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50/80 rounded-2xl border">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-green-600 animate-pulse" />
        <span className="text-sm text-gray-700">تماس فعال • {fmt(callDuration)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={micEnabled ? "secondary" : "outline"}
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={() => onToggle("mic")}
          title={micEnabled ? "میکروفون روشن" : "میکروفون خاموش"}
        >
          {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button
          variant={videoEnabled ? "secondary" : "outline"}
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={() => onToggle("video")}
          title={videoEnabled ? "ویدیو روشن" : "ویدیو خاموش"}
        >
          {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button
          variant={speakerEnabled ? "secondary" : "outline"}
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={() => onToggle("speaker")}
          title={speakerEnabled ? "بلندگو روشن" : "بلندگو خاموش"}
        >
          {speakerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Button variant="destructive" size="icon" className="rounded-full w-10 h-10" onClick={onEndCall} title="پایان تماس">
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}