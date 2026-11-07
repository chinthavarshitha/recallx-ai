import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastProvider, useToast } from './components/Toast';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { CommandCenterView } from './views/CommandCenterView';
import { DemoComparisonView } from './views/DemoComparisonView';
import { InvestigationWorkspaceView } from './views/InvestigationWorkspaceView';
import { MemoryExplorerView } from './views/MemoryExplorerView';
import { TimelineView } from './views/TimelineView';
import { RootCauseAnalysisView } from './views/RootCauseAnalysisView';
import { ResolutionsView } from './views/ResolutionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';

import { api } from './services/api';
import { Incident, AnalyticsOverview, BankHealth, User } from './types';

const MainApp: React.FC = () => {
  const { showToast } = useToast();
  
  // Navigation
  const [currentPage, setCurrentPage] = useState<NavigationPage | 'auth'>('dashboard');

  // Core Data
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [bankHealth, setBankHealth] = useState<BankHealth | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Incidents
      const incRes = await api.getIncidents();
      setIncidents(incRes.items || []);

      // 2. Analytics
      const anRes = await api.getAnalytics();
      setAnalytics(anRes);

      // 3. Hindsight Health
      const healthRes = await api.getHindsightHealth();
      setBankHealth(healthRes);

      // 4. User
      try {
        const me = await api.getMe();
        setCurrentUser(me);
      } catch {
        // Fallback demo user if unauthenticated
        setCurrentUser({
          id: 'demo-commander',
          email: 'commander@recallx.ai',
          full_name: 'Sarah Chen (Lead Commander)',
          role: 'Incident_Commander',
          created_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.warn('Data load warning:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenIncidentDetail = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailModalOpen(true);
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await api.deleteIncident(id);
      showToast('Incident deleted successfully', 'success');
      loadData();
      if (selectedIncident?.id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete incident', 'error');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentPage('landing');
    showToast('Signed out', 'info');
  };

  // If on landing or auth page, render without dashboard shell
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setCurrentPage('dashboard')}
        onLiveDemo={() => setCurrentPage('demo-comparison')}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthView
        onSuccess={() => setCurrentPage('dashboard')}
        onBackToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  const activeIncidentsCount = incidents.filter(
    (i) => i.status === 'Detected' || i.status === 'Investigating' || i.status === 'Mitigating'
  ).length;

  return (
    <div className="min-h-screen bg-midnight text-pure flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar
          onOpenNewIncident={() => setIsCreateModalOpen(true)}
          bankHealth={bankHealth}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onNavigateToSettings={() => setCurrentPage('settings')}
        />

        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              recentIncidents={incidents}
              onSelectIncident={handleOpenIncidentDetail}
              onNavigateToDemo={() => setCurrentPage('demo-comparison')}
              onNavigateToCommandCenter={() => setCurrentPage('command-center')}
            />
          )}

          {currentPage === 'command-center' && (
            <CommandCenterView
              incidents={incidents}
              onSelectIncident={handleOpenIncidentDetail}
              onOpenNewIncident={() => setIsCreateModalOpen(true)}
              onDeleteIncident={handleDeleteIncident}
              onRefresh={loadData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentPage === 'demo-comparison' && (
            <DemoComparisonView
              incidents={incidents}
              onSelectIncident={handleOpenIncidentDetail}
            />
          )}

          {currentPage === 'investigation' && (
            <InvestigationWorkspaceView
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
            />
          )}

          {currentPage === 'memory-explorer' && (
            <MemoryExplorerView bankHealth={bankHealth} />
          )}

          {currentPage === 'timeline' && (
            <TimelineView
              incidents={incidents}
              onSelectIncident={handleOpenIncidentDetail}
            />
          )}

          {currentPage === 'root-causes' && (
            <RootCauseAnalysisView
              incidents={incidents}
              analytics={analytics}
              onSelectIncident={handleOpenIncidentDetail}
            />
          )}

          {currentPage === 'resolutions' && (
            <ResolutionsView
              incidents={incidents}
              onSelectIncident={handleOpenIncidentDetail}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {currentPage === 'team' && (
            <TeamView />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              bankHealth={bankHealth}
              onRefreshHealth={loadData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={loadData}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdated={loadData}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
