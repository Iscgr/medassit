import React, { useState, useEffect, useRef, useCallback } from "react";

// ADVANCED PERFORMANCE GUARD SYSTEM
export default function PerfGuard({ 
    children, 
    onDegrade, 
    onRestore, 
    checkIntervalMs = 1000,
    thresholdMs = 300,
    windowSize = 5,
    enableAutoOptimization = true,
    showDebugInfo = false // Add prop to control debug display
}) {
    const [isDegraded, setIsDegraded] = useState(false);
    const [currentPerformance, setCurrentPerformance] = useState({
        fps: 60,
        memoryUsage: 0,
        cpuUsage: 0,
        renderTime: 0,
        isOptimized: false
    });

    const performanceBuffer = useRef([]);
    const intervalRef = useRef(null);
    const lastFrameTime = useRef(performance.now());
    const frameCount = useRef(0);
    const optimizationLevel = useRef(0);

    // Performance monitoring metrics
    const metrics = useRef({
        frameDrops: 0,
        totalFrames: 0,
        averageFrameTime: 0,
        memoryLeaks: 0,
        gcPressure: 0,
        domUpdates: 0,
        eventListeners: 0
    });

    // Advanced optimization strategies
    const optimizationStrategies = [
        {
            level: 1,
            name: 'Basic Optimization',
            actions: ['reduce_animations', 'defer_non_critical'],
            threshold: 250
        },
        {
            level: 2, 
            name: 'Moderate Optimization',
            actions: ['disable_shadows', 'reduce_quality', 'batch_updates'],
            threshold: 400
        },
        {
            level: 3,
            name: 'Aggressive Optimization', 
            actions: ['minimal_ui', 'static_content', 'reduce_polling'],
            threshold: 600
        },
        {
            level: 4,
            name: 'Emergency Mode',
            actions: ['essential_only', 'pause_background', 'minimal_rendering'],
            threshold: 1000
        }
    ];

    // Measure frame performance
    const measureFramePerformance = useCallback(() => {
        const now = performance.now();
        const frameTime = now - lastFrameTime.current;
        
        frameCount.current++;
        metrics.current.totalFrames++;
        
        // Calculate FPS
        if (frameCount.current >= 60) {
            const fps = Math.round(1000 / frameTime);
            setCurrentPerformance(prev => ({ ...prev, fps }));
            frameCount.current = 0;
        }

        // Detect frame drops
        if (frameTime > 16.67) { // 60fps threshold
            metrics.current.frameDrops++;
        }

        // Update average frame time
        metrics.current.averageFrameTime = 
            (metrics.current.averageFrameTime * 0.9) + (frameTime * 0.1);

        lastFrameTime.current = now;
        
        return frameTime;
    }, []);

    // Monitor memory usage
    const monitorMemoryUsage = useCallback(() => {
        if (performance.memory) {
            const memoryInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };

            const memoryUsage = (memoryInfo.used / memoryInfo.total) * 100;
            setCurrentPerformance(prev => ({ ...prev, memoryUsage }));

            // Detect memory leaks (growing trend)
            if (memoryUsage > 85) {
                metrics.current.memoryLeaks++;
                return true; // Memory pressure detected
            }
        }
        return false;
    }, []);

    // Monitor CPU usage (approximation through timing)
    const monitorCPUUsage = useCallback(() => {
        const start = performance.now();
        
        // Perform a standardized CPU-intensive task
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
            sum += Math.random();
        }
        
        const cpuTime = performance.now() - start;
        const cpuUsage = Math.min(100, cpuTime * 10); // Rough approximation
        
        setCurrentPerformance(prev => ({ ...prev, cpuUsage }));
        
        return cpuUsage;
    }, []);

    // Comprehensive performance check
    const performPerformanceCheck = useCallback(() => {
        const frameTime = measureFramePerformance();
        const memoryPressure = monitorMemoryUsage();
        const cpuUsage = monitorCPUUsage();

        // Add to performance buffer
        performanceBuffer.current.push({
            timestamp: performance.now(),
            frameTime,
            memoryPressure,
            cpuUsage,
            renderTime: frameTime
        });

        // Maintain window size
        if (performanceBuffer.current.length > windowSize) {
            performanceBuffer.current.shift();
        }

        // Calculate performance health
        if (performanceBuffer.current.length >= windowSize) {
            const avgFrameTime = performanceBuffer.current.reduce(
                (sum, entry) => sum + entry.frameTime, 0
            ) / performanceBuffer.current.length;

            const memoryIssues = performanceBuffer.current.filter(
                entry => entry.memoryPressure
            ).length;

            const highCPUCount = performanceBuffer.current.filter(
                entry => entry.cpuUsage > 70
            ).length;

            // Determine if performance degradation occurred
            const shouldDegrade = 
                avgFrameTime > thresholdMs || 
                memoryIssues >= windowSize / 2 ||
                highCPUCount >= windowSize / 2;

            if (shouldDegrade && !isDegraded) {
                setIsDegraded(true);
                onDegrade && onDegrade({
                    reason: 'performance_degradation',
                    avgFrameTime,
                    memoryIssues,
                    cpuUsage: cpuUsage,
                    metrics: { ...metrics.current }
                });

                // Auto-optimization
                if (enableAutoOptimization) {
                    applyOptimization(avgFrameTime);
                }
            } else if (!shouldDegrade && isDegraded) {
                setIsDegraded(false);
                onRestore && onRestore({
                    reason: 'performance_restored',
                    avgFrameTime,
                    optimizationLevel: optimizationLevel.current
                });
            }

            setCurrentPerformance(prev => ({
                ...prev,
                renderTime: avgFrameTime,
                isOptimized: optimizationLevel.current > 0
            }));
        }
    }, [isDegraded, thresholdMs, windowSize, onDegrade, onRestore, enableAutoOptimization, measureFramePerformance, monitorMemoryUsage, monitorCPUUsage]);

    // Apply performance optimizations
    const applyOptimization = useCallback((currentFrameTime) => {
        const appropriateStrategy = optimizationStrategies.find(
            strategy => currentFrameTime >= strategy.threshold
        ) || optimizationStrategies[0];

        if (optimizationLevel.current < appropriateStrategy.level) {
            optimizationLevel.current = appropriateStrategy.level;
            
            // Apply CSS-based optimizations
            const optimizations = {
                1: () => {
                    document.documentElement.style.setProperty('--animation-speed', '0.5s');
                    document.documentElement.style.setProperty('--transition-speed', '0.2s');
                },
                2: () => {
                    document.documentElement.style.setProperty('--box-shadow', 'none');
                    document.documentElement.style.setProperty('--backdrop-filter', 'none');
                    document.documentElement.style.setProperty('--animation-speed', '0.3s');
                },
                3: () => {
                    document.documentElement.style.setProperty('--gradient-bg', 'solid');
                    document.documentElement.style.setProperty('--blur-effects', 'none');
                    document.documentElement.style.setProperty('--complex-layouts', 'simple');
                },
                4: () => {
                    document.documentElement.style.setProperty('--motion-reduce', 'true');
                    document.documentElement.style.setProperty('--essential-only', 'true');
                    document.documentElement.classList.add('performance-emergency');
                }
            };

            optimizations[appropriateStrategy.level]?.();
            
            console.log(`🚀 PerfGuard: Applied ${appropriateStrategy.name} (Level ${appropriateStrategy.level})`);
        }
    }, []);

    // Restore optimizations when performance improves
    const restoreOptimizations = useCallback(() => {
        if (optimizationLevel.current > 0) {
            // Gradually restore features
            optimizationLevel.current = Math.max(0, optimizationLevel.current - 1);
            
            if (optimizationLevel.current === 0) {
                // Reset all CSS optimizations
                document.documentElement.style.removeProperty('--animation-speed');
                document.documentElement.style.removeProperty('--transition-speed');
                document.documentElement.style.removeProperty('--box-shadow');
                document.documentElement.style.removeProperty('--backdrop-filter');
                document.documentElement.style.removeProperty('--gradient-bg');
                document.documentElement.style.removeProperty('--blur-effects');
                document.documentElement.style.removeProperty('--complex-layouts');
                document.documentElement.style.removeProperty('--motion-reduce');
                document.documentElement.style.removeProperty('--essential-only');
                document.documentElement.classList.remove('performance-emergency');
                
                console.log('🎯 PerfGuard: Restored full performance mode');
            }
        }
    }, []);

    // Start monitoring
    useEffect(() => {
        intervalRef.current = setInterval(performPerformanceCheck, checkIntervalMs);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [performPerformanceCheck, checkIntervalMs]);

    // Cleanup optimizations on unmount
    useEffect(() => {
        return () => {
            restoreOptimizations();
        };
    }, [restoreOptimizations]);

    // Advanced performance metrics reporting
    const getPerformanceReport = useCallback(() => {
        return {
            currentMetrics: { ...currentPerformance },
            historicalData: [...performanceBuffer.current],
            optimizationLevel: optimizationLevel.current,
            overallHealth: {
                fps: currentPerformance.fps,
                stability: (metrics.current.totalFrames - metrics.current.frameDrops) / metrics.current.totalFrames * 100,
                efficiency: Math.max(0, 100 - currentPerformance.memoryUsage),
                responsiveness: Math.max(0, 100 - (currentPerformance.renderTime / 16.67) * 100)
            },
            recommendations: generateOptimizationRecommendations()
        };
    }, [currentPerformance]);

    // Generate optimization recommendations
    const generateOptimizationRecommendations = useCallback(() => {
        const recommendations = [];
        
        if (currentPerformance.fps < 30) {
            recommendations.push({
                priority: 'high',
                action: 'Consider reducing animation complexity or frame rate',
                impact: 'Significant FPS improvement expected'
            });
        }
        
        if (currentPerformance.memoryUsage > 80) {
            recommendations.push({
                priority: 'high', 
                action: 'Memory cleanup recommended - check for memory leaks',
                impact: 'Reduced memory pressure and improved stability'
            });
        }
        
        if (currentPerformance.renderTime > 16.67) {
            recommendations.push({
                priority: 'medium',
                action: 'Optimize rendering pipeline - consider virtualization',
                impact: 'Smoother user experience and better responsiveness'  
            });
        }
        
        return recommendations;
    }, [currentPerformance]);

    // Expose performance API to children
    const performanceAPI = {
        getCurrentMetrics: () => currentPerformance,
        getPerformanceReport,
        forceOptimization: (level) => {
            optimizationLevel.current = level;
            applyOptimization(thresholdMs * level);
        },
        restorePerformance: restoreOptimizations,
        isDegraded
    };

    return (
        <>
            {typeof children === 'function' ? children(performanceAPI) : children}
            {showDebugInfo && (
                <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
                    <div>FPS: {currentPerformance.fps}</div>
                    <div>MEM: {Math.round(currentPerformance.memoryUsage)}%</div>
                    <div>CPU: {Math.round(currentPerformance.cpuUsage)}%</div>
                    <div>OPT: L{optimizationLevel.current}</div>
                    {isDegraded && <div className="text-red-400">⚠ DEGRADED</div>}
                </div>
            )}
        </>
    );
}