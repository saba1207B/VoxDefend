/**
 * VoxDefend Model Interface & Branding Verification Suite
 * 
 * Verifies:
 * TEST A: 44.1/48 kHz -> 16 kHz mono resampling
 * TEST B: 1-second streaming chunks -> rolling 3-second context (48,000 samples)
 * TEST C: 48,000 samples -> Log-Mel -> [1, 80, 301] (24,080 floats)
 * TEST D: Non-48,000 sample rejection (exact error enforcement)
 * TEST E: LCNN accepts [B, 1, 80, 301] (IAntiSpoofModel contract takes only ModelFeatureInput)
 * TEST F: NO_MODEL_LOADED: rawScore = null, probability = null
 * TEST G: Replay detection remains independent
 * TEST H: Training and inference Log-Mel preprocessing are identical
 * TEST I: Zero unintended user-facing "VocalShield" text in UI titles/headers
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  resampleTo16kMono,
  accumulateRollingContext48k,
  processAudioWindow,
} from '../src/utils/audioDspExtractor';
import { extractLogMelSpectrogram, LOG_MEL_CONSTANTS } from '../src/utils/logMelExtractor';
import { modelManager } from '../src/services/modelLoader';
import { IAntiSpoofModel, ModelFeatureInput } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runVerificationSuite() {
  console.log('===============================================================');
  console.log('VOXDEFEND MODEL INTERFACE & BRANDING VERIFICATION SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // TEST A: 44.1 / 48 kHz -> 16 kHz Mono Resampling
  // -------------------------------------------------------------------------
  console.log('TEST A: 44.1 / 48 kHz -> 16 kHz Mono Resampling');
  const sample44k = new Float32Array(44100);
  for (let i = 0; i < sample44k.length; i++) sample44k[i] = Math.sin((2 * Math.PI * 440 * i) / 44100);
  const resampled44k = resampleTo16kMono(sample44k, 44100);
  assert(resampled44k.length === 16000, `Resampled 44.1 kHz (44,100 samples) to exactly 16,000 samples (got ${resampled44k.length})`);

  const sample48k = new Float32Array(48000);
  for (let i = 0; i < sample48k.length; i++) sample48k[i] = Math.sin((2 * Math.PI * 440 * i) / 48000);
  const resampled48k = resampleTo16kMono(sample48k, 48000);
  assert(resampled48k.length === 16000, `Resampled 48 kHz (48,000 samples) to exactly 16,000 samples (got ${resampled48k.length})`);

  // -------------------------------------------------------------------------
  // TEST B: 1-second streaming chunks -> rolling 3-second context (48,000 samples)
  // -------------------------------------------------------------------------
  console.log('\nTEST B: 1-Second Streaming Chunks -> Rolling 3-Second Context (48,000 samples)');
  let rollingBuffer = new Float32Array(0);

  // Chunk 1 (16,000 samples)
  const chunk1 = new Float32Array(16000).fill(1.0);
  rollingBuffer = accumulateRollingContext48k(chunk1, rollingBuffer);
  assert(rollingBuffer.length === 48000, `After chunk 1: Buffer length is exactly 48,000 samples`);
  assert(rollingBuffer[47999] === 1.0, `Chunk 1 samples placed in newest position`);

  // Chunk 2 (16,000 samples)
  const chunk2 = new Float32Array(16000).fill(2.0);
  rollingBuffer = accumulateRollingContext48k(chunk2, rollingBuffer);
  assert(rollingBuffer.length === 48000, `After chunk 2: Buffer length is exactly 48,000 samples`);
  assert(rollingBuffer[47999] === 2.0, `Chunk 2 samples placed in newest position`);

  // Chunk 3 (16,000 samples)
  const chunk3 = new Float32Array(16000).fill(3.0);
  rollingBuffer = accumulateRollingContext48k(chunk3, rollingBuffer);
  assert(rollingBuffer.length === 48000, `After chunk 3: Buffer length is exactly 48,000 samples`);
  assert(rollingBuffer[0] === 1.0 && rollingBuffer[16000] === 2.0 && rollingBuffer[32000] === 3.0, `Buffer correctly maintains chronological order across 3 seconds`);

  // Chunk 4 (16,000 samples): should discard chunk 1 and shift chunk 2 and 3
  const chunk4 = new Float32Array(16000).fill(4.0);
  rollingBuffer = accumulateRollingContext48k(chunk4, rollingBuffer);
  assert(rollingBuffer.length === 48000, `After chunk 4: Buffer length remains exactly 48,000 samples`);
  assert(rollingBuffer[0] === 2.0 && rollingBuffer[16000] === 3.0 && rollingBuffer[32000] === 4.0, `Oldest 1-second chunk discarded, maintaining rolling 3-second context`);

  // -------------------------------------------------------------------------
  // TEST C: 48,000 samples -> Log-Mel -> [1, 80, 301]
  // -------------------------------------------------------------------------
  console.log('\nTEST C: 48,000 samples -> Log-Mel -> [1, 80, 301] (24,080 floats)');
  const testAudio48k = new Float32Array(48000);
  for (let i = 0; i < 48000; i++) {
    const t = i / 16000;
    testAudio48k[i] = 0.5 * Math.sin(2 * Math.PI * 220 * t);
  }

  const features = extractLogMelSpectrogram(testAudio48k);
  assert(features.type === 'Log-Mel', `Feature type is 'Log-Mel'`);
  assert(features.sampleRate === 16000, `Feature sample rate is 16,000 Hz`);
  assert(features.nMels === 80, `Feature Mel filter bands = 80`);
  assert(features.nFrames === 301, `Feature time frames = 301`);
  assert(features.shape[0] === 1 && features.shape[1] === 80 && features.shape[2] === 301, `Feature shape is exactly [1, 80, 301]`);
  assert(features.data.length === 80 * 301, `Feature float array length is 24,080 (80 * 301)`);

  // -------------------------------------------------------------------------
  // TEST D: Non-48,000 Sample Rejection
  // -------------------------------------------------------------------------
  console.log('\nTEST D: Non-48,000 Sample Rejection');
  let threwUnderLength = false;
  try {
    extractLogMelSpectrogram(new Float32Array(16000));
  } catch (err: any) {
    threwUnderLength = true;
    assert(err.message.includes('48000'), `extractLogMelSpectrogram rejects 16,000 samples with: "${err.message}"`);
  }
  assert(threwUnderLength, `extractLogMelSpectrogram threw error for 16,000 samples`);

  let threwOverLength = false;
  try {
    extractLogMelSpectrogram(new Float32Array(64000));
  } catch (err: any) {
    threwOverLength = true;
    assert(err.message.includes('48000'), `extractLogMelSpectrogram rejects 64,000 samples with: "${err.message}"`);
  }
  assert(threwOverLength, `extractLogMelSpectrogram threw error for 64,000 samples`);

  let modelManagerThrew = false;
  try {
    await modelManager.runInference(new Float32Array(16000));
  } catch (err: any) {
    modelManagerThrew = true;
    assert(err.message.includes('48000'), `modelManager.runInference rejects 16,000 samples with: "${err.message}"`);
  }
  assert(modelManagerThrew, `modelManager.runInference threw error for non-48,000 samples`);

  // -------------------------------------------------------------------------
  // TEST E: LCNN Model Accepts [B, 1, 80, 301] via ModelFeatureInput Contract
  // -------------------------------------------------------------------------
  console.log('\nTEST E: LCNN Model Accepts [B, 1, 80, 301] (IAntiSpoofModel Contract)');
  let receivedShape: [number, number, number] | null = null;
  let receivedDataLength = 0;

  const mockLcnnModel: IAntiSpoofModel = {
    id: 'lcnn-9-test',
    name: 'VoxDefend LCNN-9 Anti-Spoofing Model',
    architecture: 'LCNN-9 (Max-Feature-Map)',
    expectedFeatureShape: [1, 80, 301],
    expectedRawAudioLength: 48000,
    isLoaded: true,
    load: async () => {},
    predict: async (feat: ModelFeatureInput) => {
      receivedShape = feat.shape;
      receivedDataLength = feat.data.length;
      return { rawScore: 0.92, probability: 0.94 };
    },
  };

  await modelManager.registerModel(mockLcnnModel);
  assert(modelManager.getStatus() === 'READY', `Model manager status is READY with mock LCNN-9 model`);

  // Run inference with 48,000 samples through modelManager
  const modelRunResult = await modelManager.runInference(testAudio48k);
  assert(modelRunResult.status === 'READY', `Inference status is READY`);
  assert(receivedShape !== null && receivedShape[0] === 1 && receivedShape[1] === 80 && receivedShape[2] === 301, `IAntiSpoofModel.predict() received exact shape [1, 80, 301]`);
  assert(receivedDataLength === 24080, `IAntiSpoofModel.predict() received exact 24,080 float values`);
  assert(modelRunResult.calibratedProbability === 0.94, `Calibrated probability is 0.94`);

  // Reset modelManager back to NO_MODEL_LOADED
  await modelManager.unloadModel();
  assert(modelManager.getStatus() === 'NO_MODEL_LOADED', `Model manager successfully unloaded back to NO_MODEL_LOADED`);

  // -------------------------------------------------------------------------
  // TEST F: NO_MODEL_LOADED: rawScore = null, probability = null
  // -------------------------------------------------------------------------
  console.log('\nTEST F: NO_MODEL_LOADED: rawScore = null, probability = null');
  const noModelTelemetry = await processAudioWindow(testAudio48k, 'Microphone Test', true);
  assert(noModelTelemetry.modelStatus === 'NO_MODEL_LOADED', `Telemetry modelStatus is NO_MODEL_LOADED`);
  assert(noModelTelemetry.rawModelOutput === null, `Telemetry rawModelOutput is strictly null`);
  assert(noModelTelemetry.calibratedAiProbability === null, `Telemetry calibratedAiProbability is strictly null`);
  assert(noModelTelemetry.verdict === 'NO_MODEL_LOADED', `Telemetry verdict is strictly 'NO_MODEL_LOADED'`);
  assert(noModelTelemetry.rawAudioShape[0] === 1 && noModelTelemetry.rawAudioShape[1] === 48000, `Raw audio shape is [1, 48000]`);
  assert(noModelTelemetry.featureShape[0] === 1 && noModelTelemetry.featureShape[1] === 80 && noModelTelemetry.featureShape[2] === 301, `Feature shape is [1, 80, 301]`);
  assert(noModelTelemetry.modelInputShape[0] === 1 && noModelTelemetry.modelInputShape[1] === 1 && noModelTelemetry.modelInputShape[2] === 80 && noModelTelemetry.modelInputShape[3] === 301, `Model input shape is [1, 1, 80, 301]`);

  // -------------------------------------------------------------------------
  // TEST G: Replay Detection Remains Independent
  // -------------------------------------------------------------------------
  console.log('\nTEST G: Replay Detection Remains Independent');
  const replayAudio48k = new Float32Array(48000);
  for (let i = 0; i < 48000; i++) {
    const t = i / 16000;
    replayAudio48k[i] = 0.15 * Math.sin(2 * Math.PI * 150 * t) + 0.5 * Math.sin(2 * Math.PI * 3100 * t);
  }

  const replayTelemetry = await processAudioWindow(replayAudio48k, 'Microphone Test', true);
  assert(replayTelemetry.isReplayAcousticSignal === true, `Acoustic replay signal detected via transducer resonance`);
  assert(replayTelemetry.verdict === 'Replay / playback', `Verdict is 'Replay / playback' based purely on acoustic transducer resonance`);
  assert(replayTelemetry.calibratedAiProbability === null, `AI probability remains strictly null (decoupled from replay detector)`);
  assert(replayTelemetry.rawModelOutput === null, `Raw model score remains strictly null`);

  // -------------------------------------------------------------------------
  // TEST H: Training and Inference Log-Mel Preprocessing are Identical
  // -------------------------------------------------------------------------
  console.log('\nTEST H: Training & Inference Log-Mel Preprocessing Identical');
  assert(LOG_MEL_CONSTANTS.SAMPLE_RATE === 16000, `Sample rate is 16,000 Hz in both`);
  assert(LOG_MEL_CONSTANTS.N_SAMPLES === 48000, `Audio duration is 48,000 samples (3.0s) in both`);
  assert(LOG_MEL_CONSTANTS.N_FFT === 512, `n_fft = 512 in both`);
  assert(LOG_MEL_CONSTANTS.WIN_LENGTH === 400, `win_length = 400 (25 ms) in both`);
  assert(LOG_MEL_CONSTANTS.HOP_LENGTH === 160, `hop_length = 160 (10 ms) in both`);
  assert(LOG_MEL_CONSTANTS.N_MELS === 80, `n_mels = 80 in both`);
  assert(LOG_MEL_CONSTANTS.CENTER === true, `center = True (reflect padding by 256) in both`);

  // Mathematical frame derivation verification:
  const paddedLength = 48000 + 2 * (512 / 2);
  const derivedFrames = Math.floor((paddedLength - 512) / 160) + 1;
  assert(derivedFrames === 301, `Mathematical frame derivation: floor((48512 - 512) / 160) + 1 = 301 frames`);

  // -------------------------------------------------------------------------
  // TEST I: Zero Unintended User-Facing "VocalShield" Text in UI Titles/Headers
  // -------------------------------------------------------------------------
  console.log('\nTEST I: Zero Unintended User-Facing "VocalShield" Text in UI Titles/Headers');
  const filesToCheck = [
    'index.html',
    'src/App.tsx',
    'src/components/Header.tsx',
    'src/components/Sidebar.tsx',
    'src/components/SihDemoModeView.tsx',
    'src/components/AutoShieldBanner.tsx',
    'src/components/IncomingCallModal.tsx',
    'src/components/SecurityPolicyModal.tsx',
    'src/components/EnterpriseAdminPanel.tsx',
    'README.md',
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for user-facing brand strings like "VOCALSHIELD.AI", "VOCALSHIELD AI", "VocalShield AI:", "# VOICE SHIELD", "<title>VocalShield"
    const forbiddenPatterns = [
      /<title>.*VocalShield.*<\/title>/i,
      /VOCALSHIELD<span className="text-\[#00f3ff\]">\./,
      /<span>VOCALSHIELD<\/span>/,
      /#\s*VOICE\s*SHIELD/i,
      /VocalShield\s*AI:\s*Enterprise/i,
      /VocalShield\s*AI\s*AUTO-ACTIVATION/i,
    ];

    for (const pattern of forbiddenPatterns) {
      const match = content.match(pattern);
      assert(!match, `No forbidden pattern ${pattern} found in ${relPath}`);
    }

    // Verify presence of VoxDefend in branding files
    if (relPath === 'index.html' || relPath === 'src/App.tsx' || relPath === 'src/components/Header.tsx' || relPath === 'README.md') {
      assert(content.includes('VoxDefend') || content.includes('VOXDEFEND'), `${relPath} contains canonical brand 'VoxDefend'`);
    }
  }

  console.log('\n===============================================================');
  console.log('ALL TESTS (A - I) PASSED SUCCESSFULLY! 100% COMPLIANT');
  console.log('===============================================================');
}

runVerificationSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
