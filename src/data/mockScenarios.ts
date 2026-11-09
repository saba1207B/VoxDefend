/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import { CallScenario, IndianLanguageConfig, SecurityPolicy, AuditBlock } from '../types';

export const INDIAN_LANGUAGES: IndianLanguageConfig[] = [
  {
    code: 'en-IN',
    name: 'Indian English (Standard & Corporate)',
    nativeName: 'Indian English',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.0,
      expectedCadence: 'Moderate syllable-timed prosody with retroflex plosives',
      dialectTolerances: 'Standard F0 excursion window: 110Hz - 240Hz',
    },
  },
  {
    code: 'hi-IN',
    name: 'Hindi / Hinglish (Northern & Central)',
    nativeName: 'हिन्दी / Hinglish',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.15,
      expectedCadence: 'Mora-timed rhythm with distinctive aspiration on stop consonants',
      dialectTolerances: 'Aspiration burst tolerance +18ms, pitch range 95Hz - 265Hz',
    },
  },
  {
    code: 'ta-IN',
    name: 'Tamil (Southern Peninsular)',
    nativeName: 'தமிழ்',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.2,
      expectedCadence: 'Rapid vowel duration distinctions (Kuril/Nedil), retroflex lateral flap',
      dialectTolerances: 'Higher phoneme transition speed: 6.8 syl/s threshold',
    },
  },
  {
    code: 'te-IN',
    name: 'Telugu (Deccan / Southern)',
    nativeName: 'తెలుగు',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.12,
      expectedCadence: 'Vocalic ending on every word (Italian of the East cadence)',
      dialectTolerances: 'Sustained terminal vowel pitch envelope tracking',
    },
  },
  {
    code: 'bn-IN',
    name: 'Bengali (Eastern / Kolkata)',
    nativeName: 'বাংলা',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.18,
      expectedCadence: 'Characteristic sentence-final intonation rise and rounded vowel harmony',
      dialectTolerances: 'Waveform envelope calibrated for vowel rounding shifts',
    },
  },
  {
    code: 'mr-IN',
    name: 'Marathi (Western / Maharashtra)',
    nativeName: 'मराठी',
    prosodyCalibration: {
      baselinePitchVariationMultiplier: 1.08,
      expectedCadence: 'Strong rhythmic stress accentuation and retroflex nasalization',
      dialectTolerances: 'Stress peak tolerance +/- 12Hz',
    },
  },
];

