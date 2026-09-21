/**
 * VocalShield AI - AI Training Studio Type Definitions
 * Complete ML Lifecycle: Dataset -> Validation -> Feature Extraction -> Training -> Evaluation -> Feedback -> Retraining
 */

export type AudioFormat = 'wav' | 'mp3' | 'flac' | 'm4a' | 'ogg';

export type SampleLabel = 'REAL' | 'AI_GENERATED' | 'CLONED' | 'UNKNOWN';

export type ValidationStatus = 'VALID' | 'WARNING' | 'ERROR' | 'CHECKING';

export interface AudioSample {
  id: string;
  name: string;
  sizeBytes: number;
  format: AudioFormat;
  durationSeconds: number;
  sampleRateHz: number;
  channels: number;
  label: SampleLabel;
  speakerId?: string;
  validationStatus: ValidationStatus;
  issues: string[];
  previewUrl?: string;
  addedAt: string;
  isAugmented?: boolean;
  augmentationType?: string;
  snrDb?: number;
  silenceRatio?: number;
}

export interface DatasetDistribution {
  countReal: number;
  countAi: number;
  countCloned: number;
  countUnknown: number;
  totalDurationSec: number;
  avgDurationSec: number;
  sampleRateDistribution: Record<number, number>; // e.g. { 16000: 450, 44100: 820 }
  formatDistribution: Record<string, number>;     // e.g. { WAV: 800, MP3: 470 }
  speakerCount: number;
}

export type HealthIssueType =
  | 'SHORT_DURATION'
  | 'CORRUPTED'
  | 'DUPLICATE'
  | 'MISSING_LABEL'
  | 'SEVERE_NOISE'
  | 'SILENCE'
  | 'SAMPLE_RATE_MISMATCH'
  | 'CLASS_IMBALANCE'
  | 'SPEAKER_LEAKAGE';

export interface DatasetHealthIssue {
  id: string;
  type: HealthIssueType;
  severity: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  affectedCount: number;
  affectedSampleIds: string[];
  recommendation: string;
  actionLabel?: string;
  actionType?: 'FILTER_OUT' | 'BALANCE_AUGMENTATION' | 'NORMALIZE_SR' | 'LABEL_UNKNOWN' | 'REMOVE_DUPLICATES';
}

export interface DatasetHealthReport {
  score: number; // 0 - 100
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  summary: string;
  issues: DatasetHealthIssue[];
  lastChecked: string;
}

export interface FeatureExtractionConfig {
  extractMfcc: boolean;
  nMfcc: number; // default: 13 (typical range 13-40)
  extractMelSpectrogram: boolean;
  nMels: number; // default: 80 (typical range 40-128)
  extractSpectralCentroid: boolean;
  extractSpectralRolloff: boolean;
  extractZeroCrossingRate: boolean;
  extractPitchF0: boolean;
  extractEnergyRms: boolean;
  extractChroma: boolean;
  extractTemporalFeatures: boolean;
  // Advanced DSP settings
  hopLength: number; // default: 512
  winLength: number; // default: 2048
  fmin: number;      // default: 50 Hz
  fmax: number;      // default: 8000 Hz
}

export type ModelArchitecture =
  | 'RAWNET3_ECAPA'
  | 'AASIST_V2'
  | 'RESNET_SE'
  | 'LIGHT_CNN';

export type OptimizerType = 'AdamW' | 'Adam' | 'SGD' | 'RMSprop';

export interface AugmentationConfig {
  enabled: boolean;
  backgroundNoise: boolean;
  codecCompression: boolean; // Opus / AMR-NB simulation
  pitchVariation: boolean;   // +/- 2 semitones
  speedVariation: boolean;   // 0.9x - 1.1x
  volumeVariation: boolean;  // Gain +/- 6dB
  reverb: boolean;           // Room impulse response
  telephoneBandpass: boolean;// 8kHz bandpass filtering
  strength: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TrainingConfiguration {
  mode: 'QUICK' | 'ADVANCED';
  architecture: ModelArchitecture;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: OptimizerType;
  trainSplit: number; // e.g. 70
  valSplit: number;   // e.g. 15
  testSplit: number;  // e.g. 15
  earlyStoppingPatience: number;
  randomSeed: number;
  speakerDisjointSplit: boolean; // Prevent speaker leakage across splits
  augmentation: AugmentationConfig;
}

export type TrainingRunStatus =
  | 'READY'
  | 'TRAINING'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface EpochMetric {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number; // 0 - 100%
  valAcc: number;   // 0 - 100%
  learningRate: number;
  timeElapsedSec: number;
}

export interface ConfusionMatrixData {
  actualRealPredictedReal: number; // True Negative
  actualRealPredictedFake: number; // False Positive (False Alarm)
  actualFakePredictedReal: number; // False Negative (Missed Attack)
  actualFakePredictedFake: number; // True Positive
  actualRealTotal: number;
  actualFakeTotal: number;
}

export interface ModelEvaluationResult {
  accuracy: number;           // 0 - 100%
  precision: number;          // 0 - 100%
  recall: number;             // 0 - 100%
  f1Score: number;            // 0 - 100%
  rocAuc: number;             // 0.0 - 1.0
  falsePositiveRate: number;  // 0 - 100% (Real flagged as Fake)
  falseNegativeRate: number;  // 0 - 100% (Fake slipped as Real)
  confusionMatrix: ConfusionMatrixData;
  evaluatedAt: string;
  testSetSize: number;
}

export interface TrainingLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'STAGE';
  stage: string;
  message: string;
}

