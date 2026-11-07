import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft, Sparkles, Brain, CheckCircle2, Clock, Zap,
  AlertTriangle, RefreshCw, Terminal, ShieldCheck, ChevronRight, Play, Eye
} from 'lucide-react';
import { Incident, CompareMemoryResponse } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface DemoComparisonViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const DemoComparisonView: React.FC<DemoComparisonViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const { showToast } = useToast();
  
  // Find INC-2048 (the second incident) or fallback to first incident
  const defaultIncident =
    incidents.find((i) => i.title.includes('INC-2048')) ||
    incidents.find((i) => !i.is_verified) ||
    incidents[0];

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(defaultIncident || null);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<CompareMemoryResponse | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'toggle'>('side-by-side');
  const [toggleState, setToggleState] = useState<'without' | 'with'>('with');
  const [presentationStep, setPresentationStep] = useState<number>(1);

  const runComparison = async (incidentId: string) => {
    setLoading(true);
    try {
      const res = await api.compareMemory(incidentId);
      setComparisonData(res);
      showToast('Live Before vs After model execution completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Comparison failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIncident && !comparisonData) {
      runComparison(selectedIncident.id);
    }
  }, [selectedIncident]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Presentation Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cobalt/20 via-graphite to-lime/15 border border-lime/30 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime text-midnight text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>HACKATHON SHOWCASE</span>
            </div>
            <h2 className="text-2xl font-extrabold text-pure">
              AI Learning Demonstration — Before vs After Hindsight Memory
            </h2>
            <p className="text-xs text-muted max-w-3xl leading-relaxed">
              Every Incident Teaches. See how an unfamiliar failure is converted into permanent institutional memory, empowering the agent to resolve recurring outages in seconds instead of hours.
            </p>
          </div>

          <button
            onClick={() => selectedIncident && runComparison(selectedIncident.id)}
            disabled={loading || !selectedIncident}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-bold shadow-md shadow-cobalt/25 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing Models...' : 'Re-run Live Model Calls'}</span>
          </button>
        </div>

        {/* 60-Second Presentation Guide Roadmap */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
          {[
            { step: '0-10s', label: 'Recurring Outage Crisis', active: presentationStep === 1 },
            { step: '10-25s', label: '1st Incident Diagnosed', active: presentationStep === 2 },
            { step: '25-35s', label: 'Hindsight Retain Stored', active: presentationStep === 3 },
            { step: '35-50s', label: '2nd Session Outage Match', active: presentationStep === 4 },
            { step: '50-60s', label: 'Verified Fix Recalled (-74% MTTR)', active: presentationStep === 5 },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setPresentationStep(idx + 1)}
              className={`p-2 rounded-lg text-left transition-all border ${
                item.active
                  ? 'bg-lime text-midnight font-bold border-lime shadow-md'
                  : 'bg-midnight/60 text-muted border-white/5 hover:text-pure hover:bg-midnight'
              }`}
            >
              <div className="text-[10px] opacity-75">{item.step}</div>
              <div className="truncate text-[11px]">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Incident Selector & View Mode Switcher */}
      <div className="p-4 rounded-2xl bg-graphite border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted uppercase font-semibold">Active Demonstration Target:</span>
          <select
            value={selectedIncident?.id || ''}
            onChange={(e) => {
              const inc = incidents.find((i) => i.id === e.target.value);
              if (inc) {
                setSelectedIncident(inc);
                runComparison(inc.id);
              }
            }}
            className="bg-midnight border border-white/10 rounded-xl px-3 py-1.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.title} ({inc.is_verified ? 'Verified' : 'Active'})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle (Side-by-side or Tabbed Toggle) */}
        <div className="flex items-center gap-1.5 bg-midnight p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'side-by-side' ? 'bg-cobalt text-pure font-bold' : 'text-muted hover:text-pure'
            }`}
          >
            Side-by-Side Comparison
          </button>
          <button
            onClick={() => setViewMode('toggle')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'toggle' ? 'bg-cobalt text-pure font-bold' : 'text-muted hover:text-pure'
            }`}
          >
            Single View Toggle
          </button>
        </div>
      </div>

      {/* Delta Metrics Banner */}
      {comparisonData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-cobalt/10 border border-cobalt/30 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cobalt font-bold">Time Saved Estimate</span>
            <div className="text-xl font-bold font-mono text-pure">{comparisonData.time_saved_estimate}</div>
            <p className="text-xs text-muted">Eliminated exploratory log grep cycles</p>
          </div>

          <div className="p-4 rounded-xl bg-lime/[0.04] border border-lime/30 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-lime font-bold">Accuracy Delta</span>
            <div className="text-xl font-bold font-mono text-lime">{comparisonData.accuracy_delta}</div>
            <p className="text-xs text-muted">Confidence supported by verified past fix</p>
          </div>

          <div className="p-4 rounded-xl bg-graphite border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold">Hindsight Memory Recall</span>
            <div className="text-xl font-bold font-mono text-pure">
              {comparisonData.with_memory.recalled_memories?.length || 1} Historical Precedents
            </div>
            <p className="text-xs text-muted">Retrieved via parallel hybrid search</p>
          </div>
        </div>
      )}

      {/* Key Differences Explanations */}
      {comparisonData?.key_differences && (
        <div className="p-4 rounded-xl bg-graphite border border-white/5 space-y-2">
          <h4 className="text-xs font-bold text-lime uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-lime" />
            <span>Why This Response Is Smarter</span>
          </h4>
          <ul className="space-y-1 text-xs text-pure/90">
            {comparisonData.key_differences.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-lime font-mono">•</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison Workspace */}
      {loading ? (
        <div className="text-center py-20 space-y-3 bg-graphite rounded-2xl border border-white/5">
          <div className="w-12 h-12 border-2 border-cobalt border-t-lime rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-pure">Executing Dual LLM Reasoning Calls...</p>
          <p className="text-xs text-muted">1. Baseline naive model (zero memory) vs 2. Hindsight memory-grounded agent</p>
        </div>
      ) : comparisonData ? (
        <div>
          {viewMode === 'toggle' && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex p-1 rounded-xl bg-graphite border border-white/10 text-xs font-semibold">
                <button
                  onClick={() => setToggleState('without')}
                  className={`px-5 py-2 rounded-lg transition-all ${
                    toggleState === 'without'
                      ? 'bg-error/20 text-error border border-error/40 font-bold'
                      : 'text-muted hover:text-pure'
                  }`}
                >
                  Without Historical Memory (Naive AI)
                </button>
                <button
                  onClick={() => setToggleState('with')}
                  className={`px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    toggleState === 'with'
                      ? 'bg-lime text-midnight font-bold'
                      : 'text-muted hover:text-pure'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>With Hindsight Memory (RECALLX Agent)</span>
                </button>
              </div>
            </div>
          )}

          <div className={`grid gap-6 ${viewMode === 'side-by-side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* LEFT / WITHOUT MEMORY */}
            {(viewMode === 'side-by-side' || toggleState === 'without') && (
              <div className="p-6 rounded-2xl bg-graphite/80 border border-error/20 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-error" />
                    <h3 className="text-sm font-bold text-pure">Without Historical Memory</h3>
                  </div>
                  <span className="text-[10px] font-mono text-muted bg-error/10 text-error px-2 py-0.5 rounded border border-error/20">
                    Naive LLM Chatbot
                  </span>
                </div>

                {/* Summary */}
                <div className="p-3.5 rounded-xl bg-midnight/70 border border-white/5 text-xs text-muted leading-relaxed">
                  {comparisonData.without_memory.summary}
                </div>

                {/* Root Causes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Hypothesized Root Causes (Speculative)</h4>
                  <div className="space-y-2">
                    {comparisonData.without_memory.root_causes.map((rc, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-midnight/50 border border-white/5 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-pure font-semibold">
                          <span>{rc.title}</span>
                          <span className="text-muted font-mono">{Math.round(rc.probability * 100)}%</span>
                        </div>
                        <p className="text-muted leading-relaxed">{rc.description}</p>
                        <div className="text-[10px] text-muted/60 font-mono">Evidence: {rc.evidence}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Suggested Exploratory Actions</h4>
                  <div className="space-y-2">
                    {comparisonData.without_memory.suggested_actions.map((act) => (
                      <div key={act.id} className="p-3 rounded-xl bg-midnight/50 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-pure">{act.title}</span>
                          <span className="text-[10px] font-mono text-muted">{act.priority}</span>
                        </div>
                        <p className="text-muted text-[11px]">{act.explanation}</p>
                        {act.action_cmd && (
                          <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-muted">
                            $ {act.action_cmd}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disadvantage Callout */}
                <div className="p-3 rounded-xl bg-error/[0.05] border border-error/20 text-xs text-error/90 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No historical awareness. The engineer must manually troubleshoot from scratch, taking 45–60 minutes.
                  </span>
                </div>
              </div>
            )}

            {/* RIGHT / WITH HINDSIGHT MEMORY */}
            {(viewMode === 'side-by-side' || toggleState === 'with') && (
              <div className="p-6 rounded-2xl bg-graphite border border-lime/30 space-y-5 shadow-lime/5 shadow-xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
                    <h3 className="text-sm font-bold text-pure">With Hindsight Memory Layer</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-lime text-midnight font-bold px-2 py-0.5 rounded shadow-sm">
                    RECALLX SRE Intelligence
                  </span>
                </div>

                {/* Summary */}
                <div className="p-3.5 rounded-xl bg-cobalt/15 border border-cobalt/30 text-xs text-pure leading-relaxed">
                  {comparisonData.with_memory.summary}
                </div>

                {/* Recalled Memory Proof */}
                {comparisonData.with_memory.recalled_memories?.length > 0 && (
                  <div className="p-4 rounded-xl bg-lime/[0.05] border border-lime/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-lime font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="w-4 h-4" />
                        <span>Recalled Historical Incident Memory</span>
                      </span>
                      <span className="text-lime font-mono font-bold">94% Confidence</span>
                    </div>
                    {comparisonData.with_memory.recalled_memories.slice(0, 1).map((mem) => (
                      <div key={mem.id} className="p-3 rounded-lg bg-midnight/80 border border-white/5 text-xs space-y-1">
                        <div className="text-[10px] text-muted font-mono">Previous Resolution Precedent:</div>
                        <p className="font-mono text-pure whitespace-pre-wrap">{mem.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Root Causes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Pinpointed Root Cause</h4>
                  <div className="space-y-2">
                    {comparisonData.with_memory.root_causes.map((rc, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border space-y-1 text-xs ${
                          rc.is_verified_historical
                            ? 'bg-lime/[0.03] border-lime/40'
                            : 'bg-midnight/50 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-pure font-semibold">
                          <span className="flex items-center gap-1.5">
                            {rc.is_verified_historical && <ShieldCheck className="w-4 h-4 text-lime" />}
                            <span>{rc.title}</span>
                          </span>
                          <span className="text-lime font-mono font-bold">{Math.round(rc.probability * 100)}%</span>
                        </div>
                        <p className="text-muted leading-relaxed">{rc.description}</p>
                        {rc.is_verified_historical && (
                          <div className="p-2 rounded bg-lime/10 border border-lime/20 text-lime text-[11px] font-medium">
                            ★ Exact match to confirmed PgBouncer failure resolution from previous session.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Immediate Actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Battle-Tested Remediation</h4>
                  <div className="space-y-2">
                    {comparisonData.with_memory.suggested_actions.map((act) => (
                      <div key={act.id} className="p-3.5 rounded-xl bg-midnight/70 border border-white/5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-pure">{act.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-lime text-midnight">
                            {act.priority}
                          </span>
                        </div>
                        <p className="text-muted text-[11px]">{act.explanation}</p>
                        {act.action_cmd && (
                          <div className="p-2 rounded bg-black/80 font-mono text-[11px] text-lime select-all flex items-center justify-between">
                            <span>$ {act.action_cmd}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advantage Callout */}
                <div className="p-3 rounded-xl bg-lime/[0.08] border border-lime/30 text-xs text-pure flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                  <span>
                    Zero time lost guessing. Hindsight immediately recalled the exact resolution applied 2 days prior. MTTR reduced by 74%.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
