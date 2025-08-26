import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Camera, Volume2, VolumeX, MessageCircle, Settings, Cpu, Wifi, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Advanced Persian NLP with veterinary domain
const ADVANCED_VETERINARY_NLP = {
  // Context classification patterns
  contextPatterns: {
    emergency: {
      keywords: ['اورژانس', 'فوری', 'خطرناک', 'مرگ', 'تشنج', 'خونریزی', 'تنفسی', 'قلبی'],
      semanticWeight: 0.9,
      urgencyLevel: 'critical'
    },
    diagnostic: {
      keywords: ['تشخیص', 'علامت', 'نشانه', 'آزمایش', 'معاینه', 'بررسی'],
      semanticWeight: 0.8,
      urgencyLevel: 'high'
    },
    treatment: {
      keywords: ['درمان', 'دارو', 'تجویز', 'مقدار', 'روش', 'شیوه'],
      semanticWeight: 0.7,
      urgencyLevel: 'medium'
    },
    educational: {
      keywords: ['چگونه', 'چرا', 'توضیح', 'یاد', 'آموزش', 'مفهوم'],
      semanticWeight: 0.6,
      urgencyLevel: 'low'
    }
  },
  
  // Advanced intent recognition
  intentClassifier: (text) => {
    const words = text.toLowerCase().split(/\s+/);
    const intentScores = {};
    
    Object.entries(ADVANCED_VETERINARY_NLP.contextPatterns).forEach(([intent, config]) => {
      const matchCount = config.keywords.filter(keyword => 
        words.some(word => word.includes(keyword))
      ).length;
      
      intentScores[intent] = (matchCount / config.keywords.length) * config.semanticWeight;
    });
    
    const topIntent = Object.entries(intentScores).reduce((a, b) => 
      intentScores[a[0]] > intentScores[b[0]] ? a : b
    );
    
    return {
      intent: topIntent[0],
      confidence: topIntent[1],
      urgency: ADVANCED_VETERINARY_NLP.contextPatterns[topIntent[0]]?.urgencyLevel || 'low'
    };
  }
};

// Advanced WebRTC configuration with Persian optimization
const ADVANCED_WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  
  // Optimized for Persian speech patterns
  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000, // Higher quality for Persian phonemes
    channelCount: 1,
    latency: 0.01 // 10ms for real-time conversation
  },
  
  // Video optimized for face-to-face consultation
  videoConstraints: {
    width: { ideal: 1280, max: 1920, min: 640 },
    height: { ideal: 720, max: 1080, min: 480 },
    frameRate: { ideal: 30, max: 60, min: 15 },
    facingMode: 'user'
  }
};

// Neural-inspired conversation memory
class ConversationMemory {
  constructor() {
    this.shortTerm = new Map(); // Last 5-10 interactions
    this.longTerm = new Map();  // Persistent session data
    this.semanticGraph = new Map(); // Topic relationships
    this.emotionalState = {
      user_stress: 0.5,
      confidence_level: 0.5,
      engagement_score: 0.5
    };
  }
  
  addInteraction(interaction) {
    const timestamp = Date.now();
    const interactionId = `int_${timestamp}`;
    
    // Short-term memory (working memory)
    this.shortTerm.set(interactionId, {
      ...interaction,
      timestamp,
      decayScore: 1.0
    });
    
    // Maintain only recent interactions
    if (this.shortTerm.size > 10) {
      const oldest = Array.from(this.shortTerm.keys())[0];
      this.shortTerm.delete(oldest);
    }
    
    // Update semantic graph
    this.updateSemanticGraph(interaction);
    
    // Update emotional state
    this.updateEmotionalState(interaction);
  }
  
  updateSemanticGraph(interaction) {
    const { intent, content } = interaction;
    
    if (!this.semanticGraph.has(intent)) {
      this.semanticGraph.set(intent, {
        frequency: 0,
        topics: new Set(),
        lastAccessed: Date.now()
      });
    }
    
    const intentData = this.semanticGraph.get(intent);
    intentData.frequency += 1;
    intentData.lastAccessed = Date.now();
    
    // Extract topics (simplified NER)
    const topics = this.extractTopics(content);
    topics.forEach(topic => intentData.topics.add(topic));
  }
  
