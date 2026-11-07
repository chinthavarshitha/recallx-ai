import React from 'react';
import { Plus, Database, Sparkles, RefreshCw, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { BankHealth } from '../types';

interface NavbarProps {
  onOpenNewIncident: () => void;
  bankHealth: BankHealth | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onNavigateToSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewIncident,
  bankHealth,
  onRefresh,
  isRefreshing = false,
  onNavigateToSettings,
}) => {
  const isOnline = bankHealth?.status === 'connected';

  return (
    <header className="h-16 border-b border-white/5 bg-midnight/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Workspace breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-graphite border border-white/10 text-xs font-medium text-pure">
          <div className="w-2 h-2 rounded-full bg-cobalt"></div>
          <span>SRE Enterprise Workspace</span>
        </div>
        <span className="text-muted text-xs hidden sm:inline">•</span>
        <span className="text-muted text-xs hidden sm:inline">Bank: <span className="font-mono text-pure">{bankHealth?.bank_id || 'recallx-sre-workspace'}</span></span>
      </div>

      {/* Right: Hindsight status + Actions */}
      <div className="flex items-center gap-3">
        {/* Hindsight Health Indicator Pill */}
        <div
          onClick={onNavigateToSettings}
          title="Click to view Hindsight Memory Layer settings"
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium bg-graphite/70 hover:bg-graphite border-white/10"
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-lime' : 'bg-lime/80'
              }`}
            />
            {isOnline && (
              <span className="absolute w-3.5 h-3.5 rounded-full bg-lime/30 animate-ping" />
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-pure font-semibold">Hindsight</span>
            <span className="text-[10px] text-muted font-mono">
              {isOnline ? 'Online' : 'Active (Local)'}
            </span>
          </div>

          <span className="text-[10px] bg-cobalt/20 text-cobalt px-1.5 py-0.2 rounded font-mono font-semibold">
            v{bankHealth?.sdk_version || '1.2.0'}
          </span>
        </div>

        {/* Refresh Telemetry Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sync & refresh telemetry"
          className="p-2 rounded-xl text-muted hover:text-pure hover:bg-white/5 border border-white/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cobalt' : ''}`} />
        </button>

        {/* Create Incident Button */}
        <button
          onClick={onOpenNewIncident}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md shadow-cobalt/25 transition-all group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>New Incident</span>
        </button>
      </div>
    </header>
  );
};
