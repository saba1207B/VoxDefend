/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState, useRef, useMemo } from 'react';
import {
  FileAudio,
  Play,
  Pause,
  Trash2,
  Tag,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Volume2,
  UserCheck,
} from 'lucide-react';
import { AudioSample, SampleLabel } from '../../types/trainingStudio';

interface DatasetManagerProps {
  samples: AudioSample[];
  onUpdateSampleLabel: (sampleId: string, newLabel: SampleLabel) => void;
  onBulkUpdateLabels: (sampleIds: string[], newLabel: SampleLabel) => void;
  onRemoveSample: (sampleId: string) => void;
  onBulkRemoveSamples: (sampleIds: string[]) => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  samples,
  onUpdateSampleLabel,
  onBulkUpdateLabels,
  onRemoveSample,
  onBulkRemoveSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Audio preview state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.speakerId && s.speakerId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLabel = labelFilter === 'ALL' || s.label === labelFilter;
      const matchesStatus = statusFilter === 'ALL' || s.validationStatus === statusFilter;
      return matchesSearch && matchesLabel && matchesStatus;
    });
  }, [samples, searchQuery, labelFilter, statusFilter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredSamples.length && filteredSamples.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSamples.map((s) => s.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkLabel = (label: SampleLabel) => {
    if (selectedIds.size === 0) return;
    onBulkUpdateLabels(Array.from(selectedIds), label);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (
      window.confirm(
        `Are you sure you want to remove ${selectedIds.size} selected sample(s) from the training pool?`
      )
    ) {
      onBulkRemoveSamples(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleTogglePlay = (sample: AudioSample) => {
    if (playingId === sample.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(sample.id);
      setPlayProgress(0);

      // If sample has previewUrl or synthesize a tone
      if (sample.previewUrl) {
        const audio = new Audio(sample.previewUrl);
        audioRef.current = audio;
        audio.ontimeupdate = () => {
          if (audio.duration) {
            setPlayProgress((audio.currentTime / audio.duration) * 100);
          }
        };
        audio.onended = () => {
          setPlayingId(null);
          setPlayProgress(0);
        };
        audio.play().catch(() => setPlayingId(null));
      } else {
        // Fallback simulated playback for pre-seeded items
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress > 100) {
            clearInterval(interval);
            setPlayingId(null);
            setPlayProgress(0);
          } else {
            setPlayProgress(progress);
          }
        }, 150);
      }
    }
  };

  const getLabelBadge = (label: SampleLabel) => {
    switch (label) {
      case 'REAL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'AI_GENERATED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'CLONED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'UNKNOWN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  const getStatusBadge = (status: AudioSample['validationStatus']) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
            <XCircle className="w-3 h-3" /> Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header & Search / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white">
            Dataset Samples ({filteredSamples.length} of {samples.length})
          </h2>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename or speaker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Label filter */}
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Labels</option>
            <option value="REAL">REAL</option>
            <option value="AI_GENERATED">AI GENERATED</option>
            <option value="CLONED">CLONED</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Health</option>
            <option value="VALID">Valid Only</option>
            <option value="WARNING">Warnings</option>
            <option value="ERROR">Errors</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-950/50 border border-blue-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-blue-300">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            <span>{selectedIds.size} sample(s) selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Assign Label:</span>
            <button
              onClick={() => handleBulkLabel('AI_GENERATED')}
              className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 font-bold transition"
            >
              Mark AI Generated
            </button>
            <button
              onClick={() => handleBulkLabel('REAL')}
              className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 font-bold transition"
            >
              Mark Real
            </button>
            <button
              onClick={() => handleBulkLabel('CLONED')}
              className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 font-bold transition"
            >
              Mark Cloned
            </button>
            <button
              onClick={() => handleBulkLabel('UNKNOWN')}
              className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 font-bold transition"
            >
              Mark Unknown
            </button>

            <span className="text-slate-600">|</span>

            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 font-bold transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Selected
            </button>
          </div>
        </div>
      )}

      {/* Samples Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <th className="p-3 w-10">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-white"
                  title="Select / Deselect all"
                >
                  {selectedIds.size === filteredSamples.length && filteredSamples.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </th>
              <th className="p-3">Sample Filename</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Format & SR</th>
              <th className="p-3">Label</th>
              <th className="p-3">Validation Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                  No audio samples found matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample) => {
                const isSelected = selectedIds.has(sample.id);
                const isPlaying = playingId === sample.id;

                return (
                  <tr
                    key={sample.id}
                    className={`hover:bg-slate-900/60 transition ${
                      isSelected ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(sample.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Filename & Player */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleTogglePlay(sample)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                            isPlaying
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={isPlaying ? 'Pause' : 'Listen preview'}
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="font-mono text-slate-200 truncate font-semibold">
                            {sample.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            {sample.speakerId && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <UserCheck className="w-2.5 h-2.5" />
                                {sample.speakerId}
                              </span>
                            )}
                            <span>{(sample.sizeBytes / 1024).toFixed(0)} KB</span>
                            {sample.isAugmented && (
                              <span className="text-purple-400 bg-purple-950/60 px-1 rounded border border-purple-500/30">
                                Augmented: {sample.augmentationType || 'Noise'}
                              </span>
                            )}
                          </div>

                          {/* Progress bar if playing */}
                          {isPlaying && (
                            <div className="w-36 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-150"
                                style={{ width: `${playProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="p-3 font-mono text-slate-300">
                      {sample.durationSeconds.toFixed(1)}s
                    </td>

                    {/* Format & Sample Rate */}
                    <td className="p-3 font-mono text-slate-400">
                      <span className="uppercase text-slate-300 font-bold">{sample.format}</span> •{' '}
                      {(sample.sampleRateHz / 1000).toFixed(1)} kHz
                    </td>

                    {/* Label with quick dropdown */}
                    <td className="p-3">
                      <select
                        value={sample.label}
                        onChange={(e) =>
                          onUpdateSampleLabel(sample.id, e.target.value as SampleLabel)
                        }
                        className={`text-[10px] font-mono font-bold px-2 py-1 rounded border focus:outline-none ${getLabelBadge(
                          sample.label
                        )}`}
                      >
                        <option value="REAL">REAL</option>
                        <option value="AI_GENERATED">AI GENERATED</option>
                        <option value="CLONED">CLONED</option>
                        <option value="UNKNOWN">UNKNOWN</option>
                      </select>
                    </td>

                    {/* Validation status */}
                    <td className="p-3">
                      <div>
                        {getStatusBadge(sample.validationStatus)}
                        {sample.issues.length > 0 && (
                          <div className="text-[10px] text-amber-400/90 font-mono mt-0.5 truncate max-w-xs">
                            {sample.issues[0]}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onRemoveSample(sample.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Remove sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