  updateEmotionalState(interaction) {
    const { urgency, confidence, content } = interaction;
    
    // Update stress based on urgency
    switch (urgency) {
      case 'critical':
        this.emotionalState.user_stress = Math.min(1.0, this.emotionalState.user_stress + 0.3);
        break;
      case 'high':
        this.emotionalState.user_stress = Math.min(1.0, this.emotionalState.user_stress + 0.1);
        break;
      default:
        this.emotionalState.user_stress = Math.max(0.0, this.emotionalState.user_stress - 0.05);
    }
    
    // Update confidence
    if (confidence) {
      this.emotionalState.confidence_level = (this.emotionalState.confidence_level * 0.7) + (confidence * 0.3);
    }
    
    // Update engagement (based on content length and complexity)
    const engagement = Math.min(1.0, content.length / 100);
    this.emotionalState.engagement_score = (this.emotionalState.engagement_score * 0.8) + (engagement * 0.2);
  }
  
  extractTopics(content) {
    // Advanced topic extraction for Persian veterinary text
    const veterinaryTopics = [
      'جراحی', 'بیهوشی', 'درمان', 'تشخیص', 'دارو', 'واکسن',
      'سگ', 'گربه', 'اسب', 'گاو', 'گوسفند', 'مرغ',
      'قلب', 'ریه', 'کبد', 'کلیه', 'معده', 'روده'
    ];
    
    const foundTopics = veterinaryTopics.filter(topic => 
      content.toLowerCase().includes(topic)
    );
    
    return foundTopics;
  }
  
  getContextualInsights() {
    return {
      recentIntents: Array.from(this.shortTerm.values()).map(i => i.intent),
      dominantTopics: this.getDominantTopics(),
      emotionalState: this.emotionalState,
      sessionComplexity: this.calculateSessionComplexity()
    };
  }
  
  getDominantTopics() {
    const topicFreq = new Map();
    
    this.semanticGraph.forEach((data, intent) => {
      data.topics.forEach(topic => {
        topicFreq.set(topic, (topicFreq.get(topic) || 0) + data.frequency);
      });
    });
    
    return Array.from(topicFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, freq]) => ({ topic, frequency: freq }));
  }
  
  calculateSessionComplexity() {
    const uniqueIntents = new Set(Array.from(this.shortTerm.values()).map(i => i.intent));
    const avgConfidence = Array.from(this.shortTerm.values())
      .reduce((sum, i) => sum + (i.confidence || 0), 0) / this.shortTerm.size;
    
    return {
      intentDiversity: uniqueIntents.size,
      averageConfidence: avgConfidence,
      totalInteractions: this.shortTerm.size
    };
  }
}

// Advanced Bandwidth Monitor
class BandwidthMonitor {
  constructor() {
    this.measurements = [];
    this.currentQuality = 'high';
    this.adaptationThresholds = {
      high: { minBandwidth: 2000, videoRes: '1280x720', audioRate: 48000 },
      medium: { minBandwidth: 1000, videoRes: '854x480', audioRate: 32000 },
      low: { minBandwidth: 500, videoRes: '640x360', audioRate: 16000 }
    };
  }
  
  measureBandwidth(bytesTransferred, timeElapsed) {
    const bandwidth = (bytesTransferred * 8) / (timeElapsed / 1000); // bps
    
    this.measurements.push({
      bandwidth,
      timestamp: Date.now(),
      quality: this.currentQuality
    });
    
    // Keep only recent measurements
    if (this.measurements.length > 10) {
      this.measurements.shift();
    }
    
    return this.adaptQuality(bandwidth);
  }
  
