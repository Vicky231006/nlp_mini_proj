import React, { useEffect, useRef, useState } from 'react';
import { getChatHealth, sendStudentQuery } from '../../chatApi';

const CHAT_STORAGE_KEY = 'nc-tutoring-chat-history-v1';
const MAX_SAVED_CHATS = 50;
const MAX_SAVED_MESSAGES = 100;
const MAX_CONTEXT_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 8_000;
const EMPTY_MESSAGES = [];

function isSafeCitation(citation) {
  if (
    typeof citation !== 'object'
    || citation === null
    || typeof citation.title !== 'string'
    || (citation.url !== undefined && typeof citation.url !== 'string')
  ) {
    return false;
  }
  if (!citation.url) return true;

  try {
    return ['http:', 'https:'].includes(new URL(citation.url).protocol);
  } catch {
    return false;
  }
}

function createChat() {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    updatedAt: Date.now(),
    messages: []
  };
}

function loadChatHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || 'null');
    if (
      stored
      && Array.isArray(stored.chats)
      && stored.chats.every((chat) =>
        typeof chat.id === 'string'
        && typeof chat.title === 'string'
        && Number.isFinite(chat.updatedAt)
        && Array.isArray(chat.messages)
        && chat.messages.every((message) =>
          ['user', 'assistant'].includes(message.role)
          && typeof message.content === 'string'
          && (message.citations === undefined
            || (Array.isArray(message.citations) && message.citations.every(isSafeCitation)))))
    ) {
      const chats = stored.chats.slice(0, MAX_SAVED_CHATS);
      if (chats.length) {
        return {
          chats,
          activeChatId: chats.some((chat) => chat.id === stored.activeChatId)
            ? stored.activeChatId
            : chats[0].id,
          storageUnavailable: false
        };
      }
    }
  } catch {
    const chat = createChat();
    return { chats: [chat], activeChatId: chat.id, storageUnavailable: true };
  }

  const chat = createChat();
  return { chats: [chat], activeChatId: chat.id, storageUnavailable: false };
}

function PipelineStatus() {
  const pipelineSteps = [
    'Conversation history',
    'Knowledge retrieval (RAG hook)',
    'Gemini or local model',
    'Grounded answer + sources'
  ];

  return (
    <div className="p-4 bg-slate-900 text-amber-300 border-4 border-slate-900 rounded-2xl font-mono text-xs space-y-2 shadow-[4px_4px_0px_#0f172a]">
      <h6 className="font-black text-white border-b border-amber-400 pb-1 mb-2">Chat pipeline</h6>
      {pipelineSteps.map((step, index) => (
        <div key={step} className="flex items-center space-x-2 text-slate-300">
          <span className="w-4 text-right text-amber-400 font-bold">{index + 1}.</span>
          <span className="truncate">{step}</span>
        </div>
      ))}
    </div>
  );
}

