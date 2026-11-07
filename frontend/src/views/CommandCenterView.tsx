import React, { useState } from 'react';
import {
  Search, Filter, Plus, ArrowUpDown, ShieldCheck, Terminal,
  Trash2, Eye, Brain, RefreshCw, CheckCircle2, ChevronRight, AlertOctagon
} from 'lucide-react';
import { Incident, Severity, IncidentStatus } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface CommandCenterViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onOpenNewIncident: () => void;
  onDeleteIncident: (id: string) => Promise<void>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenNewIncident,
  onDeleteIncident,
  onRefresh,
  isRefreshing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'severity'>('created_at');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredIncidents = incidents
    .filter((inc) => {
      const matchesSearch =
        searchTerm === '' ||
        inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inc.affected_services || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await onDeleteIncident(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-pure flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-cobalt" />
            <span>Incident Command Center</span>
          </h2>
          <p className="text-xs text-muted">
            Manage live outages, review diagnostic logs, and certify resolutions in Hindsight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-white/10 bg-graphite text-muted hover:text-pure hover:bg-white/5 transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cobalt' : ''}`} />
          </button>

          <button
            onClick={onOpenNewIncident}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md shadow-cobalt/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-graphite border border-white/5 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, description, or microservice..."
            className="w-full pl-10 pr-4 py-2 bg-midnight/80 border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted font-semibold hidden md:inline">Severity:</span>
          {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-cobalt text-pure font-bold'
                  : 'text-muted hover:text-pure bg-midnight/40'
              }`}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted font-semibold hidden md:inline">Status:</span>
          {(['all', 'Detected', 'Investigating', 'Mitigating', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-white/10 text-pure font-bold'
                  : 'text-muted hover:text-pure bg-midnight/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Showing {filteredIncidents.length} of {incidents.length} total incidents</span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 font-mono text-pure bg-midnight px-2 py-1 rounded border border-white/10 hover:border-cobalt transition-colors"
            >
              <span>Date ({sortOrder.toUpperCase()})</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertOctagon className="w-10 h-10 text-muted mx-auto opacity-40" />
            <p className="text-sm font-semibold text-pure">No matching incidents found</p>
            <p className="text-xs text-muted">Try adjusting your search filters or declare a new incident.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-muted uppercase font-semibold text-[11px]">
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Incident Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Affected Services</th>
                  <th className="py-3.5 px-4">Hindsight Status</th>
                  <th className="py-3.5 px-4">Detected</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        inc.severity === 'Critical' ? 'bg-error text-white' :
                        inc.severity === 'High' ? 'bg-orange-500 text-white' :
                        inc.severity === 'Medium' ? 'bg-cobalt text-white' : 'bg-lime text-midnight'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>

                    <td
                      onClick={() => onSelectIncident(inc)}
                      className="py-3.5 px-4 font-semibold text-pure hover:text-cobalt cursor-pointer max-w-sm"
                    >
                      <div className="truncate">{inc.title}</div>
                      <div className="text-[11px] text-muted font-normal line-clamp-1">{inc.description}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        inc.status === 'Resolved' ? 'bg-lime/10 text-lime border border-lime/30' :
                        inc.status === 'Investigating' ? 'bg-cobalt/20 text-cobalt border border-cobalt/40' :
                        inc.status === 'Mitigating' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                        'bg-error/10 text-error border border-error/30'
                      }`}>
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {inc.affected_services?.map((svc) => (
                          <span key={svc} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-muted">
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {inc.is_verified ? (
                        <span className="text-lime text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Retained Fix</span>
                        </span>
                      ) : (
                        <span className="text-muted text-[11px]">Telemetry Indexed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted font-mono">
                      {new Date(inc.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="p-1.5 rounded-lg text-muted hover:text-pure hover:bg-white/5 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(inc.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete Incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Incident"
        message="Are you sure you want to permanently delete this incident record? All linked telemetry and session logs will be permanently removed."
        confirmLabel="Delete Incident"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