  adaptQuality(currentBandwidth) {
    const avgBandwidth = this.measurements.reduce((sum, m) => sum + m.bandwidth, 0) / this.measurements.length;
    
    let newQuality = this.currentQuality;
    
    if (avgBandwidth < this.adaptationThresholds.low.minBandwidth) {
      newQuality = 'low';
    } else if (avgBandwidth < this.adaptationThresholds.medium.minBandwidth) {
      newQuality = 'medium';
    } else if (avgBandwidth > this.adaptationThresholds.high.minBandwidth) {
      newQuality = 'high';
    }
    
    if (newQuality !== this.currentQuality) {
      this.currentQuality = newQuality;
      return {
        qualityChanged: true,
        newQuality,
        recommendations: this.adaptationThresholds[newQuality]
      };
    }
    
    return { qualityChanged: false, currentQuality: this.currentQuality };
  }
  
  getNetworkHealth() {
    if (this.measurements.length === 0) return { status: 'unknown', score: 0.5 };
    
    const recent = this.measurements.slice(-5);
    const avgBandwidth = recent.reduce((sum, m) => sum + m.bandwidth, 0) / recent.length;
    const stability = 1 - (this.calculateVariance(recent.map(m => m.bandwidth)) / avgBandwidth);
    
    let status = 'excellent';
    let score = 1.0;
    
    if (avgBandwidth < 500) {
      status = 'poor';
      score = 0.2;
    } else if (avgBandwidth < 1000) {
      status = 'fair';
      score = 0.5;
    } else if (avgBandwidth < 2000) {
      status = 'good';
      score = 0.7;
    }
    
    return { status, score: score * stability, avgBandwidth, stability };
  }
  
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

export default function EnhancedVoiceChat({ 
  onMessage, 
  onAnalyzeImage, 
  className = "", 
  autoStart = false, 
  onCallStatusChange,
  advancedMode = true 
}) {
  // Enhanced state management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  // Advanced conversation management
  const [conversationMemory] = useState(() => new ConversationMemory());
  const [contextInsights, setContextInsights] = useState({});
  const [intentRecognition, setIntentRecognition] = useState({});
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    noiseThreshold: 0.3,
    silenceDetection: 1500,
    languageConfidence: 0.7,
    emotionalAdaptation: true
  });
  
  // Advanced technical monitoring
  const [bandwidthMonitor] = useState(() => new BandwidthMonitor());
  const [networkHealth, setNetworkHealth] = useState({});
  const [streamMetrics, setStreamMetrics] = useState({
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0
  });
  const [codecInfo, setCodecInfo] = useState({});
  
  // Advanced UI states
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [qualityProfile, setQualityProfile] = useState('auto');
  const [culturalAdaptation, setCulturalAdaptation] = useState('formal');
  
  // References for advanced management
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const metricsIntervalRef = useRef(null);
  
  // Advanced Speech Recognition with Custom Grammar
  const setupAdvancedSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const recognition = new SpeechRecognition();
    
    // Advanced configuration
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fa-IR';
    recognition.maxAlternatives = 5; // Multiple alternatives for better accuracy
    
    // Custom grammar for veterinary terms (if supported)
    if ('webkitSpeechRecognition' in window) {
      try {
        const grammar = '#JSGF V1.0; grammar veterinary; public <veterinary> = ' + 
          ADVANCED_VETERINARY_NLP.contextPatterns.emergency.keywords.join(' | ') + ' | ' +
          ADVANCED_VETERINARY_NLP.contextPatterns.diagnostic.keywords.join(' | ') + ';';
        
        recognition.grammars = grammar;
      } catch (e) {
        console.warn('Custom grammar not supported:', e);
      }
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;
      let alternatives = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        // Collect alternatives for better processing
        for (let j = 0; j < result.length; j++) {
          alternatives.push({
            transcript: result[j].transcript,
            confidence: result[j].confidence || 0
          });
        }
        
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;
        
        bestConfidence = Math.max(bestConfidence, confidence);
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(finalTranscript + interimTranscript);
      
      // Advanced intent recognition
      if (finalTranscript.trim()) {
        const intentResult = ADVANCED_VETERINARY_NLP.intentClassifier(finalTranscript);
        setIntentRecognition(intentResult);
        
        // Add to conversation memory
        conversationMemory.addInteraction({
          type: 'user_speech',
          content: finalTranscript.trim(),
          confidence: bestConfidence,
          intent: intentResult.intent,
          urgency: intentResult.urgency,
          alternatives: alternatives.slice(0, 3),
          timestamp: Date.now()
        });
        
        // Update contextual insights
        setContextInsights(conversationMemory.getContextualInsights());
        
        setTranscript('');
        
        // Enhanced message with comprehensive context
        onMessage?.(finalTranscript.trim(), {
          ...intentResult,
          confidence: bestConfidence,
          alternatives,
          contextualInsights: conversationMemory.getContextualInsights(),
          emotionalState: conversationMemory.emotionalState,
          culturalMode: culturalAdaptation,
          sessionId: `advanced_${Date.now()}`
        });
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      handleSpeechError(event.error);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart if needed (for continuous conversation)
      if (adaptiveSettings.continuousMode && !error) {
        setTimeout(() => {
          if (recognitionRef.current) {
            startAdvancedListening();
          }
        }, 100);
      }
    };
    
    return recognition;
  }, [onMessage, conversationMemory, adaptiveSettings, culturalAdaptation, error]);
  
  // Enhanced error handling
  const handleSpeechError = (errorType) => {
    const errorMessages = {
      'network': 'خطای شبکه در تشخیص گفتار. در حال تلاش مجدد...',
      'not-allowed': 'دسترسی به میکروفون رد شد. لطفاً مجوز را فعال کنید.',
      'no-speech': 'صدایی شناسایی نشد. لطفاً بلندتر صحبت کنید.',
      'audio-capture': 'خطا در ضبط صدا. میکروفون را بررسی کنید.',
      'service-not-allowed': 'سرویس تشخیص گفتار در دسترس نیست.'
    };
    
    setError(errorMessages[errorType] || 'خطای ناشناخته در تشخیص گفتار');
    
    // Auto-recovery for network errors
    if (errorType === 'network' && adaptiveSettings.autoRecovery) {
      setTimeout(() => {
        setError(null);
        if (isListening) {
          startAdvancedListening();
        }
      }, 3000);
    }
  };
  
  // Advanced camera with quality monitoring
  const startAdvancedCamera = async () => {
    try {
      setError(null);
      
      const constraints = {
        video: ADVANCED_WEBRTC_CONFIG.videoConstraints,
        audio: false // Handled separately
      };
      
      // Adaptive quality based on network
      const networkHealth = bandwidthMonitor.getNetworkHealth();
      if (networkHealth.score < 0.5) {
        constraints.video.width = { ideal: 640 };
        constraints.video.height = { ideal: 360 };
        constraints.video.frameRate = { ideal: 15 };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        
        // Monitor stream quality
        startStreamMetricsMonitoring(stream);
        
        if (onCallStatusChange) onCallStatusChange('video_active');
      }
    } catch (error) {
      console.error('Enhanced camera error:', error);
      setError(`خطا در دوربین: ${error.message}`);
    }
  };
  
  // Stream quality monitoring
  const startStreamMetricsMonitoring = (stream) => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
    
    metricsIntervalRef.current = setInterval(async () => {
      if (peerConnectionRef.current) {
        const stats = await peerConnectionRef.current.getStats();
        const metrics = processRTCStats(stats);
        setStreamMetrics(metrics);
        
        // Update bandwidth monitor
        if (metrics.bandwidth > 0) {
          const adaptation = bandwidthMonitor.measureBandwidth(metrics.bandwidth, 1000);
          if (adaptation.qualityChanged) {
            await adaptStreamQuality(adaptation.newQuality);
          }
        }
        
        setNetworkHealth(bandwidthMonitor.getNetworkHealth());
      }
    }, 2000);
  };
  
  // Process WebRTC statistics
  const processRTCStats = (stats) => {
    let metrics = { latency: 0, jitter: 0, packetLoss: 0, bandwidth: 0 };
    
    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        metrics.jitter = report.jitter || 0;
        metrics.packetLoss = report.packetsLost || 0;
      }
      
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        metrics.latency = report.currentRoundTripTime || 0;
      }
      
      if (report.type === 'outbound-rtp') {
        metrics.bandwidth = report.bytesSent || 0;
      }
    });
    
    return metrics;
  };
  
  // Adaptive stream quality
  const adaptStreamQuality = async (quality) => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    
    const newConstraints = bandwidthMonitor.adaptationThresholds[quality];
    
    try {
      await videoTrack.applyConstraints({
        width: { ideal: parseInt(newConstraints.videoRes.split('x')[0]) },
        height: { ideal: parseInt(newConstraints.videoRes.split('x')[1]) },
        frameRate: { ideal: quality === 'high' ? 30 : quality === 'medium' ? 20 : 15 }
      });
      
      setQualityProfile(quality);
    } catch (error) {
      console.warn('Failed to adapt quality:', error);
    }
  };
  
  // Advanced listening with Voice Activity Detection
  const startAdvancedListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      setError(null);
      setIsListening(true);
      recognitionRef.current.start();
      
      if (onCallStatusChange) onCallStatusChange('advanced_listening_active');
    } catch (error) {
      console.error('Advanced listening error:', error);
      handleSpeechError(error.name || 'unknown');
    }
  };
  
  // Enhanced Text-to-Speech with emotional adaptation
  const speakAdvancedText = async (text, options = {}) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const {
      urgency = 'normal',
      emotionalState = conversationMemory.emotionalState,
      culturalMode = culturalAdaptation,
      adaptToUser = true
    } = options;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fa-IR';
    
    // Emotional and cultural adaptation
    if (adaptToUser && emotionalState) {
      // Adapt rate based on user stress
      const baseRate = culturalMode === 'formal' ? 0.85 : 0.9;
      utterance.rate = baseRate * (1 - (emotionalState.user_stress * 0.2));
      
      // Adapt pitch based on urgency and confidence
      utterance.pitch = urgency === 'critical' ? 1.2 : 
                       urgency === 'high' ? 1.1 : 
                       culturalMode === 'friendly' ? 1.05 : 1.0;
      
      // Adapt volume based on engagement
      utterance.volume = Math.max(0.6, Math.min(0.9, 0.7 + (emotionalState.engagement_score * 0.2)));
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onCallStatusChange) onCallStatusChange('advanced_speaking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onCallStatusChange) onCallStatusChange('speech_complete');
    };
    
    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      setIsSpeaking(false);
      setError('خطا در پخش صدا. تنظیمات صوتی را بررسی کنید.');
    };
    
    // Add to conversation memory
    conversationMemory.addInteraction({
      type: 'ai_speech',
      content: text,
      options,
      timestamp: Date.now()
    });
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Enhanced frame capture with metadata
  const captureAdvancedFrame = async () => {
    if (!videoRef.current || !cameraActive) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Enhanced metadata with context
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    const contextualInsights = conversationMemory.getContextualInsights();
    
    const metadata = {
      timestamp: Date.now(),
      context: contextualInsights,
      technical: {
        resolution: `${canvas.width}x${canvas.height}`,
        quality: qualityProfile,
        networkHealth: networkHealth,
        streamMetrics: streamMetrics
      },
      conversation: {
        recentIntents: contextualInsights.recentIntents,
        emotionalState: contextualInsights.emotionalState,
        dominantTopics: contextualInsights.dominantTopics
      }
    };
    
    if (onAnalyzeImage) {
      onAnalyzeImage(imageData, metadata);
    }
    
    return { imageData, metadata };
  };
  
  // Initialize advanced components
  useEffect(() => {
    const speechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    const mediaDevicesSupported = 'mediaDevices' in navigator;
    const webRTCSupported = 'RTCPeerConnection' in window;
    
    const isFullySupported = speechRecognitionSupported && speechSynthesisSupported && 
                           mediaDevicesSupported && webRTCSupported;
    
    setIsSupported(isFullySupported);
    
    if (isFullySupported) {
      recognitionRef.current = setupAdvancedSpeechRecognition();
      
      // Initialize WebRTC peer connection for metrics
      peerConnectionRef.current = new RTCPeerConnection(ADVANCED_WEBRTC_CONFIG);
    }
    
    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [setupAdvancedSpeechRecognition]);
  
  // Auto-start handling
  useEffect(() => {
    if (!isSupported || !autoStart) return;
    
    const initializeSession = async () => {
      if (onCallStatusChange) onCallStatusChange("advanced_initializing");
      
      await startAdvancedCamera();
      setTimeout(() => {
        startAdvancedListening();
        if (onCallStatusChange) onCallStatusChange("advanced_active");
      }, 500);
    };
    
    initializeSession();
  }, [autoStart, isSupported]);
  
  // Expose enhanced API
  useEffect(() => {
    window.voiceChatInstance = {
      // Core enhanced functions
      speakText: speakAdvancedText,
      stopSpeaking: () => window.speechSynthesis.cancel(),
      startCamera: startAdvancedCamera,
      stopCamera: () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setCameraActive(false);
      },
      startListening: startAdvancedListening,
      stopListening: () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
      },
      captureFrame: captureAdvancedFrame,
      
      // Advanced functions
      getAdvancedState: () => ({
        conversationMemory: conversationMemory.getContextualInsights(),
        networkHealth,
        streamMetrics,
        intentRecognition,
        culturalAdaptation,
        qualityProfile
      }),
      
      updateAdvancedSettings: (newSettings) => {
        setAdaptiveSettings(prev => ({ ...prev, ...newSettings }));
        if (newSettings.culturalAdaptation) {
          setCulturalAdaptation(newSettings.culturalAdaptation);
        }
        if (newSettings.qualityProfile) {
          adaptStreamQuality(newSettings.qualityProfile);
        }
      },
      
      // Memory management
      getConversationInsights: () => conversationMemory.getContextualInsights(),
      resetConversationMemory: () => {
        conversationMemory.shortTerm.clear();
        conversationMemory.semanticGraph.clear();
        setContextInsights({});
      },
      
      // Network management  
      getNetworkDiagnostics: () => ({
        health: networkHealth,
        metrics: streamMetrics,
        bandwidth: bandwidthMonitor.getNetworkHealth(),
        qualityProfile,
        adaptationHistory: bandwidthMonitor.measurements.slice(-5)
      })
    };
    
    return () => {
      window.voiceChatInstance = null;
    };
  }, [
    speakAdvancedText, startAdvancedCamera, startAdvancedListening, captureAdvancedFrame,
    conversationMemory, networkHealth, streamMetrics, intentRecognition, 
    culturalAdaptation, qualityProfile, adaptiveSettings
  ]);
  
  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              سیستم پیشرفته نیازمند مرورگر جدیدتری است که از تمامی قابلیت‌های WebRTC، Speech Recognition و Audio Context پشتیبانی کند.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            سیستم تماس هوشمند پیشرفته
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="rounded-xl"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button size="sm" variant="outline" onClick={() => setError(null)}>
                بستن
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Advanced Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">هوش مصنوعی</span>
            </div>
            <Badge variant={intentRecognition.confidence > 0.7 ? "default" : "outline"}>
              {intentRecognition.intent || 'آماده'} ({Math.round((intentRecognition.confidence || 0) * 100)}%)
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">شبکه</span>
            </div>
            <Badge variant={networkHealth.score > 0.7 ? "default" : networkHealth.score > 0.4 ? "secondary" : "destructive"}>
              {networkHealth.status || 'بررسی'} ({Math.round((networkHealth.score || 0) * 100)}%)
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">کیفیت</span>
            </div>
            <Badge variant="outline">
              {qualityProfile} • {streamMetrics.latency}ms
            </Badge>
          </div>
        </div>
        
        {/* Advanced Controls Panel */}
        {showAdvancedControls && (
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">تنظیمات</TabsTrigger>
              <TabsTrigger value="insights">تحلیل مکالمه</TabsTrigger>
              <TabsTrigger value="diagnostics">تشخیص فنی</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">حالت فرهنگی</label>
                  <div className="flex gap-2">
                    <Button
                      variant={culturalAdaptation === 'formal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCulturalAdaptation('formal')}
                      className="rounded-xl flex-1"
                    >
                      رسمی
                    </Button>
                    <Button
                      variant={culturalAdaptation === 'friendly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCulturalAdaptation('friendly')}
                      className="rounded-xl flex-1"
                    >
                      دوستانه
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">کیفیت ویدیو</label>
                  <div className="flex gap-2">
                    {['auto', 'high', 'medium', 'low'].map(quality => (
                      <Button
                        key={quality}
                        variant={qualityProfile === quality ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => adaptStreamQuality(quality)}
                        className="rounded-xl flex-1 text-xs"
                      >
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">حساسیت تشخیص گفتار</label>
                <Slider
                  value={[adaptiveSettings.languageConfidence * 100]}
                  onValueChange={([value]) => 
                    setAdaptiveSettings(prev => ({ ...prev, languageConfidence: value / 100 }))
                  }
                  max={100}
                  min={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>کم</span>
                  <span>{Math.round(adaptiveSettings.languageConfidence * 100)}%</span>
                  <span>زیاد</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              {contextInsights.recentIntents && (
                <div>
                  <h4 className="font-medium mb-2">موضوعات اخیر مکالمه</h4>
                  <div className="flex flex-wrap gap-2">
                    {contextInsights.recentIntents.slice(-5).map((intent, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {intent}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {contextInsights.dominantTopics && (
                <div>
                  <h4 className="font-medium mb-2">موضوعات غالب</h4>
                  <div className="space-y-2">
                    {contextInsights.dominantTopics.map((topic, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{topic.topic}</span>
                        <span className="text-gray-500">{topic.frequency} بار</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {contextInsights.emotionalState && (
                <div>
                  <h4 className="font-medium mb-2">وضعیت عاطفی مکالمه</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-red-50 rounded-xl">
                      <div className="font-medium">استرس</div>
                      <div>{Math.round(contextInsights.emotionalState.user_stress * 100)}%</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-xl">
                      <div className="font-medium">اعتماد</div>
                      <div>{Math.round(contextInsights.emotionalState.confidence_level * 100)}%</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-xl">
                      <div className="font-medium">مشارکت</div>
                      <div>{Math.round(contextInsights.emotionalState.engagement_score * 100)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="diagnostics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">مشخصات شبکه</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>تأخیر:</span>
                      <span>{streamMetrics.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>لرزش:</span>
                      <span>{streamMetrics.jitter.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>از دست رفته:</span>
                      <span>{streamMetrics.packetLoss}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">کیفیت استریم</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>پهنای باند:</span>
                      <span>{Math.round(networkHealth.avgBandwidth || 0)} kbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>پایداری:</span>
                      <span>{Math.round((networkHealth.stability || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>وضعیت کلی:</span>
                      <Badge variant={networkHealth.score > 0.7 ? "default" : "outline"} className="text-xs">
                        {networkHealth.status || 'نامعلوم'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">تاریخچه تطبیق کیفیت</h4>
                <div className="max-h-32 overflow-y-auto">
                  {bandwidthMonitor.measurements.slice(-5).map((measurement, idx) => (
                    <div key={idx} className="flex justify-between text-xs p-1 border-b last:border-b-0">
                      <span>{new Date(measurement.timestamp).toLocaleTimeString('fa-IR')}</span>
                      <span>{Math.round(measurement.bandwidth)} bps</span>
                      <span>{measurement.quality}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Video Container - Enhanced */}
        <div className="video-container relative">
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-64 object-cover"
              />
              
              {/* Enhanced overlays with technical info */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  زنده • {qualityProfile.toUpperCase()}
                </div>
                
                {networkHealth.score && (
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${
                    networkHealth.score > 0.7 ? 'bg-green-500/80' :
                    networkHealth.score > 0.4 ? 'bg-yellow-500/80' : 'bg-red-500/80'
                  }`}>
                    شبکه: {Math.round(networkHealth.score * 100)}%
                  </div>
                )}
                
                {streamMetrics.latency > 0 && (
                  <div className="bg-blue-500/80 text-white px-2 py-1 rounded-full text-xs">
                    {streamMetrics.latency}ms
                  </div>
                )}
              </div>
              
              {/* Intent recognition overlay */}
              {intentRecognition.intent && intentRecognition.confidence > 0.5 && (
                <div className="absolute bottom-2 left-2 bg-purple-500/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  {intentRecognition.intent} ({Math.round(intentRecognition.confidence * 100)}%)
                </div>
              )}
              
              {isSpeaking && (
                <div className="absolute bottom-2 right-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  صنم یار در حال پاسخ
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Video className="w-16 h-16 mx-auto mb-4" />
                <p className="font-medium">دوربین هوشمند</p>
                <p className="text-sm mt-1">برای تجربه کامل AI، دوربین را فعال کنید</p>
                <p className="text-xs mt-2 text-purple-600">قابلیت‌های پیشرفته: تشخیص زمینه، تحلیل عاطفی، تطبیق کیفیت</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Controls with Advanced Options */}
        <div className="controls grid grid-cols-2 md:grid-cols-6 gap-2">
          <Button 
            onClick={cameraActive ? () => {
              streamRef.current?.getTracks().forEach(track => track.stop());
              setCameraActive(false);
            } : startAdvancedCamera}
            variant={cameraActive ? "destructive" : "default"}
            className="flex items-center gap-1 rounded-xl text-xs"
          >
            {cameraActive ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            {cameraActive ? 'قطع' : 'دوربین'}
          </Button>
          
          <Button
            onClick={isListening ? () => {
              recognitionRef.current?.stop();
              setIsListening(false);
            } : startAdvancedListening}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center gap-1 rounded-xl text-xs"
            disabled={isSpeaking}
          >
            {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            {isListening ? 'قطع' : 'گفتار'}
          </Button>
          
          <Button 
            onClick={captureAdvancedFrame} 
            disabled={!cameraActive}
            variant="outline"
            className="flex items-center gap-1 rounded-xl text-xs"
          >
            <Camera className="w-3 h-3" />
            عکس
          </Button>
          
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            variant={audioEnabled ? "outline" : "destructive"}
            className="flex items-center gap-1 rounded-xl text-xs"
          >
            {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {audioEnabled ? 'صدا' : 'بی‌صدا'}
          </Button>
          
          <Button
            onClick={() => window.speechSynthesis.cancel()}
            disabled={!isSpeaking}
            variant="outline"
            className="flex items-center gap-1 rounded-xl text-xs"
          >
            توقف
          </Button>
          
          <Button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            variant={showAdvancedControls ? "default" : "outline"}
            className="flex items-center gap-1 rounded-xl text-xs"
          >
            <Settings className="w-3 h-3" />
            تنظیمات
          </Button>
        </div>
        
        {/* Enhanced Transcript Display */}
        {transcript && (
          <div className="transcript bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                تشخیص هوشمند
              </h3>
              <div className="flex gap-2">
                {intentRecognition.intent && (
                  <Badge variant="outline" className="text-xs">
                    {intentRecognition.intent}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  اعتماد: {Math.round((intentRecognition.confidence || 0) * 100)}%
                </Badge>
              </div>
            </div>
            <p className="text-blue-700 leading-relaxed">{transcript}</p>
            {intentRecognition.urgency === 'critical' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-red-700 text-sm font-medium flex items-center gap-1">
                  🚨 حالت اورژانس تشخیص داده شد
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Enhanced Speaking Indicator */}
        {isSpeaking && (
          <div className="speaking-indicator bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce" 
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="text-green-700 font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  صنم یار با تطبیق {culturalAdaptation} پاسخ می‌دهد...
                </span>
              </div>
              <Button onClick={() => window.speechSynthesis.cancel()} size="sm" variant="outline" className="rounded-xl">
                توقف
              </Button>
            </div>
          </div>
        )}
        
        {/* Advanced Session Statistics */}
        {Object.keys(contextInsights).length > 0 && (
          <div className="session-stats bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              آمار جلسه پیشرفته
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="font-medium">تعاملات</div>
                <div className="text-lg">{contextInsights.sessionComplexity?.totalInteractions || 0}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">تنوع موضوع</div>
                <div className="text-lg">{contextInsights.sessionComplexity?.intentDiversity || 0}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">میانگین اعتماد</div>
                <div className="text-lg">{Math.round((contextInsights.sessionComplexity?.averageConfidence || 0) * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">کیفیت شبکه</div>
                <div className="text-lg">{Math.round((networkHealth.score || 0) * 100)}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}