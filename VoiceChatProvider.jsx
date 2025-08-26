import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import EnhancedVoiceChat from "@/components/shared/EnhancedVoiceChat";

// Voice Chat Context
const VoiceChatContext = createContext(null);

// OPTIMIZED VOICE CHAT PROVIDER
export default function VoiceChatProvider({ children }) {
    const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
    const [voiceChatConfig, setVoiceChatConfig] = useState({
        autoStart: false,
        quality: 'balanced', // 'low', 'balanced', 'high'
        enableVideo: false,
        enableTranscription: true,
        adaptiveQuality: true
    });
    
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [performanceMode, setPerformanceMode] = useState('normal');
    
    const mountCountRef = useRef(0);
    const performanceMonitorRef = useRef(null);

    // Performance-aware configuration
    const adaptConfigForPerformance = useCallback((performanceLevel) => {
        const configs = {
            emergency: {
                quality: 'low',
                enableVideo: false,
                enableTranscription: false,
                adaptiveQuality: false,
                autoStart: false
            },
            degraded: {
                quality: 'low', 
                enableVideo: false,
                enableTranscription: true,
                adaptiveQuality: true,
                autoStart: false
            },
            normal: {
                quality: 'balanced',
                enableVideo: false,
                enableTranscription: true,
                adaptiveQuality: true,
                autoStart: false
            },
            high: {
                quality: 'high',
                enableVideo: true,
                enableTranscription: true,
                adaptiveQuality: true,
                autoStart: false
            }
        };

        const newConfig = configs[performanceLevel] || configs.normal;
        setVoiceChatConfig(prev => ({ ...prev, ...newConfig }));
        setPerformanceMode(performanceLevel);
    }, []);

    // Monitor performance and adapt
    useEffect(() => {
        const checkPerformance = () => {
            if (performance.memory) {
                const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
                
                if (memoryUsage > 90) {
                    adaptConfigForPerformance('emergency');
                } else if (memoryUsage > 75) {
                    adaptConfigForPerformance('degraded');
                } else if (memoryUsage < 50) {
                    adaptConfigForPerformance('normal');
                }
            }
        };

        performanceMonitorRef.current = setInterval(checkPerformance, 5000);
        
        return () => {
            if (performanceMonitorRef.current) {
                clearInterval(performanceMonitorRef.current);
            }
        };
    }, [adaptConfigForPerformance]);

    // Prevent multiple voice chat instances
    useEffect(() => {
        mountCountRef.current++;
        
        if (mountCountRef.current > 1) {
            console.warn('🎙️ Multiple VoiceChatProvider instances detected. Using singleton pattern.');
        }

        return () => {
            mountCountRef.current--;
        };
    }, []);

    const openVoiceChat = useCallback((config = {}) => {
        setVoiceChatConfig(prev => ({ ...prev, ...config }));
        setIsVoiceChatOpen(true);
    }, []);

    const closeVoiceChat = useCallback(() => {
        setIsVoiceChatOpen(false);
        setConnectionStatus('disconnected');
    }, []);

    const updateConnectionStatus = useCallback((status) => {
        setConnectionStatus(status);
    }, []);

    // Context value
    const contextValue = {
        isVoiceChatOpen,
        voiceChatConfig,
        connectionStatus,
        performanceMode,
        openVoiceChat,
        closeVoiceChat,
        updateConnectionStatus,
        adaptConfigForPerformance
    };

    return (
        <VoiceChatContext.Provider value={contextValue}>
            {children}
            {isVoiceChatOpen && (
                <EnhancedVoiceChat
                    isOpen={isVoiceChatOpen}
                    onClose={closeVoiceChat}
                    config={voiceChatConfig}
                    onConnectionStatusChange={updateConnectionStatus}
                    performanceMode={performanceMode}
                />
            )}
        </VoiceChatContext.Provider>
    );
}

// Hook to use voice chat
export const useVoiceChat = () => {
    const context = useContext(VoiceChatContext);
    if (!context) {
        throw new Error('useVoiceChat must be used within a VoiceChatProvider');
    }
    return context;
};