import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Brain, Key, CheckCircle2, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { BankHealth } from '../types';
import { useToast } from '../components/Toast';

interface SettingsViewProps {
  bankHealth: BankHealth | null;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ bankHealth, onRefreshHealth }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings form
  const [hindsightUrl, setHindsightUrl] = useState('http://localhost:8888');
  const [hindsightKey, setHindsightKey] = useState('');
  const [bankId, setBankId] = useState('recallx-sre-workspace');
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');

  // Load existing settings
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const s = await api.getSettings();
        setHindsightUrl(s.hindsight_api_url || 'http://localhost:8888');
        setBankId(s.hindsight_bank_id || 'recallx-sre-workspace');
        setGroqModel(s.groq_model || 'llama-3.3-70b-versatile');
      } catch (err: any) {
        showToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        hindsight_api_url: hindsightUrl,
        hindsight_api_key: hindsightKey || undefined,
        hindsight_bank_id: bankId,
        groq_api_key: groqKey || undefined,
        groq_model: groqModel
      });
      showToast('Settings & Integrations successfully updated!', 'success');
      onRefreshHealth();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isHindsightOnline = bankHealth?.status === 'connected';

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-cobalt" />
          <span>Platform Settings & Engine Integrations</span>
        </h2>
        <p className="text-xs text-muted">
          Configure official Hindsight memory layer, Groq API keys, and isolated organization memory banks
        </p>
      </div>

      {/* Integration Diagnostic Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hindsight Status */}
        <div className={`p-5 rounded-2xl border space-y-2 ${
          isHindsightOnline ? 'bg-lime/[0.03] border-lime/30' : 'bg-graphite border-white/5'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-pure flex items-center gap-1.5">
              <Database className="w-4 h-4 text-lime" />
              <span>Hindsight Memory Engine</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              isHindsightOnline ? 'bg-lime text-midnight' : 'bg-white/10 text-muted'
            }`}>
              {isHindsightOnline ? 'CONNECTED' : 'LOCAL BANK (PORT 8888 OFFLINE)'}
            </span>
          </div>
          <p className="text-xs text-muted font-mono truncate">Endpoint: {bankHealth?.base_url || hindsightUrl}</p>
          <div className="flex items-center justify-between text-[11px] text-muted pt-1">
            <span>SDK Version: <strong className="text-pure">v{bankHealth?.sdk_version || '1.2.0'}</strong></span>
            <span>Bank: <strong className="text-pure">{bankHealth?.bank_id || bankId}</strong></span>
          </div>
        </div>

        {/* Groq Model Status */}
        <div className="p-5 rounded-2xl bg-graphite border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-pure flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-cobalt" />
              <span>Groq AI Inference Engine</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cobalt/20 text-cobalt">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-muted font-mono truncate">Model: {groqModel}</p>
          <div className="flex items-center justify-between text-[11px] text-muted pt-1">
            <span>Inference: <strong className="text-pure">High-Speed LPU</strong></span>
            <span>Structured JSON: <strong className="text-lime">Enabled</strong></span>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-6">
        <h3 className="text-sm font-bold text-pure flex items-center gap-2">
          <Key className="w-4 h-4 text-cobalt" />
          <span>Core Engine Credentials & Parameters</span>
        </h3>

        {/* Hindsight Settings */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Hindsight Memory Layer</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Hindsight Server Base URL
              </label>
              <input
                type="text"
                value={hindsightUrl}
                onChange={(e) => setHindsightUrl(e.target.value)}
                placeholder="http://localhost:8888 or https://api.hindsight.vectorize.io"
                className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
                required
              />
              <span className="text-[10px] text-muted block mt-1">Official client communicates over HTTP/REST</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Target Memory Bank ID (Organization Namespace)
              </label>
              <input
                type="text"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                placeholder="recallx-sre-workspace"
                className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
                required
              />
              <span className="text-[10px] text-muted block mt-1">Isolates memories between workspaces</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Hindsight API Key (Optional for Cloud instances)
            </label>
            <input
              type="password"
              value={hindsightKey}
              onChange={(e) => setHindsightKey(e.target.value)}
              placeholder="Leave empty for local Docker instance"
              className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
            />
          </div>
        </div>

        {/* Groq Settings */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Groq AI Inference Model</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Groq API Key
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
              />
              <span className="text-[10px] text-muted block mt-1">Stored securely on server; never exposed to frontend</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Model Identifier
              </label>
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-2.5 text-xs text-pure font-mono focus:outline-none focus:border-cobalt transition-colors"
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                <option value="qwen/qwen3-32b">qwen/qwen3-32b</option>
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onRefreshHealth}
            className="flex items-center gap-1.5 text-xs text-cobalt hover:text-pure transition-colors font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Connection Health</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-bold shadow-md shadow-cobalt/25 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
