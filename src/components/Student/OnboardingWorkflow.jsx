// src/components/Student/OnboardingWorkflow.jsx
import React, { useState } from 'react';
import { mockApiService } from '../../mockApi';

const steps = {
  INTRO: 'intro',
  CPM_START: 'cpm_start',
  CPM_QUESTION: 'cpm_question',
  PROFILE_GEN: 'profile_gen',
  COMPLETE: 'complete',
};

function CpmAssessment({ currentQuestionIndex, onAnswerSubmit }) {
  return (
    <div className="pixel-card bg-white p-6 md:p-8 space-y-6">
      <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800">Reasoning Interaction Demo</h3>
        <span className="bg-emerald-400 border-2 border-slate-900 font-bold px-3 py-1 rounded-full text-xs text-slate-900">
          Placeholder item
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-slate-100 h-56 rounded-xl border-4 border-slate-900 flex flex-col items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-2 w-32 h-32 bg-emerald-200 p-2 rounded-lg border-2 border-slate-900 mb-2">
            <div className="bg-red-400 rounded" />
            <div className="bg-blue-400 rounded" />
            <div className="bg-yellow-400 rounded" />
            <div className="bg-slate-300 rounded flex items-center justify-center font-bold border border-slate-900 text-lg">?</div>
          </div>
          <span className="text-xs font-bold text-slate-600">Repeated demo screen {currentQuestionIndex + 1} of 25</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-700">Tap any choice to advance; answers are not recorded:</p>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((choice, idx) => {
              const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-emerald-400'];
              return (
                <button
                  key={choice}
                  onClick={() => onAnswerSubmit(choice)}
                  className={`${colors[idx % 4]} text-white font-black text-xl py-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:translate-y-0.5 active:shadow-none transition-all`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const OnboardingWorkflow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(steps.INTRO);
  const [profileData, setProfileData] = useState(null);
  const [cpmQuestionIndex, setCpmQuestionIndex] = useState(0);

  const startCpm = async () => {
    setCurrentStep(steps.CPM_START);
    await mockApiService.startCpmAssessment();
    setCurrentStep(steps.CPM_QUESTION);
  };

  const submitCpmAnswer = async () => {
    if (cpmQuestionIndex < 24) {
      setCpmQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep(steps.PROFILE_GEN);
      const profile = await mockApiService.submitCpmAnswers();
      setProfileData(profile);
      onComplete(profile);
      setCurrentStep(steps.COMPLETE);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b-4 border-slate-900 pb-2">
        <h2 className="text-2xl font-black text-slate-800">Trainer Station</h2>
        <span className="text-xs font-bold bg-amber-200 border-2 border-slate-900 px-3 py-1 rounded-full">
          Demo Flow
        </span>
      </div>

      {currentStep === steps.INTRO && (
        <div className="text-center p-8 bg-white rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-6">
          <div className="w-16 h-16 bg-red-500 rounded-full border-4 border-slate-900 mx-auto flex items-center justify-center text-2xl text-white font-bold">
            🎒
          </div>
          <p className="text-base font-bold text-slate-700">
            Explore a sample onboarding flow. This repeated placeholder puzzle is not scored, and the profile shown at the end is example data.
          </p>
          <button
            onClick={startCpm}
            className="px-8 py-3 bg-red-500 text-white text-lg font-black rounded-full border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] hover:bg-red-600 transition-all"
          >
            Start Quest
          </button>
        </div>
      )}

      {currentStep === steps.CPM_QUESTION && (
        <CpmAssessment currentQuestionIndex={cpmQuestionIndex} onAnswerSubmit={submitCpmAnswer} />
      )}

      {currentStep === steps.COMPLETE && profileData && (
        <div className="space-y-6">
          <div className="bg-emerald-300 border-4 border-slate-900 p-4 rounded-2xl text-slate-900 text-center font-bold shadow-[3px_3px_0px_#0f172a]">
            🎉 Demo flow complete. An example profile is shown below.
          </div>

          <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] space-y-4">
            <p className="rounded-lg border border-amber-400 bg-amber-100 p-3 text-sm font-bold text-amber-950">
              Example profile only. The answers in this demo are not recorded or used to calculate these values.
            </p>
            <h5 className="font-black text-slate-800 text-lg border-b-2 border-slate-900 pb-2">
              Sample Profile Dimensions
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profileData.cognitiveProfile.reasoningSkill).map(([key, val]) => (
                <div key={key} className="bg-amber-100 p-3 rounded-xl border-2 border-slate-900 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800 uppercase">
                    <span>{key}</span>
                    <span>{val.toFixed(1)} / 5.0</span>
                  </div>
                  {/* Skill Progress Bar */}
                  <div className="w-full bg-slate-200 h-4 rounded-full border-2 border-slate-900 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full border-r-2 border-slate-900"
                      style={{ width: `${(val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingWorkflow;