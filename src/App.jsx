// src/App.jsx
import React, { useState } from 'react';
import ContentIngestion from './components/Admin/ContentIngestion';
import OnboardingWorkflow from './components/Student/OnboardingWorkflow';
import TutoringSession from './components/Student/TutoringSession';
import AnalyticsDashboard from './components/Admin/AnalyticsDashboard';

const tabs = [
  { id: 'ingest', label: '📜 Curriculum Intake', role: 'Admin' },
  { id: 'onboard', label: '🏅 Trainer Onboarding', role: 'Student' },
  { id: 'tutor', label: '⚙️ Tutoring Pipeline', role: 'Student' },
  { id: 'analytics', label: '📊 Analytics Hub', role: 'Admin' },
];

function App() {
  const [activeTab, setActiveTab] = useState('onboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'ingest': return <ContentIngestion />;
      case 'onboard': return <OnboardingWorkflow />;
      case 'tutor': return <TutoringSession />;
      case 'analytics': return <AnalyticsDashboard />;
      default: return <div>Select a station.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 p-2 md:p-6">
      {/* Handheld Device Outer Frame */}
      <div className="max-w-7xl mx-auto pixel-box bg-slate-100 p-4 md:p-6 space-y-6">
        
        {/* Retro Header Bar */}
        <header className="bg-red-500 text-white rounded-2xl p-4 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* Capture Orb Symbol */}
            <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-white flex flex-col justify-between overflow-hidden shadow-sm relative">
              <div className="h-1/2 bg-red-600 border-b-2 border-slate-900" />
              <div className="absolute inset-0 m-auto w-4 h-4 bg-white border-2 border-slate-900 rounded-full z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide text-amber-300 drop-shadow-[2px_2px_0px_#0f172a]">
              Curriculum Quest Tutor
            </h1>
          </div>

          {/* Navigation Badges */}
          <nav className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 border-slate-900 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-300 text-slate-900 shadow-[2px_2px_0px_#0f172a] -translate-y-0.5'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Dynamic View Panel */}
        <main className="bg-amber-50 rounded-2xl border-4 border-slate-900 p-4 md:p-8 min-h-[500px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;