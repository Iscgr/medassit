
// VoiceChat: resilient singleton with circuit-breaker, backoff, visibility/device guards and TTS queue
import React, { useEffect, useRef } from "react";
import { recordInit, recordCleanup } from "@/components/utils/VoiceDiagnostics";

// ---- Config (tunable, safe defaults) ----
const CONFIG = {
  autoRestartSR: true,
  restart: { baseDelay: 400, maxDelay: 8000, jitter: 0.25, factor: 2 },
  pauseOnHidden: true,
  duckTTSWhileListening: true, // stop SR while speaking, then resume
  log: false, // set true only for debugging
};

// ---- Logger (no-op by default) ----
const log = (...args) => { if (CONFIG.log) console.log("[VoiceChat]", ...args); };
const warn = (...args) => { if (CONFIG.log) console.warn("[VoiceChat]", ...args); };
const err = (...args) => { if (CONFIG.log) console.error("[VoiceChat]", ...args); };

// ---- Singleton engine holder ----
function getEngine() {
  if (!window.__sanamVoiceEngine) {
    window.__sanamVoiceEngine = {
      initialized: false,
      mounts: 0,
      // SR
      recognition: null,
      listening: false,
      restartTimerId: null,
      currentBackoff: null,
      pausedByVisibility: false,
      // TTS
      synth: null,
      speaking: false,
      utterance: null,
      ttsQueue: [],
      resumeAfterTTS: false,
      // Media
      videoEl: null,
      videoStream: null,
      // Listeners
      listenersBound: false,
      deviceChangeHandler: null,
      visibilityHandler: null,
      // Snapshot
      snapshotVersion: 2,
    };
  }
  return window.__sanamVoiceEngine;
}

function supportsSR() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function scheduleSRRestart() {
  const e = getEngine();
  if (!CONFIG.autoRestartSR || !e.listening || !e.recognition) return;
  const base = e.currentBackoff ?? CONFIG.restart.baseDelay;
  const jitter = 1 + ((Math.random() * 2 - 1) * CONFIG.restart.jitter);
  const delay = Math.min(CONFIG.restart.maxDelay, Math.floor(base * jitter));
  clearTimeout(e.restartTimerId);
  e.restartTimerId = setTimeout(() => {
    try {
      log("SR restarting after", delay, "ms");
      e.recognition.start();
      e.currentBackoff = Math.min(CONFIG.restart.maxDelay, Math.max(CONFIG.restart.baseDelay, base * CONFIG.restart.factor));
    } catch (ex) {
      warn("SR restart failed:", ex?.message);
      // Try again with backoff
      e.currentBackoff = Math.min(CONFIG.restart.maxDelay, Math.max(CONFIG.restart.baseDelay, base * CONFIG.restart.factor));
      scheduleSRRestart();
    }
  }, delay);
}

function bindGlobalGuards() {
  const e = getEngine();
  if (e.listenersBound) return;

  // Page visibility guard (pause/resume SR)
  e.visibilityHandler = () => {
    if (!CONFIG.pauseOnHidden) return;
    try {
      if (document.hidden) {
        if (e.listening) {
          e.pausedByVisibility = true;
          window.voiceChatInstance?.stopListening?.();
          log("SR paused due to page hidden");
        }
      } else if (e.pausedByVisibility) {
        e.pausedByVisibility = false;
        window.voiceChatInstance?.startListening?.();
        log("SR resumed due to page visible");
      }
    } catch {}
  };
  document.addEventListener("visibilitychange", e.visibilityHandler);

  // Device-change guard (if user changes mic/cam devices)
  if (navigator.mediaDevices?.addEventListener) {
    e.deviceChangeHandler = async () => {
      const eng = getEngine();
      // For camera: re-attach stream if previously active but tracks ended
      if (eng.videoStream && eng.videoEl) {
        const active = eng.videoStream.getTracks().some(t => t.readyState === "live");
        if (!active) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            eng.videoStream = stream;
            eng.videoEl.srcObject = stream;
            await eng.videoEl.play?.();
            log("Camera stream refreshed after device change");
          } catch (ex) {
            warn("Camera refresh failed:", ex?.message);
          }
        }
      }
    };
    navigator.mediaDevices.addEventListener("devicechange", e.deviceChangeHandler);
  }

  e.listenersBound = true;
}

