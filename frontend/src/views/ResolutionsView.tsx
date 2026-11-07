import React, { useState } from 'react';
import { CheckSquare, ShieldCheck, Search, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { Incident } from '../types';
import { useToast } from '../components/Toast';

interface ResolutionsViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const ResolutionsView: React.FC<ResolutionsViewProps> = ({ incidents, onSelectIncident }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const verifiedIncidents = incidents.filter(
    (i) => i.is_verified || i.verified_resolution || i.resolution_steps
  );

  const filtered = verifiedIncidents.filter((inc) => {
    const term = searchTerm.toLowerCase();
    return (
      inc.title.toLowerCase().includes(term) ||
      (inc.verified_resolution || '').toLowerCase().includes(term) ||
      (inc.affected_services || []).some((s) => s.toLowerCase().includes(term))
    );
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Resolution command copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-lime" />
            <span>Resolution Playbook & Certified Knowledge</span>
          </h2>
          <p className="text-xs text-muted">
            Battle-tested remediation procedures permanently recorded in Hindsight
          </p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search verified playbooks..."
            className="w-full pl-10 pr-4 py-2 bg-graphite border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((inc) => {
          const resolutionText = inc.verified_resolution || inc.resolution_steps || 'Resolution verified.';
          return (
            <div
              key={inc.id}
              className="p-6 rounded-2xl bg-graphite border border-lime/30 space-y-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-lime font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hindsight Certified Fix</span>
                  </div>
                  <span className="text-muted font-mono">{new Date(inc.created_at).toLocaleDateString()}</span>
                </div>

                <h3
                  onClick={() => onSelectIncident(inc)}
                  className="text-sm font-bold text-pure hover:text-cobalt cursor-pointer transition-colors"
                >
                  {inc.title}
                </h3>

                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {inc.description}
                </p>

                <div className="p-4 rounded-xl bg-midnight/90 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                    <span>Certified Remediation:</span>
                    <button
                      onClick={() => handleCopy(inc.id, resolutionText)}
                      className="text-cobalt hover:text-pure transition-colors flex items-center gap-1"
                    >
                      {copiedId === inc.id ? <Check className="w-3.5 h-3.5 text-lime" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === inc.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-pure/90 whitespace-pre-wrap leading-relaxed">
                    {resolutionText}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <div className="flex gap-1">
                  {inc.affected_services?.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-muted">
                      {s}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onSelectIncident(inc)}
                  className="text-cobalt hover:text-pure font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open Incident Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
