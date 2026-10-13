// src/components/Admin/ContentIngestion.jsx
import React, { useState } from 'react';
import { demoApiService } from '../../demoApi';

function IngestionLane({ title, icon, onFileSelect }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center space-x-3 text-blue-700">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">Select a file to preview this demo lane. The file stays local and is not processed.</p>
      <input type="file" onChange={(e) => onFileSelect(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
    </div>
  );
}

const ContentIngestion = () => {
  const [demoStatus, setDemoStatus] = useState(null);

  const handleFileSelection = async (file, laneType) => {
    if (!file) return;
    setDemoStatus(`Previewing file selection for ${laneType}: ${file.name}...`);
    try {
      const result = await demoApiService.ingestContent(file, laneType);
      setDemoStatus(result.message);
    } catch (err) {
      setDemoStatus(`Demo failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="border-b pb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Offline Content Ingestion</h2>
        <p className="mt-2 text-lg text-gray-600">Prototype interface only. Files are selected locally; no upload, extraction, or indexing service is connected.</p>
      </div>

      {demoStatus && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm font-medium">
          Status: {demoStatus}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IngestionLane title="Text Lane" icon="📄" onFileSelect={(file) => handleFileSelection(file, 'Text')} />
        <IngestionLane title="Table Lane" icon="📊" onFileSelect={(file) => handleFileSelection(file, 'Table')} />
        <IngestionLane title="Image Lane" icon="🖼️" onFileSelect={(file) => handleFileSelection(file, 'Image')} />
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-center space-x-4">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl">⚙️</div>
        <div>
          <h4 className="font-semibold text-blue-900">Planned Content Processing</h4>
          <p className="text-sm text-blue-700">A future backend could normalize content here before indexing.</p>
        </div>
      </div>
    </div>
  );
};

export default ContentIngestion;