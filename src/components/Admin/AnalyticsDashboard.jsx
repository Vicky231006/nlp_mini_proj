// src/components/Admin/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { mockApiService } from '../../mockApi';

function StatCard({ title, value, unit, bgColor }) {
  return (
    <div className={`p-5 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] ${bgColor}`}>
      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{title}</h5>
      <p className="text-3xl font-black text-slate-900">
        {value}<span className="text-base text-slate-700 ml-1">{unit}</span>
      </p>
    </div>
  );
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    mockApiService.getLearningAnalytics().then(setData);
  }, []);

  if (!data) return <p className="text-center font-bold text-slate-500">Loading analytics...</p>;

  return (
    <div className="space-y-8">
      <div className="border-b-4 border-slate-900 pb-4">
        <h2 className="text-2xl font-black text-slate-800">Response & Learning Insights</h2>
        <p className="text-sm font-bold text-slate-600">
          Tracking mastery flow, concept growth, and trainer state updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Interactions" value={142} unit="this week" bgColor="bg-blue-200" />
        <StatCard title="Concept Mastery Flow" value={78} unit="%" bgColor="bg-emerald-200" />
        <StatCard title="Avg Skill Level" value={"+0.6"} unit="/5.0" bgColor="bg-amber-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <h4 className="text-lg font-black text-slate-800 border-b-2 border-slate-900 pb-2">
            Concept Growth & Mastery Gaps
          </h4>
          <div className="space-y-3 font-bold text-sm">
            <div className="flex justify-between items-center bg-red-100 p-3 rounded-xl border-2 border-slate-900">
              <span className="text-slate-800">Cellular Respiration (Ch5)</span>
              <span className="px-2 py-0.5 bg-red-500 text-white rounded-md text-xs font-black">
                CRITICAL GAP (18%)
              </span>
            </div>
            <div className="flex justify-between items-center bg-amber-100 p-3 rounded-xl border-2 border-slate-900">
              <span className="text-slate-800">Newtonian Mechanics (Ch12)</span>
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-xs font-black">
                MODERATE GAP (34%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <h4 className="text-lg font-black text-slate-800 border-b-2 border-slate-900 pb-2">
            Recent State Updates
          </h4>
          <p className="text-xs font-bold text-slate-500">Traces state for individual Trainers</p>
          <div className="space-y-3 font-mono text-xs bg-slate-100 p-3 rounded-xl border-2 border-slate-900">
            <div className="text-slate-800 bg-white p-2 rounded border border-slate-400">
              💡 <strong>Trainer #1045:</strong> Concept 'Mitosis' Mastered. Updating future curriculum path.
            </div>
            <div className="text-slate-800 bg-white p-2 rounded border border-slate-400">
              ⚙️ <strong>Trainer #1089:</strong> Difficulty adapted (Reasoning Skill: Spatial Transformation).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;