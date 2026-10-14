import React, { useEffect, useState } from 'react';
import {
  loadAccountSession,
  loadSavedAssessment,
  signIn,
  signOut,
  signUp
} from './accountApi';
import ReasoningPractice from './components/Student/ReasoningPractice';
import TutoringSession from './components/Student/TutoringSession';

function AccountForm({ onAuthenticated }) {
  const [mode, setMode] = useState('signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classStandard, setClassStandard] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const session = mode === 'signup'
        ? await signUp({
          displayName,
          email,
          password,
          classStandard: Number.parseInt(classStandard, 10)
        })
        : await signIn({ email, password });
      await onAuthenticated(session);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Could not sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <section className="mx-auto max-w-lg rounded-xl border-4 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_#0f172a] sm:p-8">
      <div className="mb-6 text-center">
        <p className="text-4xl" aria-hidden="true">🧩</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {mode === 'signup' ? 'Let’s get your puzzle profile ready!' : 'Welcome back!'}
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          {mode === 'signup'
            ? 'Make an account, then try a few puzzles so your tutor can choose helpful explanations.'
            : 'Sign in to pick up where you left off.'}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border-2 border-slate-900 bg-amber-100 p-1">
        <button
          type="button"
          onClick={() => changeMode('signup')}
          aria-pressed={mode === 'signup'}
          className={`rounded-md px-3 py-2 text-sm font-black ${mode === 'signup' ? 'bg-red-600 text-white' : 'text-slate-800'}`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => changeMode('login')}
          aria-pressed={mode === 'login'}
          className={`rounded-md px-3 py-2 text-sm font-black ${mode === 'login' ? 'bg-red-600 text-white' : 'text-slate-800'}`}
        >
          Sign in
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <label className="block text-sm font-bold text-slate-800">
            What should we call you?
            <input
              required
              autoComplete="nickname"
              maxLength={50}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-slate-900 bg-amber-50 p-3 font-medium"
              placeholder="A nickname is fine"
            />
          </label>
        )}
        {mode === 'signup' && (
          <label className="block text-sm font-bold text-slate-800">
            Which class are you in?
            <select
              required
              value={classStandard}
              onChange={(event) => setClassStandard(event.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-slate-900 bg-amber-50 p-3 font-medium"
            >
              <option value="" disabled>Select your class</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((standard) => (
                <option key={standard} value={standard}>Class {standard}</option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm font-bold text-slate-800">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-slate-900 bg-amber-50 p-3 font-medium"
          />
        </label>
        <label className="block text-sm font-bold text-slate-800">
          Password
          <input
            required
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={mode === 'signup' ? 10 : undefined}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border-2 border-slate-900 bg-amber-50 p-3 font-medium"
          />
          {mode === 'signup' && (
            <span className="mt-1 block text-xs font-medium">Use at least 10 characters.</span>
          )}
        </label>
        {error && (
          <p role="alert" className="rounded-lg border-2 border-red-800 bg-red-100 p-3 text-sm font-bold text-red-900">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg border-2 border-slate-900 bg-red-600 px-5 py-3 font-black text-white shadow-[3px_3px_0px_#0f172a] hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-slate-600">
        Your account stores your nickname, email, class, puzzle results, and chat history on this app’s server. Chat messages are sent to the selected AI provider when you ask for help.
      </p>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState('tutor');
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  const loadUserData = async (session) => {
    if (!session.user) {
      setUser(null);
      setAssessment(null);
      setStatus('guest');
      return;
    }
    setUser(session.user);
    setError('');
    setStatus('loading-account');
    try {
      const saved = await loadSavedAssessment();
      setAssessment(saved);
      setActiveTab(saved ? 'tutor' : 'practice');
      setStatus(saved ? 'ready' : 'assessment');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your learning profile.');
      setStatus('account-error');
    }
  };

  useEffect(() => {
    let isCurrent = true;
    loadAccountSession()
      .then((session) => {
        if (isCurrent) return loadUserData(session);
        return undefined;
      })
      .catch((loadError) => {
        if (!isCurrent) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not check your account.');
        setStatus('account-error');
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setAssessment(null);
      setStatus('guest');
      setActiveTab('practice');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
    }
  };

  const isAssessmentComplete = Boolean(assessment?.profile);

  return (
    <div className="min-h-screen bg-[#f6edda] px-3 py-4 text-slate-900 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 rounded-xl border-4 border-slate-900 bg-red-600 p-4 text-white shadow-[5px_5px_0px_#0f172a] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-slate-900 bg-amber-300 text-3xl" aria-hidden="true">
              🧩
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Puzzle Lab</h1>
              <p className="text-sm font-bold text-red-50">Play, learn, and ask your tutor</p>
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold">
                Hi, {user.displayName}!{Number.isInteger(user.classStandard) ? ` (Class ${user.classStandard})` : ''}
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border-2 border-slate-900 bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:bg-amber-100"
              >
                Sign out
              </button>
            </div>
          )}
        </header>

        <main className="min-h-[65vh] rounded-xl border-4 border-slate-900 bg-[#fffaf0] p-4 shadow-[5px_5px_0px_#0f172a] sm:p-7">
          {status === 'checking' || status === 'loading-account' ? (
            <p className="py-16 text-center text-lg font-black" role="status">Getting your puzzle space ready…</p>
          ) : status === 'guest' ? (
            <AccountForm onAuthenticated={loadUserData} />
          ) : status === 'account-error' ? (
            <section className="mx-auto max-w-lg rounded-xl border-2 border-red-800 bg-red-100 p-5 text-center">
              <p role="alert" className="font-bold text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => loadAccountSession().then(loadUserData).catch((retryError) =>
                  setError(retryError instanceof Error ? retryError.message : 'Could not reload your account.'))}
                className="mt-4 rounded-lg border-2 border-slate-900 bg-white px-4 py-2 font-black"
              >
                Try again
              </button>
            </section>
          ) : !isAssessmentComplete || status === 'assessment' ? (
            <ReasoningPractice
              key={user.id}
              onComplete={(profile) => {
                setAssessment({ profile });
              }}
              onOpenTutor={() => {
                setActiveTab('tutor');
                setStatus('ready');
              }}
            />
          ) : (
            <>
              <nav aria-label="Main navigation" className="mb-5 flex flex-wrap gap-2">
                {[
                  { id: 'practice', label: '🧩 Puzzle check-in' },
                  { id: 'tutor', label: '💬 Chat with a tutor' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    className={`rounded-lg border-2 border-slate-900 px-4 py-2.5 text-sm font-black shadow-[2px_2px_0px_#0f172a] ${
                      activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-amber-100 text-slate-900 hover:bg-amber-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              {activeTab === 'practice'
                ? <ReasoningPractice
                    key={`practice-${assessment.completedAt || 'new'}`}
                    onComplete={(profile) => setAssessment((current) => ({ ...current, profile }))}
                    onOpenTutor={() => setActiveTab('tutor')}
                  />
                : <TutoringSession
                    key={user.id}
                    learnerClass={user.classStandard ?? null}
                    onLearnerClassChange={(classStandard) => setUser((current) =>
                      current ? { ...current, classStandard } : current)}
                  />}
            </>
          )}
        </main>

        <footer className="mx-auto mt-5 max-w-3xl text-center text-xs font-medium leading-relaxed text-slate-700">
          Puzzle results are simple practice counts, not grades or a measure of intelligence. They are used only to help the tutor choose explanations. Your account history is stored on this app’s server; chat messages are sent to the configured AI provider when you chat.
        </footer>
      </div>
    </div>
  );
}

export default App;
