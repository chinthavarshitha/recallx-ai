import React, { useState } from 'react';
import { Sparkles, Shield, ArrowRight, Lock, Mail, User, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

interface AuthViewProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onBackToLanding }) => {
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('Production SRE Team');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await api.register({ email, password, full_name: fullName, role: 'DevOps_Engineer' });
        showToast('Account registered successfully! Welcome to RECALLX.', 'success');
      } else {
        await api.login(email, password);
        showToast('Signed in successfully!', 'success');
      }
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await api.login('commander@recallx.ai', 'recallx2026');
      showToast('Logged in as Lead Incident Commander (Sarah Chen)', 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cobalt/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full bg-graphite border border-white/10 rounded-2xl p-8 shadow-2xl relative space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cobalt p-0.5 flex items-center justify-center mx-auto shadow-cobalt/30 shadow-md">
            <div className="w-full h-full bg-midnight rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-lime" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-pure">
            RECALL<span className="text-cobalt">X</span> <span className="text-lime text-xs font-mono font-bold">AI</span>
          </h2>
          <p className="text-xs text-muted">
            {isRegister ? 'Provision your team incident memory bank' : 'Access enterprise incident response center'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-midnight p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegister ? 'bg-cobalt text-pure' : 'text-muted hover:text-pure'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegister ? 'bg-cobalt text-pure' : 'text-muted hover:text-pure'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Demo Button */}
        {!isRegister && (
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-lime/10 hover:bg-lime/20 border border-lime/30 text-lime text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Demo Login (Lead Commander)</span>
          </button>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Chen"
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@recallx.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-midnight border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-midnight border border-white/10 rounded-xl text-xs text-pure placeholder:text-muted/50 focus:outline-none focus:border-cobalt transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-bold shadow-md shadow-cobalt/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-pure border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isRegister ? 'Initialize Memory Bank' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5">
          <button
            onClick={onBackToLanding}
            className="text-xs text-muted hover:text-pure transition-colors"
          >
            ← Return to Product Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
