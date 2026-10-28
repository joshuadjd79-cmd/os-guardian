import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './hooks/useSimulation';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { ProcessDrawer } from './components/ProcessDrawer';
import { GuidedDemoModal } from './components/GuidedDemoModal';

import { OverviewDashboard } from './pages/OverviewDashboard';
import { LiveProcessMonitor } from './pages/LiveProcessMonitor';
import { RecoveryCenter } from './pages/RecoveryCenter';
import { DecisionExplainability } from './pages/DecisionExplainability';
import { ExperimentsBenchmarks } from './pages/ExperimentsBenchmarks';
import { EventTimeline } from './pages/EventTimeline';
import { AlgorithmLaboratory } from './pages/AlgorithmLaboratory';
import { ArchitectureInspector } from './pages/ArchitectureInspector';
import { CustomWorkloadBuilder } from './pages/CustomWorkloadBuilder';
import { ReportsExportCenter } from './pages/ReportsExportCenter';
import { SettingsAbout } from './pages/SettingsAbout';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const { selectedProcess, setSelectedProcess } = useSimulation();

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewDashboard onOpenDemo={() => setIsDemoOpen(true)} onNavigateTab={setCurrentTab} />;
      case 'processes':
        return <LiveProcessMonitor />;
      case 'laboratory':
        return <AlgorithmLaboratory />;
      case 'recovery':
        return <RecoveryCenter />;
      case 'explainability':
        return <DecisionExplainability />;
      case 'experiments':
        return <ExperimentsBenchmarks />;
      case 'architecture':
        return <ArchitectureInspector />;
      case 'workload-builder':
        return <CustomWorkloadBuilder />;
      case 'reports':
        return <ReportsExportCenter />;
      case 'timeline':
        return <EventTimeline />;
      case 'settings':
        return <SettingsAbout />;
      default:
        return <OverviewDashboard onOpenDemo={() => setIsDemoOpen(true)} onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07050e] flex flex-col font-sans text-slate-100">
      <Header onOpenGuidedDemo={() => setIsDemoOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#090615] to-[#07050e]">
          {renderContent()}
        </main>
      </div>

      {/* Global Process Inspection Drawer */}
      <ProcessDrawer
        process={selectedProcess}
        onClose={() => setSelectedProcess(null)}
      />

      {/* Guided Reviewer Demo Modal */}
      <GuidedDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setIsDemoOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <MainLayout />
    </SimulationProvider>
  );
}