function QueryInput({ onSend, isLoading }) {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    const query = inputText.trim();
    if (query && !isLoading) {
      onSend(query);
      setInputText('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-b-2xl border-t-4 border-slate-900 space-y-3 shadow-inner">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder="Ask a question or follow up on this chat..."
          disabled={isLoading}
          className="flex-grow p-3 bg-slate-50 rounded-xl text-sm font-bold border-2 border-slate-900 focus:ring-2 focus:ring-amber-400 outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] disabled:bg-slate-300 transition-all active:shadow-none"
        >
          Send
        </button>
      </div>
      <p className="text-xs font-bold text-slate-500">
        Chat history is saved in this browser. Do not enter sensitive personal information.
      </p>
    </div>
  );
}

const TutoringSession = () => {
  const [initialChatState] = useState(loadChatHistory);
  const [chatState, setChatState] = useState(initialChatState);
  const [storageUnavailable, setStorageUnavailable] = useState(initialChatState.storageUnavailable);
  const [chatError, setChatError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('ready');
  const [providerName, setProviderName] = useState('Gemini');
  const messagesEndRef = useRef(null);
  const { chats, activeChatId } = chatState;
  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || EMPTY_MESSAGES;

  useEffect(() => {
    let isCurrent = true;
    getChatHealth().then((health) => {
      if (isCurrent) {
        setProviderName(health.provider === 'gemini' ? 'Gemini' : 'Local model');
        setServiceStatus(health.configured ? 'ready' : 'unconfigured');
      }
    }).catch(() => {
      if (isCurrent) setServiceStatus('unavailable');
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const updateStorageStatus = (event) => setStorageUnavailable(event.detail);
    window.addEventListener('chat-storage-status', updateStorageStatus);
    return () => window.removeEventListener('chat-storage-status', updateStorageStatus);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
        chats: chatState.chats.slice(0, MAX_SAVED_CHATS).map((chat) => ({
          ...chat,
          messages: chat.messages.slice(-MAX_SAVED_MESSAGES)
        })),
        activeChatId: chatState.activeChatId
      }));
      window.dispatchEvent(new CustomEvent('chat-storage-status', { detail: false }));
    } catch {
      window.dispatchEvent(new CustomEvent('chat-storage-status', { detail: true }));
    }
  }, [chatState.chats, chatState.activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.id, activeChat?.messages.length, chatError, isLoading]);

  const updateChat = (chatId, update) => {
    setChatState((current) => ({
      ...current,
      chats: current.chats
        .map((chat) => chat.id === chatId ? update(chat) : chat)
        .sort((first, second) => second.updatedAt - first.updatedAt)
    }));
  };

  const createNewChat = () => {
    if (isLoading) return;
    const chat = createChat();
    setChatError(null);
    setChatState((current) => ({
      ...current,
      chats: [chat, ...current.chats].slice(0, MAX_SAVED_CHATS),
      activeChatId: chat.id
    }));
  };

  const deleteChat = (chatId) => {
    if (isLoading) return;
    setChatState((current) => {
      const remaining = current.chats.filter((chat) => chat.id !== chatId);
      if (!remaining.length) {
        const newChat = createChat();
        return { ...current, chats: [newChat], activeChatId: newChat.id };
      }
      return {
        ...current,
        chats: remaining,
        activeChatId: current.activeChatId === chatId ? remaining[0].id : current.activeChatId
      };
    });
    setChatError(null);
  };

  const handleSendQuery = async (query) => {
    if (!activeChat || isLoading) return;
    const chatId = activeChat.id;
    const nextMessages = [...activeChat.messages, { role: 'user', content: query }];
    setIsLoading(true);
    setServiceStatus('connecting');
    setChatError(null);
    updateChat(chatId, (chat) => ({
      ...chat,
      title: chat.title === 'New chat' ? query.slice(0, 48) : chat.title,
      updatedAt: Date.now(),
      messages: nextMessages.slice(-MAX_SAVED_MESSAGES)
    }));

    try {
      const contextMessages = nextMessages.slice(-MAX_CONTEXT_MESSAGES);
      if (contextMessages[0]?.role === 'assistant') contextMessages.shift();
      const result = await sendStudentQuery(contextMessages);
      setServiceStatus('connected');
      updateChat(chatId, (chat) => ({
        ...chat,
        updatedAt: Date.now(),
        messages: [...chat.messages, {
          role: 'assistant',
          content: result.text,
          citations: result.citations
        }].slice(-MAX_SAVED_MESSAGES)
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setServiceStatus('unavailable');
      setChatError({ chatId, message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-180px)]">
      <aside className="lg:col-span-1 bg-white border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-slate-900">Chat history</h3>
          <button
            type="button"
            onClick={createNewChat}
            disabled={isLoading}
            className="rounded-lg border-2 border-slate-900 bg-amber-300 px-3 py-2 text-sm font-black disabled:opacity-50"
          >
            New chat
          </button>
        </div>
        <p className="text-xs text-slate-600">Saved only in this browser.</p>
        {storageUnavailable && (
          <p role="alert" className="rounded-lg bg-red-100 p-2 text-xs font-bold text-red-900">
            Browser storage is unavailable. Chat history may not be saved.
          </p>
        )}
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {chats.map((chat) => (
            <li key={chat.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setChatError(null);
                  setChatState((current) => ({ ...current, activeChatId: chat.id }));
                }}
                disabled={isLoading}
                aria-current={chat.id === activeChatId ? 'page' : undefined}
                className={`min-w-0 flex-1 truncate rounded-lg border-2 px-3 py-2 text-left text-sm font-bold ${
                  chat.id === activeChatId ? 'border-slate-900 bg-blue-100' : 'border-slate-200 bg-white'
                }`}
              >
                {chat.title}
              </button>
              <button
                type="button"
                onClick={() => deleteChat(chat.id)}
                disabled={isLoading}
                aria-label={`Delete chat ${chat.title}`}
                className="rounded-md px-2 py-1 text-slate-600 hover:bg-red-100 hover:text-red-800 disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="lg:col-span-2 flex min-h-[70vh] flex-col bg-white border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a] overflow-hidden">
        <div className="bg-red-500 text-white px-6 py-3 border-b-4 border-slate-900 flex items-center justify-between gap-3">
          <h3 className="font-black text-base text-amber-200 tracking-wide">💬 {activeChat?.title || 'Tutoring chat'}</h3>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/40" aria-live="polite">
            {serviceStatus === 'connecting'
              ? 'Connecting…'
              : serviceStatus === 'connected'
                ? 'Connected'
                : serviceStatus === 'unconfigured'
                  ? 'Add server API key'
                : serviceStatus === 'unavailable'
                  ? 'Service unavailable'
                  : `${providerName} ready`}
          </span>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-amber-50/50" aria-live="polite">
          {messages.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-sm text-slate-700">
              Ask a question to start this chat. Follow-up questions share this conversation’s context.
            </p>
          ) : messages.map((message, index) => (
            <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[90%] border-2 border-slate-900 space-y-2 shadow-[3px_3px_0px_#0f172a] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none font-bold'
                  : 'bg-white text-slate-800 rounded-bl-none font-medium'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && message.citations?.length > 0 && (
                  <ul className="flex flex-wrap gap-2 border-t border-slate-200 pt-2 text-xs">
                    {message.citations.map((citation, citationIndex) => (
                      <li key={`${citation.title}-${citationIndex}`}>
                        {citation.url ? (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-700 underline"
                          >
                            Source [{citationIndex + 1}]: {citation.title}
                          </a>
                        ) : (
                          <span className="font-bold text-blue-700">
                            Source [{citationIndex + 1}]: {citation.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {chatError?.chatId === activeChat?.id && (
            <p role="alert" className="rounded-xl border-2 border-red-300 bg-red-100 p-4 text-sm font-bold text-red-900">
              Chat request failed: {chatError.message} Your question is saved here; try sending it again.
            </p>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <p className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-pulse text-slate-600 font-bold text-sm">
                Thinking…
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <QueryInput onSend={handleSendQuery} isLoading={isLoading} />
      </section>

      <aside className="lg:col-span-1 flex flex-col space-y-4">
        <PipelineStatus />
        <div className="bg-emerald-100 border-4 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_#0f172a] space-y-2">
          <h4 className="font-black text-slate-900 text-sm">Provider and RAG</h4>
          <p className="text-xs font-bold text-slate-700">
            Choose Gemini or an OpenAI-compatible local model in server settings. Add a retriever in <code>server/retriever.js</code> to supply documents and citations.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default TutoringSession;
