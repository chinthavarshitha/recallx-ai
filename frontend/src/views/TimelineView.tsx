import React from 'react';
import { GitCommit, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Incident } from '../types';

interface TimelineViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ incidents, onSelectIncident }) => {
  // Sort incidents by date descending
  const sorted = [...incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
          <GitCommit className="w-5 h-5 text-cobalt" />
          <span>Historical Incident Timeline</span>
        </h2>
        <p className="text-xs text-muted">
          Chronological milestone log of all outages, architectural changes, and Hindsight knowledge retentions
        </p>
      </div>

      <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {sorted.map((inc) => (
          <div key={inc.id} className="relative group">
            {/* Timeline Node Dot */}
            <div
              className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-midnight transition-transform group-hover:scale-125 ${
                inc.is_verified ? 'bg-lime ring-4 ring-lime/20' : 'bg-cobalt ring-4 ring-cobalt/20'
              }`}
            />

            <div
              onClick={() => onSelectIncident(inc)}
              className="p-5 rounded-2xl bg-graphite border border-white/5 hover:border-cobalt/40 cursor-pointer transition-all space-y-3 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    inc.severity === 'Critical' ? 'bg-error text-white' :
                    inc.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-cobalt text-white'
                  }`}>
                    {inc.severity}
                  </span>
                  <h3 className="text-sm font-bold text-pure">{inc.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(inc.created_at).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed line-clamp-2">
                {inc.description}
              </p>

              {/* Verified Resolution snippet if present */}
              {inc.verified_resolution && (
                <div className="p-3 rounded-xl bg-lime/[0.04] border border-lime/30 text-xs font-mono text-pure space-y-1">
                  <div className="text-lime text-[10px] font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Hindsight Certified Fix</span>
                  </div>
                  <p className="text-[11px] text-pure/90 line-clamp-2">{inc.verified_resolution}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-muted font-mono">
                <span>Services: {inc.affected_services?.join(', ') || 'Core API'}</span>
                <span className="text-cobalt group-hover:text-pure font-semibold flex items-center gap-1">
                  <span>Inspect Timeline Events</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
