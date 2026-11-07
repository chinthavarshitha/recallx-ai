import React, { useState } from 'react';
import { X, AlertOctagon, Upload, Terminal, Layers } from 'lucide-react';
import { Severity, IncidentStatus } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [status, setStatus] = useState<IncidentStatus>('Detected');
  const [servicesInput, setServicesInput] = useState('payment-api, postgres-primary');
  const [infrastructure, setInfrastructure] = useState('AWS EKS prod-us-east-1 | Aurora RDS');
  const [description, setDescription] = useState('');
  const [errorLogs, setErrorLogs] = useState('');
  const [stackTrace, setStackTrace] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Incident title is required', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Incident description is required', 'error');
      return;
    }

    const services = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      await api.createIncident({
        title,
        severity,
        status,
        affected_services: services,
        infrastructure_details: infrastructure,
        description,
        error_logs: errorLogs,
        stack_trace: stackTrace,
        tags: ['web', ...services],
      });
      showToast(`Incident "${title}" created and telemetry indexed!`, 'success');
      onCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create incident', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setErrorLogs((prev) => `${prev ? prev + '\n\n' : ''}[LOG FILE: ${file.name}]\n${content.slice(0, 3000)}`);
      showToast(`Loaded ${file.name} into error logs`, 'info');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-graphite border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cobalt/10 text-cobalt">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-pure">Declare New Incident</h2>
              <p className="text-xs text-muted">Ingests telemetry and triggers Hindsight memory pattern query</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-pure transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Incident Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., INC-2055: Payment Gateway DB Connection Latency Spike"
              className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
              required
            />
          </div>

          {/* Severity & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-midnight/80 p-1 rounded-xl border border-white/10">
                {(['Critical', 'High', 'Medium', 'Low'] as Severity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      severity === sev
                        ? sev === 'Critical'
                          ? 'bg-error text-white font-bold'
                          : sev === 'High'
                          ? 'bg-orange-500 text-white font-bold'
                          : sev === 'Medium'
                          ? 'bg-cobalt text-white font-bold'
                          : 'bg-lime text-midnight font-bold'
                        : 'text-muted hover:text-pure'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure focus:outline-none focus:border-cobalt transition-colors"
              >
                <option value="Detected">Detected</option>
                <option value="Investigating">Investigating</option>
                <option value="Mitigating">Mitigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Affected Services & Infrastructure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Affected Services (comma separated)
              </label>
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                placeholder="payment-api, postgres, redis"
                className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Infrastructure Details
              </label>
              <input
                type="text"
                value={infrastructure}
                onChange={(e) => setInfrastructure(e.target.value)}
                placeholder="AWS EKS prod | Aurora RDS 15"
                className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Symptoms & Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what is failing, user impact, error rates, and timing..."
              className="w-full bg-midnight/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors resize-none"
              required
            />
          </div>

          {/* Error Logs & File Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Error Logs / Signatures
              </label>
              <label className="cursor-pointer flex items-center gap-1.5 text-xs text-cobalt hover:text-cobalt/80 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Log File</span>
                <input
                  type="file"
                  accept=".log,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={4}
              value={errorLogs}
              onChange={(e) => setErrorLogs(e.target.value)}
              placeholder="Paste raw log lines, error messages, or exception traces..."
              className="w-full font-mono text-xs bg-midnight/80 border border-white/10 rounded-xl p-3 text-pure/90 placeholder:text-muted/40 focus:outline-none focus:border-cobalt transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-muted hover:text-pure transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md shadow-cobalt/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-3 h-3 border-2 border-pure border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Ingesting...' : 'Declare Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
