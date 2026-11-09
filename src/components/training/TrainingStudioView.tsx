/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Cpu,
  Database,
  ShieldCheck,
  PlayCircle,
  BarChart3,
  MessageSquare,
  RotateCcw,
  Sliders,
  History,
  Layers,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  AudioSample,
  DatasetDistribution,
  DatasetHealthReport,
  DatasetHealthIssue,
  FeatureExtractionConfig,
  TrainingConfiguration,
  TrainingRun,
  ModelVersionItem,
  HumanFeedbackItem,
  HardExampleItem,
  RetrainingDatasetPlan,
  StudioTabKey,
  SampleLabel,
  HumanVerdict,
  FeedbackIssueCategory,
  TestPrediction,
} from '../../types/trainingStudio';

import {
  INITIAL_AUDIO_SAMPLES,
  INITIAL_DATASET_DISTRIBUTION,
  INITIAL_HEALTH_REPORT,
  DEFAULT_FEATURE_CONFIG,
  DEFAULT_TRAINING_CONFIG,
  MOCK_MODEL_VERSIONS,
  MOCK_CURRENT_EVALUATION,
  MOCK_FEEDBACK_ITEMS,
  MOCK_HARD_EXAMPLES,
  MOCK_PAST_RUNS,
} from '../../data/trainingStudioData';

// Sub-components
import { TrainingOverview } from './TrainingOverview';
import { PipelineStepper, PipelineStage } from './PipelineStepper';
import { DatasetUploader } from './DatasetUploader';
import { DatasetManager } from './DatasetManager';
import { DatasetHealth } from './DatasetHealth';
import { DatasetDistributionView } from './DatasetDistribution';
import { FeatureConfigurationView } from './FeatureConfiguration';
import { TrainingConfigurationView } from './TrainingConfiguration';
import { TrainingProgress } from './TrainingProgress';
import { ModelEvaluationView } from './ModelEvaluation';
import { ModelTester } from './ModelTester';
import { FeedbackQueue } from './FeedbackQueue';
import { HardExamples } from './HardExamples';
import { ModelVersions } from './ModelVersions';
import { RetrainingWizard } from './RetrainingWizard';
import { TrainingHistory } from './TrainingHistory';
import { TrainingLogs } from './TrainingLogs';
import { apiService } from '../../services/api';

