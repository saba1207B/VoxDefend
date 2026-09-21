import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Filter,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { TrainingLogEntry } from '../../types/trainingStudio';

interface TrainingLogsProps {
  logs: TrainingLogEntry[];
}

export const TrainingLogs: React.FC<TrainingLogsProps> = ({ logs }) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((l) => {
    if (levelFilter === 'ALL') return true;
    return l.level === levelFilter;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.stage}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: TrainingLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'WARN':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'ERROR':
        return 'text-red-400 bg-red-950/60 border-red-500/30';
      case 'STAGE':
        return 'text-purple-400 bg-purple-950/60 border-purple-500/30';
      case 'INFO':
      default:
        return 'text-blue-400 bg-blue-950/60 border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
      {/* Terminal Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-300 font-bold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            Training Execution Terminal Logs
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Levels ({logs.length})</option>
            <option value="STAGE">Stages</option>
            <option value="SUCCESS">Success</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warnings</option>
            <option value="ERROR">Errors</option>
          </select>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Log Output Area */}
      <div className="p-4 max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 py-4 text-center">
            No log entries matching filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
              <span className="text-slate-500 flex-shrink-0">{log.timestamp}</span>
              <span
                className={`px-1.5 py-0.2 rounded border text-[9px] font-bold flex-shrink-0 ${getLevelColor(
                  log.level
                )}`}
              >
                {log.level}
              </span>
              <span className="text-slate-400 flex-shrink-0">[{log.stage}]</span>
              <span className="text-slate-200 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
