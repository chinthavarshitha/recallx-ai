import React from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Zap, Brain, ArrowUpRight,
  TrendingUp, Database, Activity, ShieldCheck, ChevronRight, Play
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { AnalyticsOverview, Incident } from '../types';

interface DashboardViewProps {
  analytics: AnalyticsOverview | null;
  recentIncidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onNavigateToDemo: () => void;
  onNavigateToCommandCenter: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  recentIncidents,
  onSelectIncident,
  onNavigateToDemo,
  onNavigateToCommandCenter,
}) => {
  const stats = [
    {
      title: 'Total Incidents',
      value: analytics?.total_incidents ?? 4,
      change: '+1 today',
      icon: AlertTriangle,
      color: 'text-pure',
      border: 'border-white/5',
    },
    {
      title: 'Active Incidents',
      value: analytics?.active_incidents ?? 2,
      change: '1 Investigating, 1 Mitigating',
      icon: Activity,
      color: 'text-error',
      border: 'border-error/20 bg-error/[0.02]',
    },
    {
      title: 'Resolved & Retained',
      value: analytics?.resolved_incidents ?? 2,
      change: '100% Retained in Hindsight',
      icon: ShieldCheck,
      color: 'text-lime',
      border: 'border-lime/20 bg-lime/[0.02]',
    },
    {
      title: 'Mean Time to Resolution (MTTR)',
      value: `${analytics?.mttr_minutes ?? 38}m`,
      change: '-74% with Hindsight recall',
      icon: Clock,
      color: 'text-cobalt',
      border: 'border-cobalt/20 bg-cobalt/[0.02]',
    },
    {
      title: 'Memory Recall Accuracy',
      value: `${analytics?.memory_recall_accuracy ?? 94.2}%`,
      change: 'Benchmarked on error signatures',
      icon: Brain,
      color: 'text-lime',
      border: 'border-white/5',
    },
    {
      title: 'AI Learning Activity',
      value: analytics?.ai_learning_activity?.learning_rate ?? '+38%',
      change: 'Resolution acceleration',
      icon: Zap,
      color: 'text-pure',
      border: 'border-white/5',
    },
  ];

  const pieData = analytics?.severity_distribution || [
    { name: 'Critical', value: 2, color: '#FF4D5D' },
    { name: 'High', value: 1, color: '#FF8A00' },
    { name: 'Medium', value: 1, color: '#315CFF' },
    { name: 'Low', value: 0, color: '#C6FF4D' },
  ];

  const trendData = analytics?.incident_trends || [
    { date: 'Nov 01', incidents: 1, resolved: 1 },
    { date: 'Nov 02', incidents: 0, resolved: 0 },
    { date: 'Nov 03', incidents: 2, resolved: 1 },
    { date: 'Nov 04', incidents: 1, resolved: 2 },
    { date: 'Nov 05', incidents: 1, resolved: 1 },
    { date: 'Nov 06', incidents: 0, resolved: 0 },
    { date: 'Nov 07', incidents: 2, resolved: 1 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Hackathon Demo Callout Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cobalt/20 via-graphite to-lime/10 border border-lime/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-lime text-midnight px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
              Featured Demonstration
            </span>
            <span className="text-xs text-lime font-mono font-bold">Hindsight Before vs After</span>
          </div>
          <h3 className="text-xl font-bold text-pure">
            Witness RECALLX Recall Previous Fix on Active Payment Outage
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            INC-2048 is failing with a database connection timeout. Compare the AI agent’s speculative guess without memory versus an immediate evidence-backed resolution recalled from Hindsight.
          </p>
        </div>

        <button
          onClick={onNavigateToDemo}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-lime hover:bg-lime/90 text-midnight text-xs font-bold shadow-md shadow-lime/25 transition-all shrink-0 group"
        >
          <Play className="w-4 h-4 fill-midnight" />
          <span>Launch 60-Second Demo</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-4 rounded-2xl bg-graphite border ${item.border} space-y-2`}>
              <div className="flex items-center justify-between text-muted">
                <span className="text-[11px] font-semibold truncate">{item.title}</span>
                <Icon className="w-4 h-4 text-muted shrink-0" />
              </div>
              <div className={`text-2xl font-extrabold font-mono ${item.color}`}>{item.value}</div>
              <p className="text-[10px] text-muted truncate">{item.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Incident Trends & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Trends Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-pure">Incident Volume & Resolution Velocity</h4>
              <p className="text-xs text-muted">7-Day operational trend across microservices</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-cobalt" />
                Detected
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                Resolved
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#315CFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#315CFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6FF4D" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C6FF4D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#8993A4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8993A4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#315CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="resolved" stroke="#C6FF4D" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Donut Chart */}
        <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-pure">Severity Distribution</h4>
            <p className="text-xs text-muted">Proportion of active vs critical anomalies</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg bg-midnight/60 border border-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted">{entry.name}:</span>
                <span className="text-pure font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recurring Failure Patterns Detected by Hindsight */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cobalt/10 text-cobalt">
              <Brain className="w-5 h-5 text-lime" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-pure">Recurring Failure Patterns (Hindsight Memory Analysis)</h4>
              <p className="text-xs text-muted">Cross-incident synthesis detecting architectural hotspots</p>
            </div>
          </div>
          <span className="text-xs font-mono text-lime bg-lime/10 px-2.5 py-1 rounded-md border border-lime/30">
            3 Active Patterns Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics?.recurring_patterns?.map((pat) => (
            <div key={pat.id} className="p-4 rounded-xl bg-midnight/70 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-pure line-clamp-1">{pat.pattern_name}</span>
                <span className="text-xs font-mono font-bold text-lime shrink-0">{Math.round(pat.confidence * 100)}% Match</span>
              </div>
              <p className="text-[11px] text-muted font-mono">{pat.affected_service}</p>
              <div className="p-2.5 rounded-lg bg-graphite border border-white/5 text-[11px] text-pure/90 font-mono">
                Remedy: {pat.remediation}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted pt-1">
                <span>Observed: {pat.recurrence_count} times</span>
                <span className="text-lime font-medium">{pat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-pure">Recent Production Incidents</h4>
            <p className="text-xs text-muted">Click any incident to open investigation and verified memory history</p>
          </div>
          <button
            onClick={onNavigateToCommandCenter}
            className="flex items-center gap-1 text-xs font-semibold text-cobalt hover:text-pure transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-muted uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Services</th>
                <th className="py-3 px-4">Hindsight Memory</th>
                <th className="py-3 px-4 text-right">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentIncidents.slice(0, 5).map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      inc.severity === 'Critical' ? 'bg-error text-white' :
                      inc.severity === 'High' ? 'bg-orange-500 text-white' :
                      inc.severity === 'Medium' ? 'bg-cobalt text-white' : 'bg-lime text-midnight'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-pure max-w-xs truncate">
                    {inc.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-muted font-mono">{inc.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {inc.affected_services?.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {inc.is_verified ? (
                      <span className="text-lime text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Fix</span>
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">Telemetry Indexed</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-muted font-mono">
                    {new Date(inc.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