export const MOCK_SCENARIOS: CallScenario[] = [
  {
    id: 'scen-cfo-wire-fraud',
    title: 'High-Value RTGS Wire Fraud (Cloned CFO)',
    subtitle: 'Deepfake synthetic voice impersonating CFO demanding immediate ₹4.2 Crore fund transfer',
    type: 'CLONED_ATTACK',
    category: 'FINANCIAL_FRAUD',
    claimedCaller: 'Dr. Arvind Sharma',
    role: 'Chief Financial Officer (CFO)',
    organization: 'Apex Infrastructure Ltd.',
    callerNumber: '+91 98200 45912 (Spoofed)',
    originGeo: 'VoIP Gateway / International SIP Proxy (Frankfurt hop)',
    languageAccent: 'Indian English (Corporate)',
    targetTransaction: 'RTGS Transfer: ₹4,20,00,000 to Offshore Escrow (HDFC Acct ****8912)',
    rawAudioSimulation: {
      duration: 38,
      basePitch: 132,
      jitter: 0.08, // Very low jitter = robotic/neural TTS
      shimmer: 0.6, // Unnaturally low shimmer
      vocoderArtifact: 91,
      phaseArtifact: 88,
      breathPresent: false, // Absence of natural breath pauses
    },
    transcript:
      "Ramesh, listen very carefully. I am in an emergency board meeting in Zurich right now. We have an acquisition closing before the RBI 3:30 PM RTGS cutoff. I need you to immediately execute the four point two crore transfer to the escrow account details I sent over Signal. Do not wait for physical signature verification, we will deal with compliance tomorrow. Push it through the RTGS queue right now!",
    dialogueHistory: [
      {
        speaker: 'Claimed Caller (CFO Dr. Sharma)',
        text: 'Ramesh, listen very carefully. I am in an emergency board meeting in Zurich right now.',
        timestamp: '00:03',
        flaggedThreat: false,
      },
      {
        speaker: 'Treasury Officer (Ramesh)',
        text: 'Sir, good afternoon. Which transfer are you referring to? The audit team requires dual-token signoff for anything over fifty lakhs.',
        timestamp: '00:11',
        flaggedThreat: false,
      },
      {
        speaker: 'Claimed Caller (CFO Dr. Sharma)',
        text: 'I told you this is an acquisition closing before RBI 3:30 PM cutoff! I need you to execute four point two crore immediately. Do not delay this or the penalty is on you!',
        timestamp: '00:22',
        flaggedThreat: true,
      },
      {
        speaker: 'Treasury Officer (Ramesh)',
        text: 'Sir, your voice sounds slightly distant and flat... is your connection stable?',
        timestamp: '00:31',
        flaggedThreat: false,
      },
      {
        speaker: 'Claimed Caller (CFO Dr. Sharma)',
        text: 'It is the hotel Wi-Fi line. Push it through the RTGS queue right now!',
        timestamp: '00:36',
        flaggedThreat: true,
      },
    ],
  },
  {
    id: 'scen-gov-cyber-official',
    title: 'Government Cyber Cell Authority Impersonation',
    subtitle: 'Cloned Ministry official threatening institutional freeze to extract admin access tokens',
    type: 'CLONED_ATTACK',
    category: 'GOV_IMPERSONATION',
    claimedCaller: 'Smt. Priya Raman, IAS',
    role: 'Director, Cyber Security & National Compliance',
    organization: 'AICTE / MeitY Regulatory Directorate',
    callerNumber: '+91 11 2613 1500 (Spoofed Official Landline)',
    originGeo: 'Unregistered SIP Trunk (Asterisk PBX / Singapore IP)',
    languageAccent: 'Hindi / Hinglish (Authoritative)',
    targetTransaction: 'Privileged Root Token Extraction & Student Database Bypass',
    rawAudioSimulation: {
      duration: 32,
      basePitch: 215,
      jitter: 0.12,
      shimmer: 0.8,
      vocoderArtifact: 87,
      phaseArtifact: 84,
      breathPresent: false,
    },
    transcript:
      "Namaste Registrar sahab, main AICTE Cyber Security Cell se Priya Raman bol rahi hoon. Aapke institute ke server par serious data breach detect hua hai. Agle pandrah minute mein agar aapne audit bypass token aur root portal password provide nahi kiya, toh aapka affiliation aur bank accounts immediate effect se freeze ho jayenge. Is baat ko confidential rakhein aur turant OTP share kijiye.",
    dialogueHistory: [
      {
        speaker: 'Claimed Official (Director Priya Raman)',
        text: 'Namaste Registrar sahab, main AICTE Cyber Security Cell se Priya Raman bol rahi hoon.',
        timestamp: '00:04',
        flaggedThreat: false,
      },
      {
        speaker: 'Institute Registrar (Dr. Alok)',
        text: 'Namaskar Ma’am. What breach are you referring to? We had our CERT audit just last month.',
        timestamp: '00:12',
        flaggedThreat: false,
      },
      {
        speaker: 'Claimed Official (Director Priya Raman)',
        text: 'Aapke portal se malicious traffic broadcast ho raha hai. Agle pandrah minute mein root bypass token aur active session OTP share karein warna affiliation freeze hoga.',
        timestamp: '00:23',
        flaggedThreat: true,
      },
      {
        speaker: 'Claimed Official (Director Priya Raman)',
        text: 'Is call ko kisi aur se discuss mat kijiye. Send the OTP code right now.',
        timestamp: '00:30',
        flaggedThreat: true,
      },
    ],
  },
  {
    id: 'scen-genuine-ceo',
    title: 'Authentic Executive Call (Enrolled VIP Voiceprint)',
    subtitle: 'Legitimate routine telephonic update from company CEO with natural biometric match',
    type: 'GENUINE_CALL',
    category: 'ROUTINE_EXECUTIVE',
    claimedCaller: 'Shri Vikram Mehta',
    role: 'Managing Director & CEO',
    organization: 'Apex Infrastructure Ltd.',
    callerNumber: '+91 98110 77201 (Verified Carrier SIM)',
    originGeo: 'Airtel VoLTE / New Delhi Cell Tower',
    languageAccent: 'Indian English (North-Central)',
    targetTransaction: 'Operational Schedule Query (No financial action requested)',
    rawAudioSimulation: {
      duration: 26,
      basePitch: 124,
      jitter: 1.15, // Natural human vocal tremor
      shimmer: 3.4, // Natural amplitude micro-variations
      vocoderArtifact: 4, // Clean human voice
      phaseArtifact: 6,
      breathPresent: true, // Natural breath sounds present
    },
    transcript:
      "Hey Rajesh, good morning. Just calling from the cab on my way to the airport. Can you make sure the quarterly presentation slides are printed for the board meeting tomorrow morning? Also, send the latest headcount numbers to my email whenever you get a minute. Thanks!",
    dialogueHistory: [
      {
        speaker: 'Shri Vikram Mehta (CEO)',
        text: 'Hey Rajesh, good morning. Just calling from the cab on my way to the airport.',
        timestamp: '00:04',
        flaggedThreat: false,
      },
      {
        speaker: 'Operations Lead (Rajesh)',
        text: 'Good morning sir! Safe travels. Yes, the deck is ready.',
        timestamp: '00:10',
        flaggedThreat: false,
      },
      {
        speaker: 'Shri Vikram Mehta (CEO)',
        text: 'Great, make sure the quarterly slides are printed and email me the headcount numbers when you can. No rush.',
        timestamp: '00:19',
        flaggedThreat: false,
      },
      {
        speaker: 'Operations Lead (Rajesh)',
        text: 'Will do sir. Have a good flight.',
        timestamp: '00:24',
        flaggedThreat: false,
      },
    ],
  },
];

