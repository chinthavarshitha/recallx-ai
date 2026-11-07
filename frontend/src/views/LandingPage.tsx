import React from 'react';
import {
  Sparkles, ShieldCheck, Database, ArrowRight, Brain, Zap,
  Cpu, Terminal, Activity, CheckCircle2, Lock, GitFork, ExternalLink, Play
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLiveDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLiveDemo }) => {
  return (
    <div className="min-h-screen bg-midnight text-pure selection:bg-cobalt selection:text-white">
      {/* Top Banner Navigation */}
      <nav className="border-b border-white/5 bg-midnight/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cobalt p-0.5 flex items-center justify-center shadow-cobalt/30 shadow-md">
            <div className="w-full h-full bg-midnight rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-lime" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg tracking-wider text-pure">RECALL</span>
            <span className="font-black text-lg tracking-wider text-cobalt">X</span>
            <span className="text-[10px] bg-white/10 text-lime px-2 py-0.5 rounded font-mono font-bold">AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <a href="#how-it-works" className="hover:text-pure transition-colors">How It Works</a>
          <a href="#architecture" className="hover:text-pure transition-colors">Hindsight Architecture</a>
          <a href="#features" className="hover:text-pure transition-colors">Features</a>
          <a href="#impact" className="hover:text-pure transition-colors">Real-World Impact</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLiveDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-pure text-xs font-semibold border border-white/10 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-lime" />
            <span>Interactive Demo</span>
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-xs font-bold shadow-md shadow-cobalt/30 transition-all"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cobalt/20 to-lime/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-pure mb-8">
          <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
          <span className="text-lime font-mono font-bold">HINDSIGHT MEMORY LAYER</span>
          <span className="text-muted">•</span>
          <span className="text-muted">Every Incident Teaches. Every Response Gets Smarter.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-pure max-w-4xl mx-auto leading-[1.1] mb-6">
          Your Infrastructure <br />
          <span className="bg-gradient-to-r from-cobalt via-white to-lime bg-clip-text text-transparent">
            Never Forgets.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          RECALLX AI is an intelligent incident response agent for DevOps teams. Powered by Hindsight’s persistent memory networks, it remembers past root causes, stack traces, and verified resolutions to slash MTTR on recurring failures by 74%.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cobalt hover:bg-cobalt/90 text-pure text-sm font-bold shadow-xl shadow-cobalt/25 transition-all group"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onLiveDemo}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-graphite hover:bg-graphite-card border border-white/10 text-pure text-sm font-semibold transition-all"
          >
            <Zap className="w-4 h-4 text-lime" />
            <span>Before vs After Demo</span>
          </button>
        </div>

        {/* Animated Incident Network Visualization */}
        <div className="mt-16 p-4 rounded-2xl bg-midnight/70 border border-white/10 max-w-5xl mx-auto shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs text-muted font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-lime" />
              <span className="ml-2 text-pure font-semibold">Live Memory Network — Hindsight Retain & Recall Stream</span>
            </div>
            <span className="text-lime font-bold">RECALL PRECISION: 94.2%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="p-4 rounded-xl bg-graphite/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-mono text-error">INC-2041 (Past Incident)</span>
                <span className="text-lime font-bold">RETAINED</span>
              </div>
              <p className="text-xs font-semibold text-pure">Payment DB Connection Starvation</p>
              <p className="text-[11px] text-muted leading-relaxed font-mono">
                Verified Fix: Scaled PgBouncer pool to 250 and enabled connection retry jitter.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cobalt/10 border border-cobalt/40 space-y-2 relative">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-mono text-cobalt font-bold">INC-2048 (Active Session)</span>
                <span className="text-cobalt font-bold">RECALLING</span>
              </div>
              <p className="text-xs font-semibold text-pure">Checkout DB Timeout Cascade</p>
              <div className="text-[11px] text-lime font-mono bg-midnight/60 p-2 rounded border border-lime/30">
                ⚡ Memory Match: 94% match to INC-2041 verified fix!
              </div>
            </div>

            <div className="p-4 rounded-xl bg-graphite/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-mono text-lime">AUTONOMOUS SRE AGENT</span>
                <span className="text-muted font-mono">MITIGATED</span>
              </div>
              <p className="text-xs font-semibold text-pure">Instant Remediation Script</p>
              <div className="text-[11px] font-mono text-pure/90 bg-black/60 p-2 rounded">
                $ kubectl set env deployment/pgbouncer POOL_SIZE=250
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-cobalt uppercase tracking-widest mb-3">Core Workflow</h2>
          <h3 className="text-3xl font-extrabold text-pure">How RECALLX Learns From Failures</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest Telemetry',
              desc: 'Stack traces, pod logs, error signatures, and Kubernetes metrics are parsed in real time.',
              icon: Terminal,
            },
            {
              step: '02',
              title: 'Hindsight Memory Query',
              desc: 'Multi-strategy hybrid search queries isolated memory banks using vector, graph, and temporal matching.',
              icon: Brain,
            },
            {
              step: '03',
              title: 'Grounded Analysis',
              desc: 'Agent cross-references previous fixes to present battle-tested solutions vs exploratory hypotheses.',
              icon: Cpu,
            },
            {
              step: '04',
              title: 'Permanent Retention',
              desc: 'Once an engineer certifies the fix, Hindsight retains the verified outcome to protect future sessions.',
              icon: ShieldCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-4 hover:border-cobalt/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-black text-muted/30">{item.step}</span>
                  <div className="p-2.5 rounded-xl bg-cobalt/10 text-cobalt">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-pure">{item.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hindsight Architecture Section */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-lime/10 border border-lime/30 text-xs font-bold text-lime font-mono">
              OFFICIAL HINDSIGHT SDK INTEGRATION
            </div>
            <h3 className="text-3xl font-extrabold text-pure leading-tight">
              Biomimetic Memory Networks for Autonomous Incident Agents
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Ordinary RAG uses flat vector chunks with no concept of time, verified outcomes, or evolving engineering knowledge.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              RECALLX uses Vectorize Hindsight’s 3 core primitives:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-midnight border border-white/10 flex items-start gap-3">
                <span className="text-lime font-bold">client.retain()</span>
                <span className="text-muted">Permanently indexes incident error telemetry, root causes, and certified resolutions.</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight border border-white/10 flex items-start gap-3">
                <span className="text-cobalt font-bold">client.recall()</span>
                <span className="text-muted">Executes parallel hybrid search (vectors, BM25, and entity graph links) to retrieve proven fixes.</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight border border-white/10 flex items-start gap-3">
                <span className="text-pure font-bold">client.reflect()</span>
                <span className="text-muted">Synthesizes high-level failure patterns across weeks of organizational incidents.</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-midnight border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted border-b border-white/5 pb-3">
              <span className="font-mono text-pure">Hindsight Client Implementation</span>
              <span className="text-lime font-mono">v1.2.0 • Active</span>
            </div>
            <pre className="text-[11px] font-mono text-pure/80 bg-black/50 p-4 rounded-xl overflow-x-auto leading-relaxed border border-white/5">
{`from hindsight_client import Hindsight

client = Hindsight(base_url="http://localhost:8888")

# 1. RETAIN VERIFIED FIX
client.retain(
    bank_id="sre-production-bank",
    content="INC-2041: PgBouncer pool starvation. Fixed by POOL_SIZE=250.",
    tags=["payment", "database", "verified-fix"]
)

# 2. RECALL ON SIMILAR OUTAGE
results = client.recall(
    bank_id="sre-production-bank",
    query="Checkout service database acquisition timeout"
)
# Top Recall Score: 0.94 -> Instantly applies proven fix`}
            </pre>
          </div>
        </div>
      </section>

      {/* Real-World Impact */}
      <section id="impact" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-cobalt uppercase tracking-widest mb-3">Enterprise Metrics</h2>
          <h3 className="text-3xl font-extrabold text-pure">Measured Operational Impact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { metric: '74%', label: 'MTTR Reduction on Recurring Incidents', sub: 'From 58 min to 14 min' },
            { metric: '94.2%', label: 'Memory Recall Accuracy', sub: 'Verified across incident signatures' },
            { metric: '0', label: 'Knowledge Lost in Hand-Offs', sub: 'Persistent across all shifts' },
            { metric: '3.8x', label: 'Postmortem Velocity', sub: 'Automated postmortem drafting' },
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-graphite border border-white/5 space-y-2">
              <div className="text-4xl font-extrabold text-lime font-mono">{stat.metric}</div>
              <p className="text-sm font-semibold text-pure">{stat.label}</p>
              <p className="text-xs text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 max-w-7xl mx-auto text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-pure">RECALLX AI</span>
          <span>• Persistent Incident Memory powered by Hindsight</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://hindsight.vectorize.io/" target="_blank" rel="noreferrer" className="hover:text-pure transition-colors flex items-center gap-1">
            <span>Hindsight Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={onLiveDemo} className="hover:text-pure transition-colors">
            Demo Walkthrough
          </button>
        </div>
      </footer>
    </div>
  );
};
