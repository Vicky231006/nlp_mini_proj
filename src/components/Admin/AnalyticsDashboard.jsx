// src/components/Admin/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { demoApiService } from '../../demoApi';

function StatCard({ title, value, unit, bgColor }) {
  return (
    <div className={`p-5 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] ${bgColor}`}>
      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{title}</h5>
      <p className="text-3xl font-black text-slate-900">
        {value} <span className="text-base text-slate-700">{unit}</span>
      </p>
    </div>
  );
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    demoApiService.getLearningAnalytics().then(setData);
  }, []);

  if (!data) return <p className="text-center font-bold text-slate-500">Loading analytics...</p>;

  return (
    <div className="space-y-8">
      <div className="border-b-4 border-slate-900 pb-4">
        <h2 className="text-2xl font-black text-slate-800">Illustrative Analytics</h2>
        <p className="text-sm font-bold text-slate-600">
          Sample values only. No learner records or analytics service are connected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            unit={stat.unit}
            bgColor={['bg-blue-200', 'bg-emerald-200', 'bg-amber-200'][index % 3]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <h4 className="text-lg font-black text-slate-800 border-b-2 border-slate-900 pb-2">
            Example Concept Snapshots
          </h4>
          <div className="space-y-3 font-bold text-sm">
            {data.concepts.map((concept) => (
              <div key={concept.name} className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border-2 border-slate-900">
                <span className="text-slate-800">{concept.name}</span>
                <span className="px-2 py-0.5 bg-slate-700 text-white rounded-md text-xs font-black">
                  {concept.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
          <h4 className="text-lg font-black text-slate-800 border-b-2 border-slate-900 pb-2">
            Recent State Updates
          </h4>
          <p className="text-xs font-bold text-slate-500">Example events; no trainer data is stored</p>
          <div className="space-y-3 font-mono text-xs bg-slate-100 p-3 rounded-xl border-2 border-slate-900">
            {data.recentUpdates.map((update) => (
              <div key={update} className="text-slate-800 bg-white p-2 rounded border border-slate-400">
                {update}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;