import React, { useState } from 'react';
import {
  X, AlertTriangle, ShieldCheck, FileText, Terminal,
  Clock, Sparkles, Download, CheckCircle2, ArrowRight,
  Brain, Send, RefreshCw, BookmarkPlus
} from 'lucide-react';
import { Incident, Severity, IncidentStatus, InvestigationResponse } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onInvestigateDirectly?: (incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
  onUpdated,
  onInvestigateDirectly,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'ai' | 'verify' | 'timeline' | 'export'>('overview');
  
  // Investigation state
  const [investigating, setInvestigating] = useState(false);
  const [investigationData, setInvestigationData] = useState<InvestigationResponse | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Verification state
  const [verifiedFix, setVerifiedFix] = useState(incident?.verified_resolution || incident?.resolution_steps || '');
  const [rootCauseInput, setRootCauseInput] = useState(incident?.root_cause || '');
  const [verifying, setVerifying] = useState(false);

  // Timeline note state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Postmortem
  const [postmortemMarkdown, setPostmortemMarkdown] = useState<string | null>(null);
  const [loadingPostmortem, setLoadingPostmortem] = useState(false);

  if (!isOpen || !incident) return null;

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await api.updateIncident(incident.id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      onUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleRunInvestigation = async (withMem: boolean = true) => {
    setInvestigating(true);
    try {
      const res = await api.startInvestigation(incident.id, withMem);
      setInvestigationData(res);
      showToast('AI investigation completed with Hindsight memory query', 'success');
    } catch (err: any) {
      showToast(err.message || 'Investigation failed', 'error');
    } finally {
      setInvestigating(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setSendingChat(true);
    try {
      const res = await api.sendInvestigationMessage(incident.id, chatMessage, true);
      setInvestigationData(res);
      setChatMessage('');
    } catch (err: any) {
      showToast(err.message || 'Chat message failed', 'error');
    } finally {
      setSendingChat(false);
    }
  };

  const handleVerifyResolution = async () => {
    if (!verifiedFix.trim()) {
      showToast('Please provide the verified resolution details', 'error');
      return;
    }
    setVerifying(true);
    try {
      await api.verifyResolution(incident.id, {
        verified_resolution: verifiedFix,
        root_cause: rootCauseInput,
        retain_to_hindsight: true
      });
      showToast('Resolution officially verified & retained to Hindsight Memory!', 'success');
      onUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to verify resolution', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      await api.addTimelineNote(incident.id, newNote);
      setNewNote('');
      showToast('Timeline note logged', 'info');
      onUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to log note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleGeneratePostmortem = async () => {
    setLoadingPostmortem(true);
    try {
      const res = await api.generatePostmortem(incident.id);
      setPostmortemMarkdown(res.postmortem_markdown);
    } catch (err: any) {
      showToast(err.message || 'Failed to compile postmortem', 'error');
    } finally {
      setLoadingPostmortem(false);
    }
  };

  const severityColor =
    incident.severity === 'Critical'
      ? 'bg-error text-white'
      : incident.severity === 'High'
      ? 'bg-orange-500 text-white'
      : incident.severity === 'Medium'
      ? 'bg-cobalt text-white'
      : 'bg-lime text-midnight';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-graphite border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-midnight/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-[11px] px-2.5 py-1 rounded-md font-mono font-bold ${severityColor}`}>
              {incident.severity}
            </span>
            <span className="text-pure font-bold text-base truncate max-w-lg">{incident.title}</span>
            {incident.is_verified && (
              <span className="flex items-center gap-1 text-[11px] bg-lime/10 text-lime px-2 py-0.5 rounded-full border border-lime/30 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified in Hindsight</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-pure transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/5 bg-midnight/30 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'logs', label: 'Telemetry & Logs', icon: Terminal },
            { id: 'ai', label: 'AI Investigation', icon: Brain },
            { id: 'verify', label: 'Verified Fix', icon: ShieldCheck },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'export', label: 'Postmortem & PDF', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'ai' && !investigationData) {
                    handleRunInvestigation(true);
                  }
                  if (tab.id === 'export' && !postmortemMarkdown) {
                    handleGeneratePostmortem();
                  }
                }}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-cobalt text-pure'
                    : 'border-transparent text-muted hover:text-pure'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lime' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Selector Banner */}
              <div className="p-4 rounded-xl bg-midnight/70 border border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted uppercase font-semibold">Incident Lifecycle:</span>
                  <div className="flex items-center gap-1.5 bg-graphite p-1 rounded-lg border border-white/10">
                    {(['Detected', 'Investigating', 'Mitigating', 'Resolved'] as IncidentStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                          incident.status === st
                            ? 'bg-cobalt text-white font-bold shadow-sm'
                            : 'text-muted hover:text-pure'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Detected: {new Date(incident.created_at).toLocaleString()}</span>
                  {incident.resolved_at && (
                    <span>• Resolved: {new Date(incident.resolved_at).toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Description & Impact</h4>
                <div className="p-4 rounded-xl bg-midnight/50 border border-white/5 text-sm text-pure/90 leading-relaxed whitespace-pre-wrap">
                  {incident.description}
                </div>
              </div>

              {/* Service & Infra Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-midnight/50 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Affected Services</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {incident.affected_services?.map((svc) => (
                      <span key={svc} className="text-xs px-2 py-1 rounded-md bg-cobalt/15 text-pure border border-cobalt/30 font-mono">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-midnight/50 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Infrastructure Topology</h4>
                  <p className="text-xs font-mono text-pure/80">
                    {incident.infrastructure_details || 'AWS EKS cluster | RDS Postgres'}
                  </p>
                </div>
              </div>

              {/* Verified Fix Snapshot if available */}
              {incident.verified_resolution && (
                <div className="p-4 rounded-xl bg-lime/[0.04] border border-lime/30 space-y-2">
                  <div className="flex items-center gap-2 text-lime text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Certified Historical Resolution (Hindsight Memory)</span>
                  </div>
                  <p className="text-sm text-pure/90 font-mono bg-midnight/60 p-3 rounded-lg border border-white/5">
                    {incident.verified_resolution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TELEMETRY & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Captured Error Logs & Ingress Signatures
                </h4>
                <div className="p-4 rounded-xl bg-midnight border border-white/10 font-mono text-xs text-pure/90 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {incident.error_logs || 'No error logs captured for this incident.'}
                </div>
              </div>

              {incident.stack_trace && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Exception Stack Trace
                  </h4>
                  <div className="p-4 rounded-xl bg-midnight border border-white/10 font-mono text-xs text-error/90 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {incident.stack_trace}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI INVESTIGATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Agent Toolbar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight/70 border border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime" />
                  <span className="text-xs font-semibold text-pure">RECALLX AI Agent</span>
                  <span className="text-[10px] bg-cobalt/20 text-cobalt px-2 py-0.5 rounded font-mono">
                    Hindsight Memory Layer Active
                  </span>
                </div>
                <button
                  onClick={() => handleRunInvestigation(true)}
                  disabled={investigating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${investigating ? 'animate-spin' : ''}`} />
                  <span>{investigating ? 'Analyzing...' : 'Re-run Analysis'}</span>
                </button>
              </div>

              {/* Investigation Output */}
              {investigationData ? (
                <div className="space-y-6">
                  {/* Summary Callout */}
                  <div className="p-4 rounded-xl bg-cobalt/10 border border-cobalt/30">
                    <h5 className="text-xs font-bold text-lime uppercase tracking-wider mb-1">Investigation Summary</h5>
                    <p className="text-sm text-pure/90 leading-relaxed">{investigationData.summary}</p>
                  </div>

                  {/* Recalled Memories Callout if any */}
                  {investigationData.recalled_memories?.length > 0 && (
                    <div className="p-4 rounded-xl bg-lime/[0.04] border border-lime/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-lime text-xs font-bold uppercase tracking-wider">
                          <Brain className="w-4 h-4" />
                          <span>Hindsight Recalled Memories ({investigationData.recalled_memories.length})</span>
                        </div>
                        <span className="text-[10px] text-muted font-mono">Parallel Vector + Graph + BM25</span>
                      </div>
                      <div className="space-y-2">
                        {investigationData.recalled_memories.map((mem) => (
                          <div key={mem.id} className="p-3 rounded-lg bg-midnight/70 border border-white/5 text-xs">
                            <div className="flex items-center justify-between text-muted mb-1">
                              <span className="text-lime font-mono font-semibold">Match Score: {Math.round((mem.score || 0.9) * 100)}%</span>
                              <span className="text-[10px] font-mono">{mem.timestamp ? new Date(mem.timestamp).toLocaleDateString() : 'Historical'}</span>
                            </div>
                            <p className="font-mono text-pure/90 whitespace-pre-wrap">{mem.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Root Cause Cards */}
                  <div>
                    <h5 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Identified Root Causes</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {investigationData.root_causes?.map((rc, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            rc.is_verified_historical
                              ? 'bg-lime/[0.03] border-lime/40 shadow-sm'
                              : 'bg-midnight/70 border-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-pure">{rc.title}</span>
                            <span className="text-xs font-mono font-bold text-lime">{Math.round(rc.probability * 100)}% Prob.</span>
                          </div>
                          <p className="text-xs text-muted leading-relaxed mb-3">{rc.description}</p>
                          {rc.is_verified_historical && (
                            <div className="text-[11px] p-2 rounded-lg bg-lime/10 text-lime border border-lime/20 font-medium">
                              ★ Verified Fix Recorded in Previous Incident
                            </div>
                          )}
                          <div className="mt-2 text-[10px] text-muted/70 font-mono">
                            Evidence: {rc.evidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Remediation Actions */}
                  <div>
                    <h5 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Recommended Actions</h5>
                    <div className="space-y-2">
                      {investigationData.suggested_actions?.map((act) => (
                        <div key={act.id} className="p-3.5 rounded-xl bg-midnight/70 border border-white/5 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-pure">{act.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                                act.priority === 'Critical' ? 'bg-error text-white' : 'bg-cobalt text-white'
                              }`}>
                                {act.priority}
                              </span>
                            </div>
                            <p className="text-xs text-muted">{act.explanation}</p>
                            {act.action_cmd && (
                              <div className="mt-2 p-2 rounded bg-black/60 font-mono text-[11px] text-lime select-all">
                                $ {act.action_cmd}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-mono text-muted shrink-0">Conf: {Math.round(act.confidence * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-2 border-cobalt border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted">Running agent investigation and Hindsight memory recall...</p>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-4 border-t border-white/5">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask the agent to elaborate, check logs, or generate alternative fixes..."
                  className="flex-1 bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: VERIFIED RESOLUTION */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-lime/[0.04] border border-lime/30 space-y-2">
                <div className="flex items-center gap-2 text-lime text-xs font-bold uppercase tracking-wider">
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Hindsight Knowledge Retention Protocol</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  When you certify a verified resolution, RECALLX permanently stores the failure signature, root cause, and successful mitigation into Hindsight. Future incidents with matching telemetry will automatically surface this certified fix.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Confirmed Root Cause
                </label>
                <textarea
                  rows={3}
                  value={rootCauseInput}
                  onChange={(e) => setRootCauseInput(e.target.value)}
                  placeholder="e.g., PgBouncer client pool exhausted at 50 max_client_conn under 3000 RPS surge..."
                  className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Verified Production Fix & Corrective Steps *
                </label>
                <textarea
                  rows={4}
                  value={verifiedFix}
                  onChange={(e) => setVerifiedFix(e.target.value)}
                  placeholder="e.g., Scaled PgBouncer pool sizing to 250 in Helm values and enabled client connection retry jitter with exponential backoff..."
                  className="w-full font-mono text-xs bg-midnight/80 border border-white/10 rounded-xl p-3 text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-xs text-muted">
                  Status: {incident.is_verified ? '✓ Certified in Hindsight' : 'Pending Engineer Verification'}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyResolution}
                  disabled={verifying}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime hover:bg-lime/90 text-midnight text-xs font-bold shadow-md shadow-lime/20 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifying ? 'Retaining...' : 'Certify & Retain to Hindsight'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddTimelineNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an investigation note, remediation action, or status update..."
                  className="flex-1 bg-midnight/80 border border-white/10 rounded-xl px-4 py-2 text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 rounded-xl bg-cobalt text-pure text-xs font-semibold hover:bg-cobalt/90 transition-all disabled:opacity-50"
                >
                  Log Note
                </button>
              </form>

              {/* Event Stream */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {incident.timeline?.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border border-midnight ${
                      evt.type === 'verified_resolution'
                        ? 'bg-lime ring-4 ring-lime/20'
                        : evt.type === 'memory_retained'
                        ? 'bg-lime'
                        : evt.type === 'status_change'
                        ? 'bg-error'
                        : 'bg-cobalt'
                    }`} />
                    <div className="p-3.5 rounded-xl bg-midnight/70 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-pure">{evt.author}</span>
                        <span className="text-[10px] text-muted font-mono">{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-pure/90 leading-relaxed">{evt.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: POSTMORTEM & EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-midnight/70 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-pure">Export Incident Report</h4>
                  <p className="text-xs text-muted">Generate certified engineering postmortems for leadership and audits</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={api.getPdfDownloadUrl(incident.id)}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md shadow-cobalt/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </a>
                </div>
              </div>

              {loadingPostmortem ? (
                <div className="text-center py-8 text-xs text-muted">
                  Generating AI postmortem draft...
                </div>
              ) : postmortemMarkdown ? (
                <div className="p-5 rounded-xl bg-midnight border border-white/10 font-mono text-xs text-pure/90 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {postmortemMarkdown}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
