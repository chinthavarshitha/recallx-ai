import React from 'react';
import {
  LayoutDashboard, AlertOctagon, Brain, Search, GitCommit,
  BookOpen, CheckSquare, BarChart3, Users, Settings,
  Sparkles, Globe, LogOut, ArrowRightLeft, ShieldAlert
} from 'lucide-react';
import { User } from '../types';

export type NavigationPage =
  | 'landing'
  | 'dashboard'
  | 'command-center'
  | 'investigation'
  | 'demo-comparison'
  | 'memory-explorer'
  | 'timeline'
  | 'root-causes'
  | 'resolutions'
  | 'analytics'
  | 'team'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  currentUser: User | null;
  onLogout: () => void;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  activeIncidentsCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    {
      id: 'command-center',
      label: 'Command Center',
      icon: AlertOctagon,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : undefined,
      badgeColor: 'bg-error text-white'
    },
    { id: 'investigation', label: 'AI Investigation', icon: Brain },
    {
      id: 'demo-comparison',
      label: 'AI Learning Demo',
      icon: ArrowRightLeft,
      highlight: true,
      badge: 'HACKATHON',
      badgeColor: 'bg-lime text-midnight font-bold'
    },
    { id: 'memory-explorer', label: 'Hindsight Explorer', icon: Search },
    { id: 'timeline', label: 'Incident Timeline', icon: GitCommit },
    { id: 'root-causes', label: 'Root Cause Analysis', icon: ShieldAlert },
    { id: 'resolutions', label: 'Resolution Playbook', icon: CheckSquare },
    { id: 'analytics', label: 'Knowledge & Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team Workspace', icon: Users },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-midnight border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cobalt to-cobalt/70 p-0.5 flex items-center justify-center shadow-cobalt/20 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-midnight rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-lime" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-pure">RECALL</span>
              <span className="font-extrabold text-base tracking-wider text-cobalt">X</span>
              <span className="text-[10px] bg-white/10 text-lime px-1.5 py-0.5 rounded font-mono font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-muted tracking-tight truncate max-w-[130px]">Hindsight Memory Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted/70 uppercase">
          Incident Response
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavigationPage)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-cobalt/15 text-pure border border-cobalt/30 shadow-sm'
                  : 'text-muted hover:text-pure hover:bg-white/[0.04]'
              } ${item.highlight && !isActive ? 'border border-lime/20 bg-lime/[0.03]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-lime'
                      : item.highlight
                      ? 'text-lime/80'
                      : 'text-muted group-hover:text-pure'
                  }`}
                />
                <span className={item.highlight && !isActive ? 'text-lime/90 font-medium' : ''}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${item.badgeColor || 'bg-white/10 text-muted'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted/70 uppercase">
          Public
        </div>
        <button
          onClick={() => onNavigate('landing')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentPage === 'landing'
              ? 'bg-white/10 text-pure border border-white/20'
              : 'text-muted hover:text-pure hover:bg-white/[0.04]'
          }`}
        >
          <Globe className="w-4 h-4 text-muted" />
          <span>Product Landing</span>
        </button>
      </div>

      {/* User & Workspace Footer */}
      <div className="p-4 border-t border-white/5 bg-graphite/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
              alt={currentUser?.full_name || 'User'}
              className="w-8 h-8 rounded-full border border-cobalt/40 object-cover shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-pure truncate">{currentUser?.full_name || 'Sarah Chen'}</p>
              <p className="text-[10px] text-muted truncate">{currentUser?.role || 'Lead Incident Commander'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
