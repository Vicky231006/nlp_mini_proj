import React, { useState } from 'react';
import ReasoningPractice from './components/Student/ReasoningPractice';
import TutoringSession from './components/Student/TutoringSession';

const tabs = [
  { id: 'practice', label: '🧩 Puzzle practice' },
  { id: 'tutor', label: '💬 Chat with a tutor' }
];

function App() {
  const [activeTab, setActiveTab] = useState('practice');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-violet-100 px-3 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-5 rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-indigo-100 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-3xl" aria-hidden="true">
              🧩
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-indigo-950 sm:text-3xl">
                Bright Steps
              </h1>
              <p className="text-sm font-medium text-slate-600">Puzzles, practice, and a helpful tutor</p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${
                  activeTab === tab.id
                    ? 'bg-indigo-700 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-950 hover:bg-indigo-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="min-h-[65vh] rounded-3xl border border-white/80 bg-white/80 p-4 shadow-lg shadow-indigo-100 sm:p-7">
          {activeTab === 'practice'
            ? <ReasoningPractice onOpenTutor={() => setActiveTab('tutor')} />
            : <TutoringSession />}
        </main>

        <footer className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-slate-600">
          Practice scores are simple counts from today’s puzzles, not a measure of intelligence or a
          decision about what you can learn. Your history and results are saved in this browser;
          messages and your puzzle snapshot are shared with the AI tutor when you chat.
        </footer>
      </div>
    </div>
  );
}

export default App;
