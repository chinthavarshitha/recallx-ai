import React from 'react';
import { BarChart3, TrendingUp, Zap, Clock, ShieldCheck, Brain } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line
} from 'recharts';
import { AnalyticsOverview } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  const mttrProgression = [
    { period: 'Week 1 (Unassisted)', mttr: 58 },
    { period: 'Week 2 (Basic RAG)', mttr: 46 },
    { period: 'Week 3 (Hindsight Retain)', mttr: 28 },
    { period: 'Week 4 (Full Recall)', mttr: 14 },
  ];

  const serviceLoad = [
    { service: 'payment-api', incidents: 3, resolved: 3 },
    { service: 'postgres-db', incidents: 3, resolved: 2 },
    { service: 'checkout-web', incidents: 2, resolved: 2 },
    { service: 'redis-cache', incidents: 1, resolved: 1 },
    { service: 'kafka-queue', incidents: 1, resolved: 0 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-cobalt" />
          <span>Knowledge Insights & Performance Analytics</span>
        </h2>
        <p className="text-xs text-muted">
          Telemetry telemetry efficiency, MTTR acceleration, and institutional memory retention curves
        </p>
      </div>

      {/* Top 3 Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-graphite border border-lime/30 space-y-2">
          <span className="text-[11px] font-mono font-bold text-lime uppercase tracking-wider">
            MTTR Compression Curve
          </span>
          <div className="text-3xl font-extrabold font-mono text-pure">-74%</div>
          <p className="text-xs text-muted">
            Average time to resolution dropped from 58 mins to 14 mins on recurring failure signatures.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-graphite border border-cobalt/30 space-y-2">
          <span className="text-[11px] font-mono font-bold text-cobalt uppercase tracking-wider">
            Knowledge Retention Rate
          </span>
          <div className="text-3xl font-extrabold font-mono text-pure">100%</div>
          <p className="text-xs text-muted">
            All engineer-certified fixes permanently stored into isolated Hindsight memory banks.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-2">
          <span className="text-[11px] font-mono font-bold text-pure uppercase tracking-wider">
            Recall Precision
          </span>
          <div className="text-3xl font-extrabold font-mono text-lime">94.2%</div>
          <p className="text-xs text-muted">
            Benchmarked against historical Postgres pool exhaustion and Redis eviction telemetry.
          </p>
        </div>
      </div>

      {/* MTTR Progression Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-pure">MTTR Reduction Progression (Minutes)</h4>
            <p className="text-xs text-muted">Impact of progressive Hindsight memory accumulation</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mttrProgression}>
                <XAxis dataKey="period" stroke="#8993A4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8993A4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="mttr" fill="#315CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Outage Density */}
        <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-pure">Incident Frequency by Microservice</h4>
            <p className="text-xs text-muted">Total detected anomalies vs verified resolutions</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceLoad}>
                <XAxis dataKey="service" stroke="#8993A4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8993A4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="incidents" fill="#FF4D5D" radius={[6, 6, 0, 0]} name="Detected" />
                <Bar dataKey="resolved" fill="#C6FF4D" radius={[6, 6, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
