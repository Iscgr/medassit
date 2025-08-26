
import React, { useState, useEffect, useCallback } from "react";
import { SurgicalProcedure, SurgeryProgress, ProcedureSession } from "@/api/entities";
import { User } from "@/api/entities"; // Keep existing import
import { Link } from "react-router-dom"; // Keep existing import
import { createPageUrl } from "@/utils";
// Add RefreshCw icon
import { Scissors, Brain, Check, ChevronsRight, ChevronsLeft, Target, Loader2, AlertTriangle, CheckCircle2, Clock, TrendingUp, Award, Zap, Plus, Database, Stethoscope, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProcedureMeta from "@/components/surgery/ProcedureMeta";
import PreOpPanel from "@/components/surgery/PreOpPanel";
import AnesthesiaPanel from "@/components/surgery/AnesthesiaPanel";
import ComplicationsPanel from "@/components/surgery/ComplicationsPanel";
import RelatedAssets from "@/components/surgery/RelatedAssets";
import ProcedureObjectives from "@/components/surgery/ProcedureObjectives";
import AnatomyContext from "@/components/surgery/AnatomyContext";
import PreSurgicalProtocols from "@/components/surgery/PreSurgicalProtocols";
import InstrumentRationale from "@/components/surgery/InstrumentRationale";
import SkillCoach from "@/components/surgery/SkillCoach";
import AssessmentRubric from "@/components/surgery/AssessmentRubric";
import PostOpDocumentation from "@/components/surgery/PostOpDocumentation";
import DebriefPanel from "@/components/surgery/DebriefPanel";
import CustomProcedureCreator from "@/components/surgery/CustomProcedureCreator"; // Already exists
import { dynamicSurgeryGenerator } from "@/api/functions"; // Add new import

// ADVANCED DECISION TREE ENGINE
class SurgicalDecisionTree {
    constructor(procedure) {
        this.procedure = procedure;
        this.nodes = new Map();
        this.currentPath = [];
        this.complications = [];
        this.performanceMetrics = {
            technicalSkill: 0,
            decisionMaking: 0,
            timeManagement: 0,
            tissueHandling: 0,
            safetyScore: 0
        };
        this.buildDecisionTree();
    }

    buildDecisionTree() {
        // Build decision tree from procedure steps
        if (!this.procedure?.steps) return;

        this.procedure.steps.forEach((step, index) => {
            const nodeId = `step_${index}`;
            
            // Create decision node
            const node = {
                id: nodeId,
                step: step,
                stepIndex: index,
                decisionPoints: step.decisionPoints || [],
                nextNodes: [],
                complications: [],
                performanceFactors: {
                    timeExpected: step.expected_time || 300, // 5 minutes default
                    technicalDifficulty: step.technical_difficulty || 'medium',
                    criticalityLevel: step.criticality_level || 'medium'
                }
            };

            // Add conditional branches based on decision points
            if (step.decisionPoints?.length > 0) {
                step.decisionPoints.forEach((dp, dpIndex) => {
                    dp.options?.forEach((option, optIndex) => {
                        const branchId = `${nodeId}_${dpIndex}_${optIndex}`;
                        
                        // Define outcome paths
                        let nextStepIndex = index + 1;
                        let complications = [];
                        let performanceImpact = {};

                        // Parse option outcomes
                        if (!option.isCorrect) {
                            // Incorrect decisions can lead to complications
                            complications = this.generateComplicationFromDecision(option, step);
                            performanceImpact = {
                                technicalSkill: -10,
                                decisionMaking: -15,
                                safetyScore: option.severity === 'critical' ? -30 : -10
                            };

                            // Critical errors might skip steps or require additional interventions
                            if (option.severity === 'critical') {
                                nextStepIndex = this.findEmergencyStep(index);
                            }
                        } else {
                            performanceImpact = {
                                technicalSkill: +5,
                                decisionMaking: +10,
                                safetyScore: +5
                            };
                        }

                        node.nextNodes.push({
                            branchId,
                            condition: {
                                decisionPointIndex: dpIndex,
                                optionIndex: optIndex
                            },
                            nextStepIndex,
                            complications,
                            performanceImpact
                        });
                    });
                });
            } else {
                // Linear progression for non-decision steps
                node.nextNodes.push({
                    branchId: `${nodeId}_linear`,
                    nextStepIndex: index + 1,
                    complications: [],
                    performanceImpact: { technicalSkill: +2 }
                });
            }

            this.nodes.set(nodeId, node);
        });
    }

    generateComplicationFromDecision(option, step) {
        const complications = [];
        
        if (option.severity === 'critical') {
            complications.push({
                type: 'major_bleeding',
                description: 'خونریزی شدید به دلیل تصمیم نادرست',
                interventionRequired: true,
                recoveryTime: 600 // 10 minutes
            });
        } else if (option.severity === 'moderate') {
            complications.push({
                type: 'tissue_damage',
                description: 'آسیب بافتی قابل ترمیم',
                interventionRequired: false,
                recoveryTime: 180 // 3 minutes
            });
        }

        return complications;
    }

    findEmergencyStep(currentStep) {
        // Find emergency intervention step or stay at current step
        const emergencySteps = this.procedure.steps.findIndex(step => 
            step.title?.toLowerCase().includes('emergency') || 
            step.title?.toLowerCase().includes('complication')
        );
        return emergencySteps !== -1 ? emergencySteps : currentStep;
    }

    processDecision(stepIndex, decisionIndex, timeSpent) {
        const nodeId = `step_${stepIndex}`;
        const node = this.nodes.get(nodeId);
        
        if (!node || !node.step.decisionPoints?.[0]) {
            return { error: 'Invalid decision context' };
        }

        const decisionPoint = node.step.decisionPoints[0];
        const selectedOption = decisionPoint.options[decisionIndex];
        
        if (!selectedOption) {
            return { error: 'Invalid decision option' };
        }

        // Find the appropriate branch
        const branch = node.nextNodes.find(n => 
            n.condition?.optionIndex === decisionIndex
        );

        if (!branch) {
            return { error: 'No branch found for decision' };
        }

        // Update performance metrics
        this.updatePerformanceMetrics(selectedOption, timeSpent, node.performanceFactors);

        // Add complications if any
        if (branch.complications.length > 0) {
            this.complications.push(...branch.complications);
        }

        // Record decision in path
        this.currentPath.push({
            stepIndex,
            decision: decisionIndex,
            option: selectedOption,
            timeSpent,
            complications: branch.complications,
            performanceImpact: branch.performanceImpact
        });

        return {
            isCorrect: selectedOption.isCorrect,
            nextStepIndex: branch.nextStepIndex,
            complications: branch.complications,
            feedback: this.generateDetailedFeedback(selectedOption, node),
            performanceImpact: branch.performanceImpact,
            currentMetrics: { ...this.performanceMetrics }
        };
    }

    updatePerformanceMetrics(option, timeSpent, performanceFactors) {
        // Time management scoring
        const timeRatio = timeSpent / performanceFactors.timeExpected;
        let timeScore = 0;
        if (timeRatio <= 1.0) timeScore = 20;
        else if (timeRatio <= 1.5) timeScore = 15;
        else if (timeRatio <= 2.0) timeScore = 10;
        else timeScore = 5;

        // Decision quality scoring
        const decisionScore = option.isCorrect ? 20 : (option.severity === 'critical' ? -10 : -5);

        // Technique scoring based on option's technical merit
        const techniqueScore = option.techniqueScore || (option.isCorrect ? 15 : 5);

        // Safety scoring
        const safetyScore = option.safetyScore || (option.isCorrect ? 15 : (option.severity === 'critical' ? -20 : -5));

        // Tissue handling (derived from decision quality and technique)
        const tissueScore = Math.round((techniqueScore + safetyScore) / 2);

        // Update cumulative metrics
        this.performanceMetrics.timeManagement = Math.max(0, Math.min(100, this.performanceMetrics.timeManagement + timeScore));
        this.performanceMetrics.decisionMaking = Math.max(0, Math.min(100, this.performanceMetrics.decisionMaking + decisionScore));
        this.performanceMetrics.technicalSkill = Math.max(0, Math.min(100, this.performanceMetrics.technicalSkill + techniqueScore));
        this.performanceMetrics.safetyScore = Math.max(0, Math.min(100, this.performanceMetrics.safetyScore + safetyScore));
        this.performanceMetrics.tissueHandling = Math.max(0, Math.min(100, this.performanceMetrics.tissueHandling + tissueScore));
    }

    generateDetailedFeedback(option, node) {
        const feedback = {
            primary: option.explanation || (option.isCorrect ? 'تصمیم صحیح!' : 'نیاز به بازنگری'),
            technical: '',
            clinical: '',
            educational: '',
            references: []
        };

        // Technical feedback
        if (option.isCorrect) {
            feedback.technical = `✅ این انتخاب مطابق با پروتکل‌های استاندارد جراحی ${this.procedure.category} است.`;
        } else {
            feedback.technical = `❌ این تصمیم می‌تواند منجر به عوارض شود. روش صحیح: ${this.getCorrectApproach(node)}`;
        }

        // Clinical implications
        if (option.outcome) {
            feedback.clinical = `🏥 پیامدهای بالینی: ${option.outcome}`;
        }

        // Educational content
        feedback.educational = this.generateEducationalTips(option, node);

        // Add references
        if (this.procedure.sources) {
            feedback.references = this.procedure.sources.slice(0, 2);
        }

        return feedback;
    }

    getCorrectApproach(node) {
        const correctOption = node.step.decisionPoints?.[0]?.options?.find(opt => opt.isCorrect);
        return correctOption?.text || 'مراجعه به منابع درسی';
    }

    generateEducationalTips(option, node) {
        if (option.isCorrect) {
            return `💡 نکته آموزشی: ${option.text} انتخاب مناسبی است زیرا ${option.rationale || 'مطابق استانداردهای جراحی عمل می‌کند'}.`;
        } else {
            return `📚 نکته یادگیری: برای درنظرگیری چنین مواردی، ${node.step.expert_tips || 'مطالعه بیشتر در زمینه تکنیک‌های جراحی توصیه می‌شود'}.`;
        }
    }

    getOverallPerformance() {
        const weights = {
            technicalSkill: 0.25,
            decisionMaking: 0.30,
            timeManagement: 0.20,
            tissueHandling: 0.15,
            safetyScore: 0.10
        };

        const overallScore = Math.round(
            this.performanceMetrics.technicalSkill * weights.technicalSkill +
            this.performanceMetrics.decisionMaking * weights.decisionMaking +
            this.performanceMetrics.timeManagement * weights.timeManagement +
            this.performanceMetrics.tissueHandling * weights.tissueHandling +
            this.performanceMetrics.safetyScore * weights.safetyScore
        );

        return {
            ...this.performanceMetrics,
            overallScore,
            grade: this.calculateGrade(overallScore),
            complications: this.complications,
            decisionPath: this.currentPath
        };
    }

    calculateGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
}

// SURGICAL INSTRUCTOR BACKEND CALLER
const surgeryInstructor = async (action, payload) => {
    try {
        const { surgeryInstructor: importedSurgeryInstructor } = await import('@/api/functions');
        const response = await importedSurgeryInstructor({ action, payload });
        return response.data || response;
    } catch (error) {
        console.error('Surgery instructor error:', error);
        throw error;
    }
};

export default function VirtualSurgeryLab() {
    const [procedures, setProcedures] = useState([]);
    const [selectedProcedure, setSelectedProcedure] = useState(null);
    const [procedureSteps, setProcedureSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
    const [stepStartTime, setStepStartTime] = useState(null);
    const [elapsedSec, setElapsedSec] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [sessionDecisions, setSessionDecisions] = useState([]);
    const [sessionData, setSessionData] = useState(null);
    const [showDebrief, setShowDebrief] = useState(false);
    const [finalPerformance, setFinalPerformance] = useState(null);
    const [decisionTree, setDecisionTree] = useState(null);
    const [realTimeMetrics, setRealTimeMetrics] = useState(null);
    const [complications, setComplications] = useState([]);
    const [showCustomCreator, setShowCustomCreator] = useState(false);
    const [isUpdatingFromSources, setIsUpdatingFromSources] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null); // New state

    const loadProcedures = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await SurgicalProcedure.list();
            setProcedures(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load procedures:', error);
            setProcedures([]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadProcedures();
    }, [loadProcedures]);

    // Timer for current step
    useEffect(() => {
        let intervalId;
        if (selectedProcedure && procedureSteps.length > 0 && currentStep < procedureSteps.length && !showDebrief) {
            setStepStartTime(Date.now());
            setElapsedSec(0);
            intervalId = setInterval(() => {
                setElapsedSec(prev => {
                    if (!stepStartTime) return prev;
                    return Math.floor((Date.now() - stepStartTime) / 1000);
                });
            }, 1000);
        } else {
            if (intervalId) clearInterval(intervalId);
            setElapsedSec(0);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [currentStep, selectedProcedure?.id, procedureSteps.length, showDebrief, stepStartTime]);

    // Renamed and refactored from handleRealUpdateFromSources
    const handleUpdateFromSources = async () => {
        setIsUpdatingFromSources(true);
        try {
            const response = await dynamicSurgeryGenerator({
                action: 'updateFromSources'
            });

            if (response.data?.success) {
                const jobId = response.data.job_id;
                
                // Poll for status updates
                const pollStatus = setInterval(async () => {
                    try {
                        const statusResponse = await dynamicSurgeryGenerator({
                            action: 'getUpdateStatus',
                            payload: { job_id: jobId }
                        });

                        const status = statusResponse.data;
                        setUpdateStatus(status);

                        if (status.status === 'completed' || status.status === 'failed') {
                            clearInterval(pollStatus);
                            setIsUpdatingFromSources(false);
                            setUpdateStatus(null); // Clear status after completion/failure
                            
                            if (status.status === 'completed') {
                                // Reload procedures to show updated content
                                await loadProcedures();
                                alert(`بروزرسانی کامل شد! ${status.results?.length || 0} جراحی بروزرسانی شد.`);
                            } else if (status.status === 'failed') {
                                alert(`بروزرسانی با خطا مواجه شد: ${status.error_message || 'خطای ناشناخته'}`);
                            }
                        }
                    } catch (error) {
                        console.error('Status polling error:', error);
                        clearInterval(pollStatus);
                        setIsUpdatingFromSources(false);
                        setUpdateStatus(null);
                        alert('خطا در بررسی وضعیت بروزرسانی: ' + error.message);
                    }
                }, 3000);
                
            } else {
                throw new Error(response.data?.error || 'Failed to start update process');
            }
        } catch (error) {
            console.error('Update error:', error);
            setIsUpdatingFromSources(false);
            setUpdateStatus(null);
            alert('خطا در بروزرسانی: ' + error.message);
        }
    };

    // Refactored handleCustomProcedureCreated
    const handleCustomProcedureCreated = async (newProcedureData) => {
        try {
            // The procedure is already saved by the generator within CustomProcedureCreator
            await loadProcedures(); // Reload to show the new procedure
            setShowCustomCreator(false);
            alert('جراحی جدید با موفقیت ایجاد شد!');
        } catch (error) {
            console.error('Error handling created procedure:', error);
            alert('خطا در ذخیره جراحی: ' + error.message);
        }
    };

    const handleSelectProcedure = async (proc) => {
        setIsLoading(true);
        setSelectedProcedure(proc);
        let currentProcedureSteps = [];
        
        try {
            if (proc.steps && proc.steps.length > 0) {
                currentProcedureSteps = proc.steps;
                setProcedureSteps(currentProcedureSteps);
            } else {
                const response = await surgeryInstructor('generateSteps', { procedureId: proc.id });
                currentProcedureSteps = response.steps;
                setProcedureSteps(currentProcedureSteps);
            }

            // Initialize decision tree
            const tree = new SurgicalDecisionTree(proc);
            setDecisionTree(tree);

            const totalDecisionPoints = currentProcedureSteps.reduce((acc, s) => 
                acc + (s.decisionPoints?.[0]?.options?.length ? 1 : 0), 0);
            
            setSessionScore({ correct: 0, total: totalDecisionPoints });
            setSessionDecisions([]);
            setComplications([]);

            // Create procedure session
            const session = await ProcedureSession.create({
                procedure_id: proc.id,
                started_at: new Date().toISOString(),
                steps_completed: 0,
                decisions: []
            });
            setSessionId(session.id);
            setSessionData(session);
            setShowDebrief(false);
            setFinalPerformance(null);

        } catch (error) {
            console.error("Error setting up procedure:", error);
        }

        setCurrentStep(0);
        setFeedback(null);
        setStepStartTime(Date.now());
        setElapsedSec(0);
        setIsLoading(false);
    };

    const handleDecisionSubmit = async () => {
        if (currentDecision === null || currentDecision === undefined) {
            console.warn('No decision selected');
            return;
        }
        
        if (isLoading) return;
        setIsLoading(true);
        
        try {
            const timeSpent = stepStartTime ? Math.floor((Date.now() - stepStartTime) / 1000) : 0;
            const decisionIndex = parseInt(currentDecision);

            let result;
            
            if (decisionTree) {
                // Use advanced decision tree
                result = decisionTree.processDecision(currentStep, decisionIndex, timeSpent);
                
                if (result.error) {
                    throw new Error(result.error);
                }

                // Update real-time metrics
                setRealTimeMetrics(result.currentMetrics);
                
                // Add any complications
                if (result.complications.length > 0) {
                    setComplications(prev => [...prev, ...result.complications]);
                }
                
                setFeedback({
                    isCorrect: result.isCorrect,
                    feedback: result.feedback.primary,
                    technicalFeedback: result.feedback.technical,
                    clinicalFeedback: result.feedback.clinical,
                    educationalTips: result.feedback.educational,
                    references: result.feedback.references,
                    performanceImpact: result.performanceImpact,
                    complications: result.complications
                });

                // Record decision
                const decisionRecord = {
                    step_index: currentStep,
                    decision_index: decisionIndex,
                    is_correct: result.isCorrect,
                    time_spent: timeSpent,
                    metrics: result.currentMetrics,
                    complications: result.complications
                };

                setSessionDecisions(prev => [...prev, decisionRecord]);

                // Update session in database
                if (sessionId) {
                    await ProcedureSession.update(sessionId, { 
                        decisions: [...sessionDecisions, decisionRecord],
                        steps_completed: Math.max(currentStep + 1, sessionData?.steps_completed || 0),
                        complications: complications.concat(result.complications)
                    });
                }

                // Update score
                setSessionScore(prev => ({
                    correct: prev.correct + (result.isCorrect ? 1 : 0),
                    total: prev.total
                }));

                setShowFeedbackModal(true);

                // Navigate to next step
                setTimeout(() => {
                    setCurrentDecision(null);
                    const targetStep = result.nextStepIndex >= procedureSteps.length 
                        ? procedureSteps.length 
                        : result.nextStepIndex;
                    
                    if (targetStep >= procedureSteps.length) {
                        // Simulation complete
                        const finalPerf = decisionTree.getOverallPerformance();
                        setFinalPerformance(finalPerf);
                        setShowDebrief(true);
                    } else {
                        setCurrentStep(targetStep);
                        setStepStartTime(Date.now());
                        setElapsedSec(0);
                    }
                }, 1500);

            } else {
                // Fallback to simple evaluation
                const feedbackResponse = await surgeryInstructor('evaluateDecision', {
                    procedureId: selectedProcedure.id,
                    stepIndex: currentStep,
                    decision: decisionIndex,
                    timeSpent: timeSpent
                });

                setFeedback(feedbackResponse);
                setShowFeedbackModal(true);

                setTimeout(() => {
                    setCurrentDecision(null);
                    if (currentStep < procedureSteps.length - 1) {
                        setCurrentStep(currentStep + 1);
                        setStepStartTime(Date.now());
                        setElapsedSec(0);
                    } else {
                        setShowDebrief(true);
                    }
                }, 1500);
            }

        } catch (error) {
            console.error('Decision evaluation error:', error);
            setFeedback({
                isCorrect: false,
                feedback: `خطا در ارزیابی: ${error.message}`,
                severity: 'error'
            });
            setShowFeedbackModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshSteps = async () => {
        if (!selectedProcedure) return;
        
        setIsLoading(true);
        try {
            const response = await surgeryInstructor('generateSteps', { procedureId: selectedProcedure.id });
            const newSteps = response.steps || [];
            setProcedureSteps(newSteps);
            
            await SurgicalProcedure.update(selectedProcedure.id, { steps: newSteps });
            
            // Reinitialize decision tree
            const tree = new SurgicalDecisionTree(selectedProcedure);
            setDecisionTree(tree);
            
            setStepStartTime(Date.now());
            setElapsedSec(0);
            setCurrentStep(0);
            setFeedback(null);
            setCurrentDecision(null);
            setShowDebrief(false);
            setSessionDecisions([]);
            setFinalPerformance(null);
            setComplications([]);

            const totalDecisionPoints = newSteps.reduce((acc, s) => 
                acc + (s.decisionPoints?.[0]?.options?.length ? 1 : 0), 0);
            setSessionScore({ correct: 0, total: totalDecisionPoints });

            if (selectedProcedure.id) {
                const session = await ProcedureSession.create({
                    procedure_id: selectedProcedure.id,
                    started_at: new Date().toISOString(),
                    steps_completed: 0,
                    decisions: []
                });
                setSessionId(session.id);
                setSessionData(session);
            }

        } catch (error) {
            console.error("خطا در بروزرسانی مراحل:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Global Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl">
                            <Scissors className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">آزمایشگاه جراحی مجازی</h1>
                            <p className="text-gray-600">تمرین و یادگیری جراحی‌های دامپزشکی</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowCustomCreator(true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl text-white px-6 py-3"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            ایجاد جراحی جدید
                        </Button>
                        
                        <Button
                            onClick={handleUpdateFromSources}
                            disabled={isUpdatingFromSources}
                            variant="outline"
                            className="rounded-2xl px-6 py-3"
                        >
                            {isUpdatingFromSources ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    در حال بروزرسانی...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    بروزرسانی از منابع
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Update Status Display */}
                {updateStatus && isUpdatingFromSources && (
                    <Card className="mb-6 bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-blue-800">پیشرفت بروزرسانی</span>
                                <span className="text-blue-600">{updateStatus.progress || 0}/{updateStatus.total || 0}</span>
                            </div>
                            <Progress 
                                value={(updateStatus.progress / (updateStatus.total || 1)) * 100} 
                                className="mb-2"
                            />
                            <div className="text-sm text-blue-600">
                                موفق: {updateStatus.results?.length || 0} | خطا: {updateStatus.errors?.length || 0}
                            </div>
                            {updateStatus.status === 'completed' && (
                                <p className="text-sm text-green-700 mt-2">بروزرسانی با موفقیت به پایان رسید.</p>
                            )}
                             {updateStatus.status === 'failed' && (
                                <p className="text-sm text-red-700 mt-2">بروزرسانی با خطا مواجه شد: {updateStatus.error_message}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Custom Procedure Creator Dialog */}
                <Dialog open={showCustomCreator} onOpenChange={setShowCustomCreator}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>ایجاد جراحی جدید</DialogTitle>
                            <DialogDescription>
                                با استفاده از هوش مصنوعی، یک جراحی جدید بسازید یا یک جراحی موجود را ویرایش کنید.
                            </DialogDescription>
                        </DialogHeader>
                        <CustomProcedureCreator
                            onProcedureCreated={handleCustomProcedureCreated}
                            onClose={() => setShowCustomCreator(false)}
                        />
                    </DialogContent>
                </Dialog>

                {/* Conditional Main Content */}
                {isLoading && !selectedProcedure && !showCustomCreator ? (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
                    </div>
                ) : selectedProcedure ? (
                    <div className="space-y-6">
                        {/* Header for selected procedure view */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button 
                                    onClick={() => setSelectedProcedure(null)} 
                                    variant="outline" 
                                    className="rounded-2xl"
                                >
                                    <ChevronsLeft className="w-4 h-4 mr-2" /> بازگشت به لیست جراحی‌ها
                                </Button>
                                {/* Removed the specific update button from here as it's now global */}
                            </div>
                            <ProcedureMeta procedure={selectedProcedure} />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-3xl font-bold text-gray-800">{selectedProcedure.title}</h1>
                        </div>

                        {/* Real-time Performance Metrics */}
                        {realTimeMetrics && (
                            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        عملکرد لحظه‌ای
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {Math.round(realTimeMetrics.technicalSkill)}
                                            </div>
                                            <div className="text-gray-600">مهارت فنی</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-purple-600">
                                                {Math.round(realTimeMetrics.decisionMaking)}
                                            </div>
                                            <div className="text-gray-600">تصمیم‌گیری</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">
                                                {Math.round(realTimeMetrics.timeManagement)}
                                            </div>
                                            <div className="text-gray-600">مدیریت زمان</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">
                                                {Math.round(realTimeMetrics.tissueHandling)}
                                            </div>
                                            <div className="text-gray-600">بافت‌داری</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-red-600">
                                                {Math.round(realTimeMetrics.safetyScore)}
                                            </div>
                                            <div className="text-gray-600">ایمنی</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Complications Alert */}
                        {complications.length > 0 && (
                            <Alert className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    <strong>عوارض بوجود آمده:</strong>
                                    <ul className="mt-2 list-disc pr-5">
                                        {complications.slice(-3).map((comp, index) => (
                                            <li key={index}>
                                                {comp.description} 
                                                {comp.interventionRequired && (
                                                    <Badge className="ml-2 bg-red-100 text-red-800">نیاز به مداخله</Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Progress bar */}
                        {!showDebrief && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>پیشرفت مراحل</span>
                                    <span>{currentStep + 1} / {procedureSteps.length}</span>
                                </div>
                                <Progress value={procedureSteps.length > 0 ? ((currentStep + 1) / procedureSteps.length) * 100 : 0} className="h-3" />
                            </div>
                        )}

                        {isLoading && procedureSteps.length === 0 ? (
                            <div className="flex justify-center items-center p-12">
                                <Loader2 className="w-12 h-12 animate-spin" />
                            </div>
                        ) : (!procedureSteps[currentStep] && !showDebrief) ? (
                            <p>مرحله‌ای برای نمایش وجود ندارد. می‌توانید مراحل را از منابع بروزرسانی کنید.</p>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl">
                                        <CardHeader>
                                            <CardTitle className="text-rose-700 flex items-center justify-between">
                                                <span>مرحله {currentStep + 1}: {procedureSteps[currentStep]?.title}</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {elapsedSec}s
                                                    </Badge>
                                                    {procedureSteps[currentStep]?.expected_time && (
                                                        <Badge className="bg-blue-100 text-blue-800">
                                                            هدف: {procedureSteps[currentStep].expected_time}s
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="leading-relaxed text-gray-700 mb-4">{procedureSteps[currentStep]?.description}</p>
                                            
                                            {procedureSteps[currentStep]?.expert_tips && (
                                                <div className="mb-4 p-4 bg-fuchsia-50 rounded-xl">
                                                    <div className="font-semibold text-fuchsia-800 mb-2 flex items-center gap-2">
                                                        <Brain className="w-4 h-4" />
                                                        نکات متخصص:
                                                    </div>
                                                    <div className="text-gray-700 text-sm">{procedureSteps[currentStep].expert_tips}</div>
                                                </div>
                                            )}

                                            {procedureSteps[currentStep]?.anatomical_notes && (
                                                <div className="mb-4 p-4 bg-amber-50 rounded-xl">
                                                    <div className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                                        <Target className="w-4 h-4" />
                                                        نکات آناتومیک:
                                                    </div>
                                                    <div className="text-gray-700 text-sm">{procedureSteps[currentStep].anatomical_notes}</div>
                                                </div>
                                            )}

                                            {procedureSteps[currentStep]?.decisionPoints?.[0] && (
                                                <div className="mt-6">
                                                    <h4 className="font-bold text-lg mb-4 text-fuchsia-800 flex items-center gap-2">
                                                        <Brain className="w-5 h-5" />
                                                        نقطه تصمیم‌گیری
                                                    </h4>
                                                    <p className="mb-4 p-3 bg-blue-50 rounded-lg text-gray-700">
                                                        {procedureSteps[currentStep].decisionPoints[0].question}
                                                    </p>
                                                    <RadioGroup onValueChange={setCurrentDecision} value={currentDecision}>
                                                        <div className="space-y-3">
                                                            {procedureSteps[currentStep].decisionPoints[0].options.map((opt, index) => (
                                                                <div key={index} className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                                                    <RadioGroupItem 
                                                                        value={String(index)} 
                                                                        id={`opt-${index}`}
                                                                        className="mt-1"
                                                                    />
                                                                    <Label 
                                                                        htmlFor={`opt-${index}`} 
                                                                        className="flex-1 cursor-pointer text-sm leading-relaxed"
                                                                    >
                                                                        {opt.text}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </RadioGroup>
                                                    <Button 
                                                        onClick={handleDecisionSubmit} 
                                                        disabled={currentDecision === null || isLoading} 
                                                        className="mt-4 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                                                        size="lg"
                                                    >
                                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        تأیید تصمیم
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Side panels */}
                                <div className="space-y-6">
                                    <PreOpPanel procedure={selectedProcedure} />
                                    <AnesthesiaPanel procedure={selectedProcedure} />
                                    <ComplicationsPanel procedure={selectedProcedure} />
                                    <ProcedureObjectives procedure={selectedProcedure} />
                                    <AnatomyContext procedure={selectedProcedure} />
                                    <PreSurgicalProtocols procedure={selectedProcedure} />
                                    <InstrumentRationale procedure={selectedProcedure} />
                                    <SkillCoach procedure={selectedProcedure} />
                                    <AssessmentRubric procedure={selectedProcedure} />
                                    <PostOpDocumentation
                                        session={sessionData}
                                        onSave={async (doc) => {
                                            if (!sessionId) return;
                                            const updated = await ProcedureSession.update(sessionId, { documentation: doc });
                                            setSessionData(updated);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation for non-decision steps */}
                        {!procedureSteps[currentStep]?.decisionPoints?.[0] && !showDebrief && procedureSteps[currentStep] && (
                            <div className="flex justify-between items-center mt-6">
                                <Button 
                                    onClick={() => setCurrentStep(currentStep - 1)} 
                                    disabled={currentStep === 0 || isLoading} 
                                    className="rounded-2xl"
                                    variant="outline"
                                >
                                    <ChevronsLeft className="w-4 h-4 mr-2"/> مرحله قبل
                                </Button>
                                <div className="text-sm text-gray-600">مرحله {currentStep + 1} از {procedureSteps.length}</div>
                                <Button 
                                    onClick={() => setCurrentStep(currentStep + 1)} 
                                    disabled={currentStep >= procedureSteps.length - 1 || isLoading} 
                                    className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500"
                                >
                                    مرحله بعد <ChevronsRight className="w-4 h-4 ml-2"/>
                                </Button>
                            </div>
                        )}

                        {/* End Simulation Button */}
                        {procedureSteps.length > 0 && !showDebrief && (
                            <div className="flex justify-end mt-6">
                                <Button
                                    variant="outline"
                                    className="rounded-2xl"
                                    onClick={() => {
                                        const finalPerf = decisionTree ? decisionTree.getOverallPerformance() : {
                                            overallScore: Math.round((sessionScore.correct / Math.max(sessionScore.total, 1)) * 100),
                                            grade: sessionScore.correct / Math.max(sessionScore.total, 1) >= 0.8 ? 'A' : 'B'
                                        };
                                        setFinalPerformance(finalPerf);
                                        setShowDebrief(true);

                                        if (sessionId) {
                                            ProcedureSession.update(sessionId, {
                                                finished_at: new Date().toISOString(),
                                                performance: finalPerf
                                            });
                                        }
                                    }}
                                >
                                    پایان شبیه‌سازی و دی‌بریف
                                </Button>
                            </div>
                        )}

                        {/* Debrief Panel */}
                        <DebriefPanel
                            open={showDebrief}
                            onOpenChange={setShowDebrief}
                            performance={finalPerformance}
                            complications={complications}
                            notes="برای بهبود عملکرد، روی نقاط ضعف شناسایی شده تمرکز کن و به مطالعه منابع پیشنهادی بپرداز."
                            onClose={() => {
                                setShowDebrief(false);
                                setSelectedProcedure(null);
                                setSessionId(null);
                                setSessionDecisions([]);
                                setSessionData(null);
                                setFinalPerformance(null);
                                setSessionScore({ correct: 0, total: 0 });
                                setCurrentStep(0);
                                setStepStartTime(null);
                                setElapsedSec(0);
                                setFeedback(null);
                                setCurrentDecision(null);
                                setDecisionTree(null);
                                setRealTimeMetrics(null);
                                setComplications([]);
                            }}
                        />

                        {/* Enhanced Feedback Modal */}
                        {feedback && showFeedbackModal && (
                            <Dialog open={showFeedbackModal} onOpenChange={(open) => { 
                                setShowFeedbackModal(open); 
                                if (!open && !showDebrief) { 
                                    setFeedback(null); 
                                    setCurrentDecision(null); 
                                } 
                            }}>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className={`flex items-center gap-2 ${feedback.isCorrect ? "text-green-600" : "text-red-600"}`}>
                                            {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                            {feedback.isCorrect ? "آفرین، تصمیم صحیح بود!" : "نیاز به بازنگری"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {feedback.feedback}
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4">
                                        {feedback.technicalFeedback && (
                                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                                    <Scissors className="w-4 h-4" />
                                                    بازخورد فنی:
                                                </h4>
                                                <p className="text-blue-700 text-sm">{feedback.technicalFeedback}</p>
                                            </div>
                                        )}

                                        {feedback.clinicalFeedback && (
                                            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                                <h4 className="font-bold text-green-800 mb-2">پیامدهای بالینی:</h4>
                                                <p className="text-green-700 text-sm">{feedback.clinicalFeedback}</p>
                                            </div>
                                        )}

                                        {feedback.educationalTips && (
                                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                                                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                                                    <Brain className="w-4 h-4" />
                                                    نکات آموزشی:
                                                </h4>
                                                <p className="text-purple-700 text-sm">{feedback.educationalTips}</p>
                                            </div>
                                        )}

                                        {feedback.complications && feedback.complications.length > 0 && (
                                            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    عوارض جدید:
                                                </h4>
                                                <ul className="text-red-700 text-sm space-y-1">
                                                    {feedback.complications.map((comp, i) => (
                                                        <li key={i}>• {comp.description}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {feedback.performanceImpact && (
                                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                <h4 className="font-bold text-gray-800 mb-3">تأثیر بر عملکرد:</h4>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    {Object.entries(feedback.performanceImpact).map(([key, value]) => (
                                                        <div key={key} className="text-center">
                                                            <div className={`text-lg font-bold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                                {value > 0 ? '+' : ''}{value}
                                                            </div>
                                                            <div className="text-gray-600 text-xs">{key}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {feedback.references && feedback.references.length > 0 && (
                                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                                <h4 className="font-bold text-amber-800 mb-2">منابع علمی:</h4>
                                                <ul className="text-amber-700 text-sm space-y-1">
                                                    {feedback.references.map((ref, i) => (
                                                        <li key={i}>• {typeof ref === 'string' ? ref : `${ref.title} (${ref.year})`}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <DialogFooter>
                                        <Button onClick={() => setShowFeedbackModal(false)}>
                                            متوجه شدم
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                ) : ( // Procedure selection view
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">لیست جراحی‌ها</h1>
                            <p className="text-gray-600">یک عمل جراحی را برای شروع تمرین انتخاب کنید.</p>
                            {/* Removed buttons from here as they are now in the global header */}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {procedures.map(proc => (
                                <Card 
                                    key={proc.id} 
                                    onClick={() => handleSelectProcedure(proc)} 
                                    className="bg-white/60 backdrop-blur-sm border-0 shadow-xl cursor-pointer hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="aspect-video relative overflow-hidden rounded-t-3xl">
                                        <img 
                                            src={proc.cover_image_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1674&auto=format&fit=crop"} 
                                            alt={proc.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Badge className="bg-fuchsia-100 text-fuchsia-800 rounded-full">
                                                {proc.difficulty || proc.difficulty_level}
                                            </Badge>
                                            {proc.created_by_ai && (
                                                <Badge className="bg-green-100 text-green-800 rounded-full">
                                                    <Brain className="w-3 h-3 mr-1" />
                                                    AI
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{proc.title}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {proc.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {proc.estimated_duration?.experienced_minutes && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {Math.round(proc.estimated_duration.experienced_minutes / 60)}h
                                                    </Badge>
                                                )}
                                                {proc.species_specific?.[0]?.species && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {proc.species_specific[0].species}
                                                    </Badge>
                                                )}
                                                {proc.validation_score && (
                                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                        {proc.validation_score}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 group-hover:scale-105 transition-transform">
                                                شروع تمرین
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        
                        {procedures.length === 0 && (
                            <div className="text-center py-12">
                                <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">هنوز جراحی‌ای تعریف نشده</h3>
                                <p className="text-gray-500 mb-6">اولین جراحی خود را ایجاد کنید</p>
                                {/* Button is now in global header */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
