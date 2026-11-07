import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, Plus, Mail, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export const TeamView: React.FC = () => {
  const { showToast } = useToast();
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const members = await api.getTeam();
        setTeam(members);
      } catch (err: any) {
        showToast(err.message || 'Failed to fetch team members', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pure flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cobalt" />
            <span>Team Workspace & Incident On-Call</span>
          </h2>
          <p className="text-xs text-muted">
            Manage responders, permissions, and institutional memory retention access
          </p>
        </div>

        <button
          onClick={() => showToast('Invitation link sent to engineer', 'success')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-semibold shadow-md shadow-cobalt/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Engineer</span>
        </button>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((u) => (
          <div key={u.id} className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4 shadow-md">
            <div className="flex items-center gap-3">
              <img
                src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                alt={u.full_name}
                className="w-12 h-12 rounded-full border border-cobalt/40 object-cover"
              />
              <div className="truncate">
                <h3 className="text-sm font-bold text-pure truncate">{u.full_name}</h3>
                <p className="text-xs text-muted font-mono truncate">{u.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className="text-[10px] bg-cobalt/15 text-cobalt px-2 py-0.5 rounded font-mono font-bold">
                {u.role}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-lime">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On-Call Active</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Role-Based Access Table */}
      <div className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-pure">Role-Based Access Matrix</h3>
        <div className="overflow-x-auto text-xs text-muted">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 uppercase text-[10px] text-muted">
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Declare Incident</th>
                <th className="py-2.5 px-4">Run AI Investigation</th>
                <th className="py-2.5 px-4">Certify & Retain Fix</th>
                <th className="py-2.5 px-4">Export PDF Postmortem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { role: 'Incident Commander', p1: '✓', p2: '✓', p3: '✓', p4: '✓' },
                { role: 'SRE Lead', p1: '✓', p2: '✓', p3: '✓', p4: '✓' },
                { role: 'DevOps Engineer', p1: '✓', p2: '✓', p3: '✓', p4: '✓' },
                { role: 'Observer', p1: '—', p2: '✓ (Read-Only)', p3: '—', p4: '✓' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-white/[0.01]">
                  <td className="py-2.5 px-4 font-bold text-pure">{r.role}</td>
                  <td className="py-2.5 px-4 text-lime font-mono">{r.p1}</td>
                  <td className="py-2.5 px-4 text-lime font-mono">{r.p2}</td>
                  <td className="py-2.5 px-4 text-lime font-mono">{r.p3}</td>
                  <td className="py-2.5 px-4 text-lime font-mono">{r.p4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
