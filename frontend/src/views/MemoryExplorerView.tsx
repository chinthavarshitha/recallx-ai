import React, { useState, useEffect } from 'react';
import {
  Search, Brain, Database, ShieldCheck, Terminal, Filter,
  ArrowRight, Clock, Plus, Zap, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { MemoryExplorerItem, BankHealth } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface MemoryExplorerViewProps {
  bankHealth: BankHealth | null;
}

export const MemoryExplorerView: React.FC<MemoryExplorerViewProps> = ({ bankHealth }) => {
  const { showToast } = useToast();
  const [memories, setMemories] = useState<MemoryExplorerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [logs, setLogs] = useState<any[]>([]);

  // Interactive Sandbox
  const [sandboxTab, setSandboxTab] = useState<'recall' | 'retain' | 'reflect'>('recall');
  const [queryInput, setQueryInput] = useState('Payment database acquisition timeout');
  const [contentInput, setContentInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await api.exploreMemoryBank(searchTerm, filterType);
      setMemories(data.memories || []);
      const opLogs = await api.getMemoryLogs(15);
      setLogs(opLogs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load memory inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [searchTerm, filterType]);

  const handleRunSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    setSandboxLoading(true);
    try {
      if (sandboxTab === 'recall') {
        const res = await api.recallMemory(queryInput);
        setSandboxResult(res);
        showToast(`Recall retrieved ${res.total_recalled || 0} memory units in ${res.duration_ms}ms`, 'success');
      } else if (sandboxTab === 'retain') {
        const res = await api.retainMemory(contentInput, ['manual', 'sandbox']);
        setSandboxResult(res);
        showToast('Memory successfully retained into bank!', 'success');
        setContentInput('');
        fetchMemories();
      } else if (sandboxTab === 'reflect') {
        const res = await api.reflectMemory(queryInput);
        setSandboxResult(res);
        showToast(`Reflection synthesized in ${res.duration_ms}ms`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Sandbox call failed', 'error');
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cobalt/20 via-graphite to-lime/10 border border-white/5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-lime" />
              <h2 className="text-xl font-bold text-pure">Hindsight Memory Explorer</h2>
              <span className="text-[10px] bg-lime/10 text-lime px-2 py-0.5 rounded font-mono font-bold">
                SDK v{bankHealth?.sdk_version || '1.2.0'}
              </span>
            </div>
            <p className="text-xs text-muted">
              Inspect stored memory units, verified engineering resolutions, and audit live Retain/Recall operations
            </p>
          </div>

          <div className="flex items-center gap-2 bg-midnight/80 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono">
            <span className="text-muted">Bank:</span>
            <span className="text-pure font-bold">{bankHealth?.bank_id || 'recallx-sre-workspace'}</span>
            <span className="text-muted">•</span>
            <span className="text-lime">{memories.length} Stored Units</span>
          </div>
        </div>
      </div>

      {/* Interactive Memory Sandbox */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-pure flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cobalt" />
              <span>Interactive Memory Sandbox</span>
            </h3>
            <p className="text-xs text-muted">Directly test Hindsight Retain, Recall, and Reflect primitives</p>
          </div>

          <div className="flex items-center gap-1 bg-midnight p-1 rounded-xl border border-white/10 text-xs">
            {(['recall', 'retain', 'reflect'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSandboxTab(tab);
                  setSandboxResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all uppercase ${
                  sandboxTab === tab ? 'bg-cobalt text-pure' : 'text-muted hover:text-pure'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunSandbox} className="space-y-3">
          {sandboxTab === 'retain' ? (
            <textarea
              rows={3}
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder="Enter technical knowledge to retain into Hindsight (e.g., 'Kafka partition lag on topic orders resolved by increasing max.poll.interval.ms')..."
              className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors resize-none"
              required
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter query to recall or reflect across stored memories..."
                className="flex-1 bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                required
              />
              <button
                type="submit"
                disabled={sandboxLoading}
                className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime/90 text-midnight text-xs font-bold shadow-md shadow-lime/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {sandboxLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-midnight" />
                )}
                <span>Execute {sandboxTab.toUpperCase()}</span>
              </button>
            </div>
          )}

          {sandboxTab === 'retain' && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sandboxLoading || !contentInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-lime hover:bg-lime/90 text-midnight text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Store Memory</span>
              </button>
            </div>
          )}
        </form>

        {/* Sandbox Output Viewer */}
        {sandboxResult && (
          <div className="p-4 rounded-xl bg-midnight border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted font-mono">
              <span className="text-lime font-bold">Status: {sandboxResult.status || 'OK'}</span>
              <span>Duration: {sandboxResult.duration_ms || 0}ms</span>
            </div>
            <pre className="text-xs font-mono text-pure/90 bg-black/50 p-3 rounded-lg overflow-x-auto leading-relaxed border border-white/5">
              {JSON.stringify(sandboxResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Memory Inventory Explorer */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-pure">Stored Memory Inventory</h3>
            <p className="text-xs text-muted">Filter verified resolutions and ingested error telemetry</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-midnight p-1 rounded-xl border border-white/10 text-xs">
              {(['all', 'verified_resolution', 'error_signature'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filterType === t ? 'bg-white/10 text-pure font-bold' : 'text-muted hover:text-pure'
                  }`}
                >
                  {t === 'verified_resolution' ? 'Verified Fixes' : t === 'error_signature' ? 'Telemetry' : 'All'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search memories..."
                className="pl-9 pr-3 py-1.5 bg-midnight border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Memory Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                mem.type === 'verified_resolution'
                  ? 'bg-lime/[0.03] border-lime/30'
                  : 'bg-midnight/70 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {mem.type === 'verified_resolution' ? (
                    <ShieldCheck className="w-4 h-4 text-lime" />
                  ) : (
                    <Terminal className="w-4 h-4 text-cobalt" />
                  )}
                  <span className="font-bold text-pure">{mem.title}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">
                  {new Date(mem.timestamp).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs font-mono text-pure/90 bg-midnight/90 p-3 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed line-clamp-4">
                {mem.content}
              </p>

              <div className="flex items-center justify-between text-[10px] text-muted font-mono pt-1">
                <span>Services: {mem.services.join(', ') || 'Global'}</span>
                <span className={mem.synced_to_hindsight ? 'text-lime font-bold' : 'text-muted'}>
                  {mem.synced_to_hindsight ? '✓ Hindsight Synced' : 'Local Bank'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Operations Audit Stream */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-pure">Recent Hindsight Operations Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-muted uppercase text-[10px]">
                <th className="py-2.5 px-4">Operation</th>
                <th className="py-2.5 px-4">Content / Query</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Latency</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01]">
                  <td className="py-2.5 px-4 font-bold text-cobalt uppercase">{log.operation_type}</td>
                  <td className="py-2.5 px-4 text-pure/80 max-w-md truncate">{log.query_or_content}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.status === 'success' ? 'bg-lime/10 text-lime' : 'bg-white/10 text-muted'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-muted">{log.latency_ms}ms</td>
                  <td className="py-2.5 px-4 text-right text-muted">{new Date(log.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
