import React from 'react';
import { ShieldAlert, Brain, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
import { Incident, AnalyticsOverview } from '../types';

interface RootCauseAnalysisViewProps {
  incidents: Incident[];
  analytics: AnalyticsOverview | null;
  onSelectIncident: (inc: Incident) => void;
}

export const RootCauseAnalysisView: React.FC<RootCauseAnalysisViewProps> = ({
  incidents,
  analytics,
  onSelectIncident,
}) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-cobalt" />
          <span>Root Cause Intelligence & Failure Taxonomy</span>
        </h2>
        <p className="text-xs text-muted">
          Machine-learned root cause catalog synthesized by Hindsight across historical incidents
        </p>
      </div>

      {/* Cross-Incident Recurring Failure Patterns */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-pure flex items-center gap-2">
          <Brain className="w-4 h-4 text-lime" />
          <span>Active Recurring Patterns Detected in Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {analytics?.recurring_patterns?.map((pat) => (
            <div key={pat.id} className="p-5 rounded-2xl bg-graphite border border-white/5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pure line-clamp-1">{pat.pattern_name}</span>
                <span className="font-mono text-lime font-bold shrink-0">{Math.round(pat.confidence * 100)}% Match</span>
              </div>
              <p className="text-xs text-muted font-mono">{pat.affected_service}</p>
              <div className="p-3 rounded-xl bg-midnight/80 border border-white/5 text-xs text-pure/90 font-mono space-y-1">
                <div className="text-[10px] text-muted">Remediation Blueprint:</div>
                <p>{pat.remediation}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-white/5">
                <span>Occurred: {pat.recurrence_count} times</span>
                <span className="text-lime font-medium">{pat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog of Diagnosed Root Causes */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-pure">Diagnosed Root Causes by Incident</h3>
        <div className="space-y-3">
          {incidents.filter((i) => i.root_cause).map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="p-4 rounded-xl bg-midnight/60 border border-white/5 hover:border-cobalt/40 cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pure">{inc.title}</span>
                <span className="font-mono text-muted">{new Date(inc.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-pure/90 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                {inc.root_cause}
              </p>
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Services: {inc.affected_services?.join(', ') || 'Global'}</span>
                <span className="text-cobalt font-semibold">Inspect Full Root Cause Analysis →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