export const TrainingStudioView: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<StudioTabKey>('pipeline');
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('dataset');
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([
    'dataset',
    'validation',
    'features',
  ]);

  // Core Data State
  const [samples, setSamples] = useState<AudioSample[]>(INITIAL_AUDIO_SAMPLES);
  const [healthReport, setHealthReport] = useState<DatasetHealthReport>(INITIAL_HEALTH_REPORT);
  const [featureConfig, setFeatureConfig] = useState<FeatureExtractionConfig>(DEFAULT_FEATURE_CONFIG);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfiguration>(DEFAULT_TRAINING_CONFIG);
  const [modelVersions, setModelVersions] = useState<ModelVersionItem[]>(MOCK_MODEL_VERSIONS);
  const [activeModelVersion, setActiveModelVersion] = useState<string>(MOCK_MODEL_VERSIONS[0].version);
  const [currentEvaluation, setCurrentEvaluation] = useState(MOCK_CURRENT_EVALUATION);
  const [feedbackItems, setFeedbackItems] = useState<HumanFeedbackItem[]>(MOCK_FEEDBACK_ITEMS);
  const [hardExamples, setHardExamples] = useState<HardExampleItem[]>(MOCK_HARD_EXAMPLES);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>(MOCK_PAST_RUNS);

  // Active Training Run State
  const [currentRun, setCurrentRun] = useState<TrainingRun | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Interval Ref for training simulation
  const trainingIntervalRef = useRef<any>(null);

  // Compute live dataset distribution from samples pool
  const liveDistribution: DatasetDistribution = useMemo(() => {
    let countReal = 0;
    let countAi = 0;
    let countCloned = 0;
    let countUnknown = 0;
    let totalDurationSec = 0;
    const sampleRateDistribution: Record<number, number> = {};
    const formatDistribution: Record<string, number> = {};
    const speakers = new Set<string>();

    for (const s of samples) {
      if (s.label === 'REAL') countReal++;
      else if (s.label === 'AI_GENERATED') countAi++;
      else if (s.label === 'CLONED') countCloned++;
      else countUnknown++;

      totalDurationSec += s.durationSeconds;
      sampleRateDistribution[s.sampleRateHz] = (sampleRateDistribution[s.sampleRateHz] || 0) + 1;
      const fmtKey = s.format.toUpperCase();
      formatDistribution[fmtKey] = (formatDistribution[fmtKey] || 0) + 1;
      if (s.speakerId) speakers.add(s.speakerId);
    }

    // Scale up for realistic studio metrics
    const scaleFactor = 400;
    return {
      countReal: countReal * scaleFactor + 4820,
      countAi: countAi * scaleFactor + 3120,
      countCloned: countCloned * scaleFactor + 1480,
      countUnknown: countUnknown * scaleFactor + 180,
      totalDurationSec: totalDurationSec * scaleFactor + 96000,
      avgDurationSec: 10.2,
      sampleRateDistribution: {
        16000: 3840 + (sampleRateDistribution[16000] || 0) * scaleFactor,
        24000: 2150 + (sampleRateDistribution[24000] || 0) * scaleFactor,
        44100: 3110 + (sampleRateDistribution[44100] || 0) * scaleFactor,
        48000: 500 + (sampleRateDistribution[48000] || 0) * scaleFactor,
      },
      formatDistribution: {
        WAV: 5600 + (formatDistribution['WAV'] || 0) * scaleFactor,
        MP3: 2400 + (formatDistribution['MP3'] || 0) * scaleFactor,
        FLAC: 1100 + (formatDistribution['FLAC'] || 0) * scaleFactor,
        M4A: 350 + (formatDistribution['M4A'] || 0) * scaleFactor,
        OGG: 150 + (formatDistribution['OGG'] || 0) * scaleFactor,
      },
      speakerCount: speakers.size * 20 + 412,
    };
  }, [samples]);

  // Compute retraining plan from approved sources
  const retrainingPlan: RetrainingDatasetPlan = useMemo(() => {
    const approvedFeedback = feedbackItems.filter((i) => i.status === 'APPROVED').length;
    const approvedHard = hardExamples.filter((e) => e.approvedForRetraining).length;
    const originalCount = 8420;
    const newCount = samples.length * 15;

    return {
      originalSamplesCount: originalCount,
      approvedFeedbackCount: approvedFeedback * 105 + 315,
      hardExamplesCount: approvedHard * 42 + 126,
      newSamplesCount: newCount,
      totalCount: originalCount + approvedFeedback * 105 + 315 + approvedHard * 42 + 126 + newCount,
      classBreakdown: {
        realCount: 4650,
        aiCount: 3100,
        clonedCount: 1651,
      },
      sources: [
        'Original Validated Corpus (ASVspoof & In-The-Wild)',
        'Approved SOC Operator Feedback Queue',
        'Surfaced Hard Examples (Whispered & Noisy Telephony)',
        'Newly Uploaded Verified Recordings',
      ],
      createdDate: new Date().toISOString(),
    };
  }, [feedbackItems, hardExamples, samples]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    };
  }, []);

  // 1. Ingestion Handlers
  const handleAddSamples = (newSamples: AudioSample[]) => {
    setSamples((prev) => [...newSamples, ...prev]);
    // Run quick health check update
    handleRevalidateDataset();
  };

  const handleImportPreloadedDataset = (datasetType: string) => {
    let importedSamples: AudioSample[] = [];

    if (datasetType === 'asvspoof') {
      importedSamples = [
        {
          id: `asv-${Date.now()}-1`,
          name: 'asvspoof_bonafide_human_44k_01.wav',
          sizeBytes: 1540000,
          format: 'wav',
          durationSeconds: 10.5,
          sampleRateHz: 44100,
          channels: 1,
          label: 'REAL',
          speakerId: 'SPK-ASV-101',
          validationStatus: 'VALID',
          issues: [],
          addedAt: new Date().toISOString(),
          snrDb: 28.5,
        },
        {
          id: `asv-${Date.now()}-2`,
          name: 'asvspoof_vocoder_phase_anomaly_02.wav',
          sizeBytes: 1120000,
          format: 'wav',
          durationSeconds: 8.4,
          sampleRateHz: 44100,
          channels: 1,
          label: 'AI_GENERATED',
          speakerId: 'SPK-ASV-SYNTH-04',
          validationStatus: 'VALID',
          issues: [],
          addedAt: new Date().toISOString(),
          snrDb: 24.1,
        },
      ];
    } else if (datasetType === 'in_the_wild') {
      importedSamples = [
        {
          id: `wild-${Date.now()}-1`,
          name: 'in_the_wild_elevenlabs_ceo_clone.mp3',
          sizeBytes: 890000,
          format: 'mp3',
          durationSeconds: 11.2,
          sampleRateHz: 24000,
          channels: 1,
          label: 'CLONED',
          speakerId: 'SPK-WILD-CEO-01',
          validationStatus: 'VALID',
          issues: [],
          addedAt: new Date().toISOString(),
          snrDb: 26.0,
        },
      ];
    } else {
      importedSamples = [
        {
          id: `reg-${Date.now()}-1`,
          name: 'indian_regional_tamil_telephony_real.wav',
          sizeBytes: 1650000,
          format: 'wav',
          durationSeconds: 12.0,
          sampleRateHz: 44100,
          channels: 1,
          label: 'REAL',
          speakerId: 'SPK-TAMIL-02',
          validationStatus: 'VALID',
          issues: [],
          addedAt: new Date().toISOString(),
          snrDb: 31.0,
        },
      ];
    }

    setSamples((prev) => [...importedSamples, ...prev]);
  };

  const handleUpdateSampleLabel = (sampleId: string, newLabel: SampleLabel) => {
    setSamples((prev) =>
      prev.map((s) => {
        if (s.id === sampleId) {
          const issues = s.issues.filter((iss) => !iss.includes('label'));
          return {
            ...s,
            label: newLabel,
            issues,
            validationStatus: issues.length === 0 ? 'VALID' : s.validationStatus,
          };
        }
        return s;
      })
    );
  };

  const handleBulkUpdateLabels = (sampleIds: string[], newLabel: SampleLabel) => {
    const idSet = new Set(sampleIds);
    setSamples((prev) =>
      prev.map((s) => {
        if (idSet.has(s.id)) {
          const issues = s.issues.filter((iss) => !iss.includes('label'));
          return {
            ...s,
            label: newLabel,
            issues,
            validationStatus: issues.length === 0 ? 'VALID' : s.validationStatus,
          };
        }
        return s;
      })
    );
  };

  const handleRemoveSample = (sampleId: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== sampleId));
  };

  const handleBulkRemoveSamples = (sampleIds: string[]) => {
    const idSet = new Set(sampleIds);
    setSamples((prev) => prev.filter((s) => !idSet.has(s.id)));
  };

  // 2. Health & Remediation Handlers
  const handleRevalidateDataset = () => {
    setIsValidating(true);
    setTimeout(() => {
      const remainingUnknown = samples.filter((s) => s.label === 'UNKNOWN').length;
      const remainingShort = samples.filter((s) => s.durationSeconds < 1.0).length;

      let score = 88;
      const updatedIssues: DatasetHealthIssue[] = [...healthReport.issues];

      if (remainingUnknown === 0) {
        score += 4;
      }
      if (remainingShort === 0) {
        score += 4;
      }

      setHealthReport({
        ...healthReport,
        score: Math.min(98, score),
        status: score >= 85 ? 'EXCELLENT' : 'GOOD',
        lastChecked: new Date().toISOString(),
      });
      setIsValidating(false);
    }, 400);
  };

  const handleApplyRemediation = (issue: DatasetHealthIssue) => {
    if (issue.actionType === 'FILTER_OUT') {
      // Filter out short duration or corrupted
      setSamples((prev) => prev.filter((s) => s.durationSeconds >= 1.0));
      setHealthReport((prev) => ({
        ...prev,
        score: Math.min(100, prev.score + 6),
        issues: prev.issues.filter((i) => i.id !== issue.id),
      }));
    } else if (issue.actionType === 'REMOVE_DUPLICATES') {
      // Remove duplicates
      setSamples((prev) => prev.filter((s) => !s.name.includes('_dup')));
      setHealthReport((prev) => ({
        ...prev,
        score: Math.min(100, prev.score + 5),
        issues: prev.issues.filter((i) => i.id !== issue.id),
      }));
    } else if (issue.actionType === 'BALANCE_AUGMENTATION') {
      // Enable augmentation in training configuration
      setTrainingConfig((prev) => ({
        ...prev,
        augmentation: {
          ...prev.augmentation,
          enabled: true,
          strength: 'HIGH',
        },
      }));
      setHealthReport((prev) => ({
        ...prev,
        score: Math.min(100, prev.score + 5),
        issues: prev.issues.filter((i) => i.id !== issue.id),
      }));
    } else if (issue.actionType === 'LABEL_UNKNOWN') {
      // Auto-label remaining unknown as REAL or review
      setSamples((prev) =>
        prev.map((s) => (s.label === 'UNKNOWN' ? { ...s, label: 'REAL', validationStatus: 'VALID', issues: [] } : s))
      );
      setHealthReport((prev) => ({
        ...prev,
        score: Math.min(100, prev.score + 4),
        issues: prev.issues.filter((i) => i.id !== issue.id),
      }));
    }
  };

  // 3. Training Run Handlers
  const handleStartTrainingRun = () => {
    if (isTrainingActive) return;

    const newRunId = `run-${Date.now().toString().slice(-8)}`;
    const nextVersionNum = `v1.${modelVersions.length}`;
    const newVersionName = `VoiceShield ${nextVersionNum}`;

    const newRun: TrainingRun = {
      id: newRunId,
      runName: `${newVersionName} Optimization Run`,
      modelVersion: newVersionName,
      datasetId: `DS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-V${modelVersions.length + 1}`,
      datasetSize: liveDistribution.countReal + liveDistribution.countAi + liveDistribution.countCloned,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: 'TRAINING',
      currentEpoch: 1,
      totalEpochs: trainingConfig.epochs,
      progressPct: 4,
      currentStage: 'Feature Extraction & Waveform Normalization',
      metricsHistory: [
        {
          epoch: 1,
          trainLoss: 0.69,
          valLoss: 0.65,
          trainAcc: 62.4,
          valAcc: 65.8,
          learningRate: trainingConfig.learningRate,
          timeElapsedSec: 5,
        },
      ],
      config: trainingConfig,
      logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'STAGE',
          stage: 'INIT',
          message: `Initializing training run on ${trainingConfig.architecture} with ${trainingConfig.epochs} epochs.`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          stage: 'DATASET',
          message: `Loaded ${samples.length} audio recordings (Speaker-disjoint partitioning active).`,
        },
      ],
    };

    setCurrentRun(newRun);
    setIsTrainingActive(true);
    setIsPaused(false);
    setActiveTab('pipeline');
    setPipelineStage('training');

    // Launch simulation interval
    let currentEpoch = 1;
    let progress = 4;
    let elapsed = 5;

    trainingIntervalRef.current = setInterval(() => {
      currentEpoch++;
      elapsed += 8;
      progress = Math.min(100, Math.round((currentEpoch / trainingConfig.epochs) * 100));

      // Realistic learning curve
      const trainLoss = Math.max(0.08, Number((0.69 * Math.exp(-0.11 * currentEpoch) + Math.random() * 0.02).toFixed(3)));
      const valLoss = Math.max(0.14, Number((0.65 * Math.exp(-0.09 * currentEpoch) + Math.random() * 0.03).toFixed(3)));
      const trainAcc = Math.min(98.5, Number((62 + 35 * (1 - Math.exp(-0.14 * currentEpoch)) + (Math.random() - 0.5)).toFixed(1)));
      const valAcc = Math.min(95.4, Number((65 + 29 * (1 - Math.exp(-0.12 * currentEpoch)) + (Math.random() - 0.5)).toFixed(1)));

      setCurrentRun((prev) => {
        if (!prev) return null;

        const newMetric = {
          epoch: currentEpoch,
          trainLoss,
          valLoss,
          trainAcc,
          valAcc,
          learningRate: trainingConfig.learningRate * Math.pow(0.95, currentEpoch),
          timeElapsedSec: elapsed,
        };

        const newStage =
          currentEpoch >= trainingConfig.epochs
            ? 'Training Completed & Model Saved'
            : currentEpoch > trainingConfig.epochs / 2
            ? `Checkpoint Validation: Epoch ${currentEpoch}/${trainingConfig.epochs}`
            : `Batch Optimization: Epoch ${currentEpoch}/${trainingConfig.epochs}`;

        const newLogs = [...prev.logs];
        if (currentEpoch % 5 === 0 || currentEpoch === trainingConfig.epochs) {
          newLogs.push({
            id: `log-${Date.now()}-${currentEpoch}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'INFO',
            stage: 'EPOCH',
            message: `Epoch ${currentEpoch}/${trainingConfig.epochs}: val_loss = ${valLoss}, val_acc = ${valAcc}%`,
          });
        }

        return {
          ...prev,
          currentEpoch,
          progressPct: progress,
          durationSeconds: elapsed,
          currentStage: newStage,
          metricsHistory: [...prev.metricsHistory, newMetric],
          logs: newLogs,
        };
      });

      // Completion condition
      if (currentEpoch >= trainingConfig.epochs) {
        clearInterval(trainingIntervalRef.current);
        setIsTrainingActive(false);

        // Generate final evaluation
        const finalEval = {
          accuracy: 94.8,
          precision: 94.2,
          recall: 95.1,
          f1Score: 94.6,
          rocAuc: 0.985,
          falsePositiveRate: 3.4,
          falseNegativeRate: 4.9,
          evaluatedAt: new Date().toISOString(),
          testSetSize: 1450,
          confusionMatrix: {
            actualRealPredictedReal: 698,
            actualRealPredictedFake: 25,
            actualFakePredictedReal: 35,
            actualFakePredictedFake: 692,
            actualRealTotal: 723,
            actualFakeTotal: 727,
          },
        };

        setCurrentEvaluation(finalEval);

        // Add to model versions catalog
        const publishedVersion: ModelVersionItem = {
          version: newVersionName,
          releaseName: 'Retrained Model (Continuous Learning)',
          trainingDate: new Date().toISOString().slice(0, 10),
          datasetSize: liveDistribution.countReal + liveDistribution.countAi + liveDistribution.countCloned,
          datasetVersion: `DS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-V${modelVersions.length + 1}`,
          accuracy: 94.8,
          precision: 94.2,
          recall: 95.1,
          f1Score: 94.6,
          falsePositiveRate: 3.4,
          falseNegativeRate: 4.9,
          trainingDurationSec: elapsed,
          architecture: ARCHITECTURE_LABEL_MAP[trainingConfig.architecture] || trainingConfig.architecture,
          isCurrentProduction: true,
          tags: ['Retrained', 'Production Active', 'Low FPR'],
        };

        setModelVersions((prev) => [
          publishedVersion,
          ...prev.map((v) => ({ ...v, isCurrentProduction: false })),
        ]);
        setActiveModelVersion(publishedVersion.version);

        setCurrentRun((prev) => (prev ? { ...prev, status: 'COMPLETED', finalEvaluation: finalEval } : null));

        // Mark completed stages
        setCompletedStages((prev) => [
          ...new Set([...prev, 'training' as PipelineStage, 'evaluation' as PipelineStage]),
        ]);
        setPipelineStage('evaluation');
      }
    }, 600);
  };

  const handlePauseResumeTraining = () => {
    if (isPaused) {
      setIsPaused(false);
      // Resume logic
    } else {
      setIsPaused(true);
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    }
  };

  const handleCancelTraining = () => {
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    setIsTrainingActive(false);
    setIsPaused(false);
    if (currentRun) {
      setCurrentRun({ ...currentRun, status: 'CANCELLED', currentStage: 'Run cancelled by user.' });
    }
  };

  // 4. Test Model & Feedback Handlers
  const handleTestAudio = async (
    target: File | { name: string; duration: number; isFake: boolean }
  ): Promise<TestPrediction> => {
    const isFake =
      'isFake' in target
        ? target.isFake
        : target.name.toLowerCase().includes('clone') ||
          target.name.toLowerCase().includes('synth') ||
          target.name.toLowerCase().includes('eleven');

    const duration = 'duration' in target ? target.duration : 9.5;
    const name = 'name' in target ? target.name : 'uploaded_sample.wav';

    // Simulate inference latency
    await new Promise((res) => setTimeout(res, 350));

    const confidence = isFake ? 93.4 : 91.8;
    const verdict: TestPrediction['verdict'] = isFake
      ? 'LIKELY_AI_GENERATED'
      : 'LIKELY_REAL';

    return {
      id: `pred-${Date.now()}`,
      sampleName: name,
      durationSeconds: duration,
      verdict,
      confidenceScore: confidence,
      confidenceInterval: [confidence - 4, Math.min(99, confidence + 3)],
      modelVersion: activeModelVersion,
      processingTimeMs: 42,
      detectedCues: isFake
        ? [
            'Neural vocoder harmonic phase cancellation in 4–8 kHz band',
            'Absence of involuntary physiological respiratory inhalation pauses',
            'Suppressed pitch micro-perturbations (<0.18% glottal jitter)',
          ]
        : [
            'Natural glottal jitter (0.84%) within organic biological envelope',
            'Organic pre-phonation breath intake detected',
            'Full acoustic harmonic bandwidth preserved up to 14.8 kHz',
          ],
      timestamp: new Date().toISOString(),
    };
  };

  const handleSubmitFeedback = (feedback: {
    predictionId: string;
    testSampleName: string;
    userVerdict: HumanVerdict;
    suggestedLabel?: SampleLabel;
    category?: FeedbackIssueCategory;
    notes?: string;
  }) => {
    const newItem: HumanFeedbackItem = {
      id: `fb-${Date.now()}`,
      predictionId: feedback.predictionId,
      testSampleName: feedback.testSampleName,
      modelPrediction: 'LIKELY_AI_GENERATED',
      confidence: 72.0,
      userVerdict: feedback.userVerdict,
      suggestedLabel: feedback.suggestedLabel,
      category: feedback.category,
      notes: feedback.notes,
      submittedAt: new Date().toISOString(),
      submittedBy: 'SOC Operator',
      status: 'PENDING_REVIEW',
      modelVersion: activeModelVersion,
    };

    setFeedbackItems((prev) => [newItem, ...prev]);
  };

  const handleApproveFeedback = (id: string) => {
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'APPROVED',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'ML Safety Officer',
            }
          : item
      )
    );
  };

  const handleRejectFeedback = (id: string) => {
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'REJECTED',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'ML Safety Officer',
            }
          : item
      )
    );
  };

  const handleChangeFeedbackLabel = (id: string, newLabel: SampleLabel) => {
    setFeedbackItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, suggestedLabel: newLabel } : item))
    );
  };

  const handleToggleHardExample = (id: string) => {
    setHardExamples((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, approvedForRetraining: !item.approvedForRetraining }
          : item
      )
    );
  };

  const handleStageAllHardExamples = () => {
    setHardExamples((prev) => prev.map((item) => ({ ...item, approvedForRetraining: true })));
  };

  const ARCHITECTURE_LABEL_MAP: Record<string, string> = {
    RAWNET3_ECAPA: 'RawNet3 + ECAPA-TDNN Dual-Branch',
    AASIST_V2: 'AASIST-v2 Graph Attention',
    RESNET_SE: 'ResNet-SE 34 Audio',
    LIGHT_CNN: 'Light-CNN 29 Audio',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Summary Cards and Model Status */}
      <TrainingOverview
        totalSamples={liveDistribution.countReal + liveDistribution.countAi + liveDistribution.countCloned}
        realSamples={liveDistribution.countReal}
        aiSamples={liveDistribution.countAi + liveDistribution.countCloned}
        totalDurationHours={liveDistribution.totalDurationSec / 3600}
        currentModelVersion={activeModelVersion}
        lastTrainingDate={modelVersions[0]?.trainingDate || '2026-09-15'}
        validationAccuracy={currentEvaluation.accuracy}
        f1Score={currentEvaluation.f1Score}
        falsePositiveRate={currentEvaluation.falsePositiveRate}
        falseNegativeRate={currentEvaluation.falseNegativeRate}
        modelStatus={currentRun ? currentRun.status : 'READY'}
        onStartTraining={() => {
          setActiveTab('pipeline');
          setPipelineStage('training');
          handleStartTrainingRun();
        }}
        isTrainingActive={isTrainingActive}
      />

      {/* 2. Studio Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full p-2 font-mono text-xs overflow-x-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Pipeline Workflow</span>
        </button>

        <button
          onClick={() => setActiveTab('test_model')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'test_model'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Test Your Model</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback_queue')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feedback_queue'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback Review Queue</span>
          {feedbackItems.filter((i) => i.status === 'PENDING_REVIEW').length > 0 && (
            <span className="text-[10px] bg-[#ff00c1] text-white font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,0,193,0.5)]">
              {feedbackItems.filter((i) => i.status === 'PENDING_REVIEW').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('hard_examples')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'hard_examples'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Hard Examples</span>
          <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
            {hardExamples.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('model_versions')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'model_versions'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Model Versions</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-full font-bold font-sans text-xs tracking-wider transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Training History & Logs</span>
        </button>
      </div>

      {/* TAB 1: Main Pipeline Workflow */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Interactive 7-Stage Pipeline Stepper */}
          <PipelineStepper
            currentStage={pipelineStage}
            onSelectStage={(stage) => setPipelineStage(stage)}
            completedStages={completedStages}
            isTrainingActive={isTrainingActive}
          />

          {/* STAGE 1: Dataset Upload & Management */}
          {pipelineStage === 'dataset' && (
            <div className="space-y-5">
              <DatasetUploader
                onAddSamples={handleAddSamples}
                onImportPreloadedDataset={handleImportPreloadedDataset}
              />
              <DatasetDistributionView distribution={liveDistribution} />
              <DatasetManager
                samples={samples}
                onUpdateSampleLabel={handleUpdateSampleLabel}
                onBulkUpdateLabels={handleBulkUpdateLabels}
                onRemoveSample={handleRemoveSample}
                onBulkRemoveSamples={handleBulkRemoveSamples}
              />
            </div>
          )}

          {/* STAGE 2: Validation & Health Check */}
          {pipelineStage === 'validation' && (
            <div className="space-y-5">
              <DatasetHealth
                report={healthReport}
                onApplyRemediation={handleApplyRemediation}
                onRevalidate={handleRevalidateDataset}
                isValidating={isValidating}
              />
              <DatasetDistributionView distribution={liveDistribution} />
            </div>
          )}

          {/* STAGE 3: Feature Extraction */}
          {pipelineStage === 'features' && (
            <FeatureConfigurationView
              config={featureConfig}
              onChangeConfig={(newCfg) => setFeatureConfig(newCfg)}
            />
          )}

          {/* STAGE 4: Training Configuration & Live Run */}
          {pipelineStage === 'training' && (
            <div className="space-y-5">
              {isTrainingActive || currentRun ? (
                <TrainingProgress
                  currentRun={currentRun}
                  onPauseResume={handlePauseResumeTraining}
                  onCancel={handleCancelTraining}
                  isPaused={isPaused}
                />
              ) : null}

              <TrainingConfigurationView
                config={trainingConfig}
                onChangeConfig={(newCfg) => setTrainingConfig(newCfg)}
                datasetSize={liveDistribution.countReal + liveDistribution.countAi + liveDistribution.countCloned}
                onStartTraining={handleStartTrainingRun}
                isTrainingActive={isTrainingActive}
              />
            </div>
          )}

          {/* STAGE 5: Model Evaluation */}
          {pipelineStage === 'evaluation' && (
            <ModelEvaluationView
              evaluation={currentEvaluation}
              modelVersion={activeModelVersion}
            />
          )}

          {/* STAGE 6: Human Feedback Review */}
          {pipelineStage === 'feedback' && (
            <FeedbackQueue
              items={feedbackItems}
              onApproveItem={handleApproveFeedback}
              onRejectItem={handleRejectFeedback}
              onChangeLabel={handleChangeFeedbackLabel}
            />
          )}

          {/* STAGE 7: Retraining Wizard */}
          {pipelineStage === 'retraining' && (
            <RetrainingWizard
              plan={retrainingPlan}
              onLaunchRetraining={(plan) => {
                handleStartTrainingRun();
              }}
              onCancel={() => setPipelineStage('dataset')}
              isTrainingActive={isTrainingActive}
            />
          )}
        </div>
      )}

      {/* TAB 2: Test Model */}
      {activeTab === 'test_model' && (
        <ModelTester
          currentModelVersion={activeModelVersion}
          onTestAudio={handleTestAudio}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* TAB 3: Feedback Queue */}
      {activeTab === 'feedback_queue' && (
        <FeedbackQueue
          items={feedbackItems}
          onApproveItem={handleApproveFeedback}
          onRejectItem={handleRejectFeedback}
          onChangeLabel={handleChangeFeedbackLabel}
        />
      )}

      {/* TAB 4: Hard Examples */}
      {activeTab === 'hard_examples' && (
        <HardExamples
          examples={hardExamples}
          onToggleApproval={handleToggleHardExample}
          onIncludeAllInRetraining={handleStageAllHardExamples}
        />
      )}

      {/* TAB 5: Model Versions & Comparison */}
      {activeTab === 'model_versions' && (
        <ModelVersions
          versions={modelVersions}
          activeVersion={activeModelVersion}
          onSelectActiveVersion={(ver) => setActiveModelVersion(ver)}
        />
      )}

      {/* TAB 6: Training History & Logs */}
      {activeTab === 'history' && (
        <TrainingHistory runs={trainingRuns} />
      )}
    </div>
  );
};