export const INITIAL_SECURITY_POLICY: SecurityPolicy = {
  highValueThresholdInr: 500000, // ₹5 Lakhs
  autoLockThresholdRisk: 70, // >= 70% risk triggers automatic lock
  quarantineThresholdRisk: 85, // >= 85% terminates call & logs to CERT-In
  enableZeroRetention: true, // DPDP privacy compliance
  requireDualCustody: true,
  enableStirShakenEnforcement: true,
  autoActivationOnIncomingCall: true, // Automatic background activation when phone call arrives
};

export const INITIAL_AUDIT_BLOCKS: AuditBlock[] = [
  {
    blockIndex: 1042,
    timestamp: '2026-09-12 11:20:14 IST',
    callId: 'CALL-20260912-8819',
    callerId: '+91 98200 45912',
    riskScore: 94,
    threatLevel: 'CRITICAL',
    actionTaken: 'AUTOMATED_TRANSACTION_LOCK & PENDING_CALLBACK',
    featureEmbeddingHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    previousBlockHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    currentBlockHash: '5d41402abc4b2a76b9719d911017c592b0c16922b0c363991c0e3a6a978f8fc8',
    dpdpZeroRetentionFlag: true,
  },
  {
    blockIndex: 1041,
    timestamp: '2026-09-12 09:45:30 IST',
    callId: 'CALL-20260912-7740',
    callerId: '+91 98110 77201',
    riskScore: 8,
    threatLevel: 'VERIFIED',
    actionTaken: 'ALLOW_CHANNEL_PASSTHROUGH',
    featureEmbeddingHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    previousBlockHash: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
    currentBlockHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    dpdpZeroRetentionFlag: true,
  },
];
