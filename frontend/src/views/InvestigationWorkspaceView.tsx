import React, { useState, useEffect } from 'react';
import {
  Brain, Sparkles, Send, Terminal, RefreshCw, ShieldCheck,
  Zap, AlertOctagon, Layers, ArrowRight, CheckCircle2, BookmarkPlus
} from 'lucide-react';
import { Incident, InvestigationResponse } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface InvestigationWorkspaceViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

export const InvestigationWorkspaceView: React.FC<InvestigationWorkspaceViewProps> = ({
  incidents,
  selectedIncident: initialIncident,
  onSelectIncident,
}) => {
  const { showToast } = useToast();
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(initialIncident || incidents[0] || null);
  const [withMemory, setWithMemory] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [investigationData, setInvestigationData] = useState<InvestigationResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);

  const startInvestigation = async (incId: string, mem: boolean) => {
    setLoading(true);
    try {
      const res = await api.startInvestigation(incId, mem);
      setInvestigationData(res);
      setChatMessages([
        { role: 'system', content: `AI Investigation initiated for incident: ${res.incident_id}`, timestamp: new Date().toLocaleTimeString() },
        { role: 'assistant', content: res.reply || res.summary, timestamp: new Date().toLocaleTimeString() }
      ]);
    } catch (err: any) {
      showToast(err.message || 'Investigation query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialIncident) {
      setCurrentIncident(initialIncident);
      startInvestigation(initialIncident.id, withMemory);
    } else if (incidents.length > 0 && !currentIncident) {
      setCurrentIncident(incidents[0]);
      startInvestigation(incidents[0].id, withMemory);
    }
  }, [initialIncident, incidents]);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentIncident) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toLocaleTimeString() }]);

    setSending(true);
    try {
      const res = await api.sendInvestigationMessage(currentIncident.id, userMsg, withMemory);
      setInvestigationData(res);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: res.reply || res.summary, timestamp: new Date().toLocaleTimeString() }]);
    } catch (err: any) {
      showToast(err.message || 'Message dispatch failed', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Incident Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-graphite border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cobalt" />
            <h2 className="text-xl font-bold text-pure">AI Investigation Studio</h2>
            <span className="text-[10px] bg-cobalt/20 text-cobalt px-2 py-0.5 rounded font-mono font-semibold">
              Grounded SRE Agent
            </span>
          </div>
          <p className="text-xs text-muted">
            Interactive reasoning workspace cross-referencing telemetry against Hindsight memory graphs
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Target Incident Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase font-semibold">Target:</span>
            <select
              value={currentIncident?.id || ''}
              onChange={(e) => {
                const inc = incidents.find((i) => i.id === e.target.value);
                if (inc) {
                  setCurrentIncident(inc);
                  onSelectIncident(inc);
                  startInvestigation(inc.id, withMemory);
                }
              }}
              className="bg-midnight border border-white/10 rounded-xl px-3 py-1.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.title}
                </option>
              ))}
            </select>
          </div>

          {/* With / Without Memory Switch */}
          <button
            onClick={() => {
              const nextMem = !withMemory;
              setWithMemory(nextMem);
              if (currentIncident) startInvestigation(currentIncident.id, nextMem);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              withMemory
                ? 'bg-lime/10 border-lime/40 text-lime'
                : 'bg-white/5 border-white/10 text-muted'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{withMemory ? 'Hindsight Memory: Active' : 'Memory: Disabled'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Multi-turn Chat */}
        <div className="lg:col-span-2 flex flex-col h-[650px] p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-pure">
              <Sparkles className="w-4 h-4 text-lime" />
              <span>Agent Dialogue Stream</span>
            </div>
            <span className="text-[10px] font-mono text-muted">Model: {investigationData?.llm_model || 'Groq Llama-3.3-70B'}</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-cobalt/20 border border-cobalt/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-lime" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-cobalt text-pure font-medium'
                      : 'bg-midnight/70 border border-white/5 text-pure/90'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="block text-[9px] text-muted text-right font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-muted p-2">
                <div className="w-2 h-2 rounded-full bg-lime animate-ping" />
                <span>Agent recalling previous incidents and generating hypotheses...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendPrompt} className="pt-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g., Cross-check with last week's Redis outage, or generate curl command..."
              className="flex-1 bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: Structured Findings & Actions */}
        <div className="flex flex-col h-[650px] p-6 rounded-2xl bg-graphite border border-white/5 space-y-6 overflow-y-auto">
          {/* Root Causes Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Root Cause Analysis</h4>
            <div className="space-y-2">
              {investigationData?.root_causes?.map((rc, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    rc.is_verified_historical
                      ? 'bg-lime/[0.04] border-lime/30'
                      : 'bg-midnight/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pure">{rc.title}</span>
                    <span className="font-mono text-lime font-bold">{Math.round(rc.probability * 100)}%</span>
                  </div>
                  <p className="text-muted leading-relaxed text-[11px]">{rc.description}</p>
                  {rc.is_verified_historical && (
                    <div className="text-[10px] p-1.5 rounded bg-lime/10 text-lime font-mono font-medium">
                      ★ Recalled from historical memory
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Remediation Commands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Recommended Remediation</h4>
            <div className="space-y-2">
              {investigationData?.suggested_actions?.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-midnight/70 border border-white/5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-pure">{act.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cobalt/20 text-cobalt font-semibold">
                      {act.priority}
                    </span>
                  </div>
                  <p className="text-muted text-[11px]">{act.explanation}</p>
                  {act.action_cmd && (
                    <div className="p-2 rounded bg-black/70 font-mono text-[10px] text-lime select-all">
                      $ {act.action_cmd}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Notes */}
          {investigationData?.evidence_notes && investigationData.evidence_notes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Supporting Evidence</h4>
              <ul className="space-y-1 text-[11px] text-muted">
                {investigationData.evidence_notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cobalt font-mono">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