export interface TrainingRun {
  id: string;
  runName: string;
  modelVersion: string;
  datasetId: string;
  datasetSize: number;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  status: TrainingRunStatus;
  currentEpoch: number;
  totalEpochs: number;
  progressPct: number;
  currentStage: string;
  metricsHistory: EpochMetric[];
  finalEvaluation?: ModelEvaluationResult;
  config: TrainingConfiguration;
  logs: TrainingLogEntry[];
  errorMessage?: string;
}

export type PredictionVerdict = 'LIKELY_REAL' | 'LIKELY_AI_GENERATED' | 'UNCERTAIN';

export interface TestPrediction {
  id: string;
  sampleName: string;
  durationSeconds: number;
  verdict: PredictionVerdict;
  confidenceScore: number; // 0 - 100%
  confidenceInterval: [number, number];
  modelVersion: string;
  processingTimeMs: number;
  detectedCues: string[];
  acousticTelemetry?: {
    spectralCentroidHz: number;
    spectralRolloffHz: number;
    glottalJitterPct: number;
    amplitudeShimmerPct: number;
    zeroCrossingRate: number;
  };
  timestamp: string;
}

export type HumanVerdict = 'CORRECT' | 'INCORRECT' | 'NOT_SURE';

export type FeedbackIssueCategory =
  | 'WRONG_CLASSIFICATION'
  | 'AUDIO_QUALITY'
  | 'BACKGROUND_NOISE'
  | 'DATASET_ISSUE'
  | 'OTHER';

export interface HumanFeedbackItem {
  id: string;
  predictionId: string;
  testSampleName: string;
  modelPrediction: PredictionVerdict;
  confidence: number;
  userVerdict: HumanVerdict;
  suggestedLabel?: SampleLabel;
  category?: FeedbackIssueCategory;
  notes?: string;
  submittedAt: string;
  submittedBy: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  reviewedBy?: string;
  modelVersion: string;
}

export type HardExampleReason =
  | 'LOW_CONFIDENCE'
  | 'PREDICTION_ERROR'
  | 'VERSION_DISAGREEMENT'
  | 'HUMAN_FEEDBACK_MISMATCH';

export interface HardExampleItem {
  id: string;
  sampleName: string;
  reason: HardExampleReason;
  confidence: number;
  predictedLabel: string;
  groundTruthOrSuggestedLabel: string;
  modelVersion: string;
  flaggedDate: string;
  audioDurationSec: number;
  approvedForRetraining: boolean;
  notes?: string;
}

export interface ModelVersionItem {
  version: string; // e.g. "VoiceShield v1.2"
  releaseName: string;
  trainingDate: string;
  datasetSize: number;
  datasetVersion: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  trainingDurationSec: number;
  architecture: string;
  isCurrentProduction: boolean;
  tags: string[];
}

export interface RetrainingDatasetPlan {
  originalSamplesCount: number;
  approvedFeedbackCount: number;
  hardExamplesCount: number;
  newSamplesCount: number;
  totalCount: number;
  classBreakdown: {
    realCount: number;
    aiCount: number;
    clonedCount: number;
  };
  sources: string[];
  createdDate: string;
}

export type StudioTabKey =
  | 'pipeline'       // Step-by-step pipeline view (Upload -> Validation -> Config -> Progress -> Eval)
  | 'test_model'     // Test with audio sample & give feedback
  | 'feedback_queue' // Human-in-the-loop review queue
  | 'hard_examples'  // Hard examples collection
  | 'model_versions' // Version catalog & comparison
  | 'history';       // Training history & logs