function unbindGlobalGuards() {
  const e = getEngine();
  if (!e.listenersBound) return;

  try {
    if (e.visibilityHandler) {
      document.removeEventListener("visibilitychange", e.visibilityHandler);
      e.visibilityHandler = null;
    }
  } catch {}
  try {
    if (navigator.mediaDevices?.removeEventListener && e.deviceChangeHandler) {
      navigator.mediaDevices.removeEventListener("devicechange", e.deviceChangeHandler);
      e.deviceChangeHandler = null;
    }
  } catch {}

  e.listenersBound = false;
}

export default function VoiceChat({ onMessage, onAnalyzeImage, className = "", autoStart = false, onCallStatusChange }) {
  // Keep latest callback
  const latestOnMessageRef = useRef(onMessage);
  useEffect(() => { latestOnMessageRef.current = onMessage; }, [onMessage]);

  const videoRef = useRef(null);

  // Attach/detach video element (no re-init)
  useEffect(() => {
    const eng = getEngine();
    eng.videoEl = videoRef.current;
    if (eng.videoStream && eng.videoEl) {
      try {
        eng.videoEl.srcObject = eng.videoStream;
        eng.videoEl.play?.();
      } catch {}
    }
    return () => { if (eng.videoEl === videoRef.current) eng.videoEl = null; };
  }, []);

  // Init once across all mounts
  useEffect(() => {
    const e = getEngine();
    e.mounts += 1;

    if (!e.initialized) {
      // TTS init
      try {
        e.synth = window.speechSynthesis || null;
        log("Speech synthesis initialized.");
      } catch {
        e.synth = null;
      }

      // SR init
      if (supportsSR()) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = "fa-IR";
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;

        rec.onresult = (event) => {
          try {
            let finalTxt = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              if (res && res.isFinal && res[0] && typeof res[0].transcript === "string") {
                finalTxt += res[0].transcript + " ";
              }
            }
            finalTxt = typeof finalTxt === "string" ? finalTxt.trim() : "";
            if (finalTxt && latestOnMessageRef.current) {
              latestOnMessageRef.current(finalTxt);
            }
          } catch (ex) {
            // Avoid event-loop storms
            warn("SR result handler error:", ex?.message);
          }
        };

        rec.onend = () => {
          // Only restart when still listening and not speaking
          if (e.listening && !e.speaking) {
            scheduleSRRestart();
          }
        };

        rec.onerror = (ev) => {
          // Stop auto-restart for fatal permission errors
          const code = ev?.error || "";
          warn("SR error:", code);
          if (code === "not-allowed" || code === "service-not-allowed") {
            e.listening = false;
            clearTimeout(e.restartTimerId);
          } else {
            // transient errors → handled by restart
            if (e.listening) scheduleSRRestart();
          }
        };

        e.recognition = rec;
      } else {
        warn("SpeechRecognition not supported on this browser.");
      }

      bindGlobalGuards();
      e.initialized = true;
      recordInit(); // added diagnostics
      log("VoiceChat initialized:", { capabilities: { sr: !!e.recognition, tts: !!e.synth }, mode: "speech_recognition" });
    }

    // Expose stable control surface
    if (!window.voiceChatInstance) {
      window.voiceChatInstance = {
        // Status snapshot
        status: () => {
          const e = getEngine();
          return {
            version: e.snapshotVersion,
            listening: e.listening,
            speaking: e.speaking,
            sr_supported: !!e.recognition,
            tts_supported: !!e.synth,
            pausedByVisibility: e.pausedByVisibility,
            backoff: e.currentBackoff,
          };
        },

        // SR controls
        startListening: () => {
          const e = getEngine();
          if (!e.recognition || e.listening) return;
          try {
            e.currentBackoff = CONFIG.restart.baseDelay;
            e.listening = true;
            e.recognition.start();
            onCallStatusChange?.({ type: "listening_started", mode: "speech_recognition" });
          } catch (ex) {
            warn("startListening failed:", ex?.message);
          }
        },
        stopListening: () => {
          const e = getEngine();
          if (!e.recognition) return;
          e.listening = false;
          clearTimeout(e.restartTimerId);
          try {
            e.recognition.stop();
          } catch {}
          onCallStatusChange?.({ type: "listening_stopped" });
        },

        // Camera controls
        startCamera: async () => {
          const e = getEngine();
          if (e.videoStream) {
            if (e.videoEl) {
              try { e.videoEl.srcObject = e.videoStream; await e.videoEl.play?.(); } catch {}
            }
            return;
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            e.videoStream = stream;
            if (e.videoEl) {
              e.videoEl.srcObject = stream;
              await e.videoEl.play?.();
            }
          } catch (ex) {
            warn("startCamera failed:", ex?.message);
          }
        },
        stopCamera: () => {
          const e = getEngine();
          if (e.videoStream) {
            try { e.videoStream.getTracks().forEach((t) => t.stop()); } catch {}
            e.videoStream = null;
            if (e.videoEl) {
              try { e.videoEl.srcObject = null; } catch {}
            }
          }
        },

        // TTS controls with queue + ducking
        startSpeaking: (text) => {
          const e = getEngine();
          if (!e.synth || !text) return;

          const msg = typeof text === "string" ? text : String(text ?? "");
          // Enqueue
          e.ttsQueue.push(msg);
          if (!e.speaking) {
            // If listening and ducking enabled → pause SR then speak
            if (CONFIG.duckTTSWhileListening && e.listening) {
              e.resumeAfterTTS = true;
              window.voiceChatInstance.stopListening();
            }
            speakNextFromQueue();
          }
        },
        stopSpeaking: () => {
          const e = getEngine();
          try { e.synth?.cancel(); } catch {}
          e.speaking = false;
          e.ttsQueue.length = 0;
          if (e.resumeAfterTTS) {
            e.resumeAfterTTS = false;
            window.voiceChatInstance.startListening();
          }
        },

        // Hard stop (all resources)
        stopAll: () => {
          const e = getEngine();
          window.voiceChatInstance.stopSpeaking();
          window.voiceChatInstance.stopListening();
          window.voiceChatInstance.stopCamera();
        },

        // Update runtime options (optional)
        setOptions: (opts = {}) => {
          Object.assign(CONFIG, opts);
        },
      };
    }

    // AutoStart (optional)
    if (autoStart) {
      window.voiceChatInstance.startListening?.();
    }

    // Cleanup only on last unmount
    return () => {
      const e = getEngine();
      e.mounts = Math.max(0, e.mounts - 1);
      if (e.mounts === 0) {
        try { clearTimeout(e.restartTimerId); } catch {}
        try { e.recognition?.stop(); } catch {}
        try { e.synth?.cancel(); } catch {}
        try { e.videoStream?.getTracks().forEach((t) => t.stop()); } catch {}
        e.videoStream = null;
        e.listening = false;
        e.speaking = false;
        e.ttsQueue.length = 0;
        unbindGlobalGuards();
        recordCleanup(); // added diagnostics
        log("VoiceChat cleaned up (last unmount).");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // absolutely no deps → prevents init/cleanup loops

  // Local, hidden video element (for optional camera preview)
  return (
    <div className={className} style={{ display: "contents" }}>
      <video ref={videoRef} muted playsInline className="hidden" />
    </div>
  );
}

// ---- Helpers ----
function speakNextFromQueue() {
  const e = getEngine();
  if (!e.synth) return;
  const next = e.ttsQueue.shift();
  if (!next) {
    // Resume SR if ducked
    if (e.resumeAfterTTS) {
      e.resumeAfterTTS = false;
      window.voiceChatInstance.startListening();
    }
    return;
  }
  try {
    const utt = new SpeechSynthesisUtterance(next);
    utt.lang = "fa-IR";
    utt.onend = () => {
      e.speaking = false;
      speakNextFromQueue();
    };
    utt.onerror = () => {
      e.speaking = false;
      speakNextFromQueue();
    };
    e.utterance = utt;
    e.speaking = true;
    e.synth.speak(utt);
  } catch (ex) {
    err("TTS failed:", ex?.message);
    e.speaking = false;
  }
}
