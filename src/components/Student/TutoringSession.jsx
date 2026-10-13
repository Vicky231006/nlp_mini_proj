// src/components/Student/TutoringSession.jsx
import React, { useState, useRef, useEffect } from 'react';
import { mockApiService } from '../../mockApi';

function QueryInput({ onSend, isLoading }) {
  const [inputText, setInputText] = useState('');

  const handleSendText = () => {
    if (inputText.trim()) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-b-2xl border-t-4 border-slate-900 space-y-3 shadow-inner">
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="Enter a question (e.g., 'Explain cell division')..."
          disabled={isLoading}
          className="flex-grow p-3 bg-slate-50 rounded-xl text-sm font-bold border-2 border-slate-900 focus:ring-2 focus:ring-amber-400 outline-none" 
        />
        <button 
          onClick={handleSendText}
          disabled={isLoading || !inputText.trim()}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] disabled:bg-slate-300 transition-all active:shadow-none"
        >
          Send
        </button>
      </div>
      <p className="text-xs font-bold text-slate-500">
        Prototype only. A same-origin server-side tutor API must be configured before questions can be answered.
      </p>
    </div>
  );
}

function PipelineStatus() {
  const pipelineSteps = [
    'Voice transcription',
    'Child Query Cleaning',
    'Hybrid Retrieval (Dense+BM25)',
    'Evidence Reranker',
    'Evidence Verifier (Claim Verification)',
    'Adaptive Tutor (Personalized)',
    'Safety Check',
    'Final Response',
  ];

  return (
    <div className="p-4 bg-slate-900 text-amber-300 border-4 border-slate-900 rounded-2xl font-mono text-xs space-y-2 shadow-[4px_4px_0px_#0f172a]">
      <h6 className="font-black text-white border-b border-amber-400 pb-1 mb-2">Planned pipeline · not connected</h6>
      {pipelineSteps.map((step, index) => (
        <div key={index} className="flex items-center space-x-2 text-slate-300">
          <span className="w-4 text-right text-amber-400 font-bold">{index + 1}.</span>
          <span className="truncate">{step}</span>
          <span className="text-slate-400 ml-auto">planned</span>
        </div>
      ))}
    </div>
  );
}

const TutoringSession = ({ currentLearnerState }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'This is a tutoring interface prototype. It is not connected to a tutor model or curriculum source yet.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('not-connected');
  const messagesEndRef = useRef(null);

  const handleSendQuery = async (query) => {
    setIsLoading(true);
    setServiceStatus('connecting');
    setMessages(prev => [...prev, { sender: 'user', text: query }]);

    try {
      const result = await mockApiService.sendStudentQuery(query, currentLearnerState);
      setServiceStatus('connected');
      
      const botMessage = {
        sender: 'bot',
        text: result.response.text,
        citations: result.response.citations
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setServiceStatus('unavailable');
      setMessages(prev => [...prev, { sender: 'bot', text: `Tutor unavailable: ${message}`, isError: true }]);
    } finally {
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
      {/* Main Retro Chatbox Window */}
      <div className="lg:col-span-3 flex flex-col bg-white border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a] overflow-hidden">
        <div className="bg-red-500 text-white px-6 py-3 border-b-4 border-slate-900 flex items-center justify-between">
          <h3 className="font-black text-base text-amber-200 tracking-wide">💬 Tutoring Dialogue Station</h3>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/40" aria-live="polite">
            {serviceStatus === 'connecting'
              ? 'Connecting…'
              : serviceStatus === 'connected'
                ? 'Tutor service connected'
                : serviceStatus === 'unavailable'
                  ? 'Tutor service unavailable'
                  : 'Prototype · service not connected'}
          </span>
        </div>

        {/* Message History Container */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-amber-50/50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                role={msg.isError ? 'alert' : undefined}
                className={`p-4 rounded-2xl max-w-[80%] border-2 border-slate-900 space-y-2 shadow-[3px_3px_0px_#0f172a] ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none font-bold'
                    : msg.isError
                      ? 'bg-red-100 text-red-900 rounded-bl-none font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none font-medium'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                
                {msg.sender === 'bot' && msg.citations?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Sources: {msg.citations.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-pulse text-slate-600 font-bold text-sm">
                Connecting to the tutor service…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Controls */}
        <QueryInput onSend={handleSendQuery} isLoading={isLoading} />
      </div>

      {/* Side Pipeline Trace Panel */}
      <div className="hidden lg:flex flex-col space-y-4">
        <PipelineStatus />
        <div className="bg-emerald-100 border-4 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_#0f172a] space-y-2">
          <h4 className="font-black text-slate-900 text-sm">🎒 Trainer Status</h4>
          <p className="text-xs font-bold text-slate-700">
            No learner profile, model, or curriculum source is connected in this prototype.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutoringSession;