import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './hooks/useSimulation';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { ProcessDrawer } from './components/ProcessDrawer';

import { OverviewDashboard } from './pages/OverviewDashboard';
import { LiveProcessMonitor } from './pages/LiveProcessMonitor';
import { RecoveryCenter } from './pages/RecoveryCenter';
import { DecisionExplainability } from './pages/DecisionExplainability';
import { ExperimentsBenchmarks } from './pages/ExperimentsBenchmarks';
import { EventTimeline } from './pages/EventTimeline';
import { AlgorithmLaboratory } from './pages/AlgorithmLaboratory';
import { SettingsAbout } from './pages/SettingsAbout';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const { selectedProcess, setSelectedProcess } = useSimulation();

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'processes':
        return <LiveProcessMonitor />;
      case 'recovery':
        return <RecoveryCenter />;
      case 'explainability':
        return <DecisionExplainability />;
      case 'experiments':
        return <ExperimentsBenchmarks />;
      case 'timeline':
        return <EventTimeline />;
      case 'laboratory':
        return <AlgorithmLaboratory />;
      case 'settings':
        return <SettingsAbout />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {/* Global Process Inspection Drawer */}
      <ProcessDrawer
        process={selectedProcess}
        onClose={() => setSelectedProcess(null)}
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
