/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { Code2, Send, Check, Copy, Server, Shield, Terminal } from 'lucide-react';

export const ApiSdkPlayground: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'ts' | 'python' | 'curl' | 'chromeExtension'>('ts');
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const samplePayload = {
    sessionSipId: "SIP-RTGS-99021-MUMBAI",
    callerNumber: "+91 98200 45912",
    destinationNumber: "+91 22 6600 4000",
    claimedIdentity: "Dr. Arvind Sharma (CFO)",
    transactionDetails: {
      type: "RTGS_HIGH_VALUE",
      amountInr: 42000000,
      beneficiaryAccount: "HDFC-ESCROW-8912"
    },
    audioFeatures: {
      vocoderArtifactConfidence: 89,
      jitterLocal: 0.08,
      shimmerLocal: 0.6,
      naturalBreathDetected: false,
      highFreqCutoff: 7.8
    }
  };

  const handleTestApi = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/telecom-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setTesting(false);
    }
  };

  const codeSnippets = {
    ts: `import { VocalShieldSDK } from '@aicte/vocalshield-sdk';

const shield = new VocalShieldSDK({
  apiKey: process.env.VOCALSHIELD_KEY,
  policy: { autoLockThreshold: 70, zeroRetention: true }
});

// Telephony SIP / WebRTC stream hook
telecomGateway.on('inbound_stream', async (stream, metadata) => {
  const assessment = await shield.inspectAudioStream({
    stream,
    callerId: metadata.fromNumber,
    claimedIdentity: metadata.callerName,
    transactionContext: metadata.transaction
  });

  if (assessment.threatLevel === 'CRITICAL') {
    // Immediate core-banking wire lock
    await coreBanking.lockTransaction(metadata.transactionId);
    await telecomGateway.injectAudioPrompt(stream, 'SECURITY_CHALLENGE_REQUIRED');
  }
});`,
    python: `from vocalshield import VocalShieldClient, ThreatLevel

client = VocalShieldClient(api_key="VS_PROD_SEC_KEY")

# Hook into FreePBX / Asterisk ARI or Banking PBX
def on_voice_stream(audio_frame, caller_info):
    result = client.analyze_voice_frame(
        audio_pcm=audio_frame,
        sample_rate=16000,
        claimed_identity=caller_info.name,
        accent_profile="en-IN"
    )
    
    if result.risk_score >= 70:
        client.trigger_pre_transaction_interlock(caller_info.session_id)
        print(f"[ALERT] Voice clone detected. Risk: {result.risk_score}%")`,
    curl: `curl -X POST https://api.vocalshield.gov.in/v1/voice/verify-stream \\
  -H "Authorization: Bearer YOUR_APICTE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionSipId": "SIP-RTGS-99021-MUMBAI",
    "callerNumber": "+91 98200 45912",
    "transactionDetails": { "amountInr": 42000000 },
    "audioFeatures": { "jitterLocal": 0.08, "vocoderArtifactConfidence": 89 }
  }'`,
    chromeExtension: `// Chrome Extension / Browser Background Service Worker
// Automatically activates VoxDefend when an incoming WebRTC / Telephony call is detected

chrome.runtime.onInstalled.addListener(() => {
  console.log('[VoxDefend] Daemon successfully registered in Chrome');
});

// Intercept WebRTC peer connections (Google Meet, WhatsApp Web, Webex, Zoom)
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes('/webrtc') || details.url.includes('/sip/call')) {
      chrome.action.setBadgeText({ text: 'ACTIVE' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
      
      // Auto-dispatch voice clone defense payload
      chrome.tabs.sendMessage(details.tabId, {
        action: 'VOCALSHIELD_AUTO_ACTIVATE',
        timestamp: Date.now(),
        detectionMode: 'REAL_TIME_ACOUSTIC_PROSODY'
      });
    }
  },
  { urls: ['<all_urls>'] }
);`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white font-sans">
            Banking Core & Telecom Operator Integration SDK
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Drop-in middleware for Core Banking (Finacle, TCS BaNCS, Oracle Flexcube), Contact Centers (Genesys, Cisco, Avaya), and Telecom IMS VoLTE networks to detect voice clones before transactions execute.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Snippets */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-semibold text-slate-300">
                  SDK Implementation Blueprint
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {([
                  { id: 'ts', label: 'TS/NODE' },
                  { id: 'python', label: 'PYTHON' },
                  { id: 'curl', label: 'CURL' },
                  { id: 'chromeExtension', label: 'CHROME DAEMON' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedLanguage(tab.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition whitespace-nowrap ${
                      selectedLanguage === tab.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <button
                  onClick={copyCode}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre>{codeSnippets[selectedLanguage]}</pre>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Latency SLA: </span>
            <span className="text-emerald-400 font-bold">&lt; 140ms</span>
            <span className="mx-2">•</span>
            <span>Protocols: </span>
            <span className="text-slate-300">gRPC streaming / WebRTC RTP / REST</span>
          </div>
        </div>

        {/* Right: Live Webhook Tester */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Simulate Live Core Banking SIP Intercept
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-400">
              POST /api/telecom-hook
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400 space-y-1">
            <span>Test Payload (RTGS ₹4.2 Crore with Vocoder Artifact):</span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-40 overflow-y-auto text-[11px] text-slate-300">
              <pre>{JSON.stringify(samplePayload, null, 2)}</pre>
            </div>
          </div>

          <button
            onClick={handleTestApi}
            disabled={testing}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'INTERCEPTING STREAM...' : 'DISPATCH SIP INTERCEPT PACKET'}</span>
          </button>

          {apiResponse && (
            <div className="space-y-1 text-xs font-mono">
              <span className="text-slate-400">Gateway Telemetry Response:</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/40 text-[11px] text-emerald-400">
                <pre>{apiResponse}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
