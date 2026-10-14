import React, { useEffect, useRef, useState } from 'react';
import {
  deleteConversation,
  getChatHealth,
  loadConversations,
  renameConversation,
  sendStudentQuery
} from '../../accountApi';

const MAX_CONTEXT_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 8_000;

function createDraft() {
  return {
    id: `draft-${crypto.randomUUID()}`,
    persistedId: null,
    title: 'New chat',
    updatedAt: Date.now(),
    messages: []
  };
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
    <div className="space-y-3 border-t-2 border-slate-900 bg-white p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSend();
          }}
          placeholder="What would you like help learning?"
          disabled={isLoading}
          className="min-w-0 flex-grow rounded-lg border-2 border-slate-900 bg-amber-50 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          className="rounded-lg border-2 border-slate-900 bg-red-600 px-6 py-3 font-black text-white shadow-[2px_2px_0px_#0f172a] hover:bg-red-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <p className="text-xs font-bold text-slate-600">
        Your chat is saved to your account. Messages are sent to the selected AI model to make a reply; please do not share private information.
      </p>
    </div>
  );
}

const TutoringSession = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [serviceStatus, setServiceStatus] = useState('ready');
  const [providerName, setProviderName] = useState('Gemini');
  const [editingChatId, setEditingChatId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const messagesContainerRef = useRef(null);
  const renameGuardRef = useRef(false);
  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    let isCurrent = true;
    loadConversations()
      .then((history) => {
        if (!isCurrent) return;
        const savedChats = history.chats || [];
        // Chats loaded from the server are persisted by definition. Without
        // this stamp, sending after a refresh omits the conversation id and
        // the server starts a brand-new chat for every message.
        const availableChats = savedChats.length
          ? savedChats.map((chat) => ({ ...chat, persistedId: chat.id }))
          : [createDraft()];
        setChats(availableChats);
        setActiveChatId(availableChats[0].id);
      })
      .catch((error) => {
        if (!isCurrent) return;
        const draft = createDraft();
        setChats([draft]);
        setActiveChatId(draft.id);
        setServiceStatus('unavailable');
        setChatError({ message: error instanceof Error ? error.message : 'Could not load chat history.' });
      }).finally(() => {
        if (isCurrent) setIsLoadingHistory(false);
      });
    getChatHealth()
      .then((health) => {
        if (!isCurrent) return;
        setProviderName(health.provider === 'gemini' ? 'Gemini' : 'Local model');
        setServiceStatus(health.configured ? 'ready' : 'unconfigured');
      })
      .catch(() => {
        if (isCurrent) setServiceStatus('unavailable');
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [activeChat?.id, activeChat?.messages.length, chatError, isLoading]);

  const createNewChat = () => {
    if (isLoading) return;
    const chat = createDraft();
    setChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
    setChatError(null);
    setEditingChatId(null);
  };

  const startRename = (chat) => {
    if (isLoading || isRenaming) return;
    renameGuardRef.current = false;
    setDraftTitle(chat.title);
    setEditingChatId(chat.id);
    setChatError(null);
  };

  const cancelRename = () => {
    renameGuardRef.current = true;
    setEditingChatId(null);
  };

  const commitRename = async (chat) => {
    if (renameGuardRef.current) return;
    renameGuardRef.current = true;
    const nextTitle = draftTitle.trim();
    if (!nextTitle || nextTitle === chat.title) {
      setEditingChatId(null);
      return;
    }
    // Drafts were never saved, so they rename locally only.
    if (!chat.persistedId && chat.id.startsWith('draft-')) {
      setChats((current) => current.map((entry) =>
        entry.id === chat.id ? { ...entry, title: nextTitle } : entry));
      setEditingChatId(null);
      return;
    }
    setIsRenaming(true);
    try {
      const updated = await renameConversation(chat.persistedId || chat.id, nextTitle);
      setChats((current) => current.map((entry) =>
        entry.id === chat.id ? { ...entry, title: updated.title } : entry));
      setEditingChatId(null);
    } catch (error) {
      setChatError({
        message: error instanceof Error ? error.message : 'Could not rename that chat.'
      });
      renameGuardRef.current = false;
    } finally {
      setIsRenaming(false);
    }
  };

  const removeChat = async (chat) => {
    if (isLoading) return;
    try {
      if (chat.persistedId || !chat.id.startsWith('draft-')) {
        await deleteConversation(chat.persistedId || chat.id);
      }
      const remaining = chats.filter((entry) => entry.id !== chat.id);
      if (remaining.length) {
        setChats(remaining);
        if (activeChatId === chat.id) setActiveChatId(remaining[0].id);
      } else {
        const draft = createDraft();
        setChats([draft]);
        setActiveChatId(draft.id);
      }
      setChatError(null);
      setEditingChatId(null);
    } catch (error) {
      setChatError({
        message: error instanceof Error ? error.message : 'Could not delete that conversation.'
      });
    }
  };

  const handleSendQuery = async (query) => {
    if (!activeChat || isLoading) return;
    const localChatId = activeChat.id;
    const nextMessages = [...activeChat.messages, { role: 'user', content: query }];
    setIsLoading(true);
    setServiceStatus('connecting');
    setChatError(null);
    setChats((current) => current.map((chat) => chat.id === localChatId
      ? {
          ...chat,
          title: chat.title === 'New chat' ? query.slice(0, 48) : chat.title,
          updatedAt: Date.now(),
          messages: nextMessages
        }
      : chat));

    try {
      const contextMessages = nextMessages.slice(-MAX_CONTEXT_MESSAGES);
      if (contextMessages[0]?.role === 'assistant') contextMessages.shift();
      // Only true drafts (never sent) create a conversation; anything with a
      // real id must keep appending to it.
      const conversationId = activeChat.persistedId
        || (activeChat.id.startsWith('draft-') ? null : activeChat.id);
      const result = await sendStudentQuery(conversationId, contextMessages);
      setServiceStatus('connected');
      setChats((current) => current.map((chat) => chat.id === localChatId
        ? {
            ...chat,
            id: result.conversationId,
            persistedId: result.conversationId,
            updatedAt: Date.now(),
            messages: [...nextMessages, {
              role: 'assistant',
              content: result.text,
              citations: result.citations
            }]
          }
        : chat).sort((first, second) => second.updatedAt - first.updatedAt));
      setActiveChatId((current) => current === localChatId ? result.conversationId : current);
    } catch (error) {
      setServiceStatus('unavailable');
      setChatError({
        chatId: localChatId,
        message: error instanceof Error ? error.message : 'The tutor could not reply.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-180px)] grid-cols-1 gap-5 lg:grid-cols-4">
      <aside className="flex flex-col gap-3 rounded-xl border-2 border-slate-900 bg-amber-100 p-4 shadow-[3px_3px_0px_#0f172a] lg:col-span-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-slate-900">Your chats</h3>
          <button
            type="button"
            onClick={createNewChat}
            disabled={isLoading}
            className="rounded-lg border-2 border-slate-900 bg-white px-3 py-2 text-sm font-black text-slate-900 hover:bg-amber-200 disabled:opacity-50"
          >
            New chat
          </button>
        </div>
        <p className="text-xs font-semibold text-slate-700">Saved to your account on this app.</p>
        {isLoadingHistory && <p className="text-sm font-bold text-slate-700">Loading your chats…</p>}
        <ul className="flex max-h-56 min-h-0 flex-col gap-2 overflow-y-auto overscroll-y-contain lg:max-h-none lg:flex-1">
          {chats.map((chat) => (
            <li key={chat.id} className="flex items-center gap-1">
              {editingChatId === chat.id ? (
                <input
                  autoFocus
                  value={draftTitle}
                  maxLength={100}
                  disabled={isRenaming}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitRename(chat);
                    else if (event.key === 'Escape') cancelRename();
                  }}
                  onBlur={() => commitRename(chat)}
                  aria-label="Chat title"
                  className="min-w-0 flex-1 rounded-lg border-2 border-slate-900 bg-white px-3 py-2 text-left text-sm font-bold"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (chat.id === activeChatId) startRename(chat);
                    else {
                      setChatError(null);
                      setActiveChatId(chat.id);
                    }
                  }}
                  disabled={isLoading}
                  title={chat.id === activeChatId ? 'Click to rename' : undefined}
                  aria-current={chat.id === activeChatId ? 'page' : undefined}
                  className={`min-w-0 flex-1 truncate rounded-lg border-2 border-slate-900 px-3 py-2 text-left text-sm font-bold ${
                    chat.id === activeChatId ? 'bg-red-200' : 'bg-white'
                  }`}
                >
                  {chat.title}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeChat(chat)}
                disabled={isLoading || editingChatId === chat.id}
                aria-label={`Delete chat ${chat.title}`}
                className="rounded-md border-2 border-transparent px-2 py-1 font-black text-slate-700 hover:border-slate-900 hover:bg-red-100 disabled:opacity-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex h-[calc(100vh-220px)] min-h-[540px] flex-col overflow-hidden rounded-xl border-2 border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a] lg:col-span-3">
        <div className="flex items-center justify-between gap-3 border-b-2 border-slate-900 bg-red-600 px-5 py-4 text-white">
          <h3 className="text-base font-black tracking-wide">💬 {activeChat?.title || 'Tutoring chat'}</h3>
          <span className="rounded-full border border-white/70 bg-white/15 px-3 py-1 text-xs font-bold" aria-live="polite">
            {serviceStatus === 'connecting'
              ? 'Thinking…'
              : serviceStatus === 'connected'
                ? 'Connected'
                : serviceStatus === 'unconfigured'
                  ? 'Tutor needs setup'
                  : serviceStatus === 'unavailable'
                    ? 'Service unavailable'
                    : `${providerName} ready`}
          </span>
        </div>

        <div ref={messagesContainerRef} className="min-h-0 flex-grow space-y-4 overflow-y-auto overscroll-y-contain bg-sky-50/50 p-5" aria-live="polite">
          {messages.length === 0 ? (
            <p className="rounded-xl border-2 border-slate-900 bg-white p-5 text-sm text-slate-700 shadow-[2px_2px_0px_#0f172a]">
              Hi! Ask me about something you are learning, or ask for another example. We can work it out together.
            </p>
          ) : messages.map((message, index) => (
            <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] space-y-2 rounded-xl border-2 border-slate-900 p-4 ${
                message.role === 'user'
                  ? 'bg-red-600 font-bold text-white'
                  : 'bg-white font-medium text-slate-800 shadow-[2px_2px_0px_#0f172a]'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.role === 'assistant' && message.citations?.length > 0 && (
                  <details className="border-t border-slate-200 pt-2 text-xs">
                    <summary className="cursor-pointer font-bold text-blue-700 hover:underline">
                      📚 Sources ({message.citations.length}) — see what this answer was grounded in
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1">
                      {message.citations.map((citation, citationIndex) => (
                        <li key={`${citation.title}-${citationIndex}`}>
                          {citation.url ? (
                            <a href={citation.url} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline">
                              [{citationIndex + 1}] {citation.title}
                            </a>
                          ) : (
                            <span className="font-bold text-blue-700">
                              [{citationIndex + 1}] {citation.title}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          ))}

          {chatError && (!chatError.chatId || chatError.chatId === activeChat?.id) && (
            <p role="alert" className="rounded-xl border-2 border-red-800 bg-red-100 p-4 text-sm font-bold text-red-900">
              {chatError.message}
            </p>
          )}
          {isLoading && (
            <div className="flex justify-start">
              <p className="animate-pulse rounded-xl border-2 border-slate-900 bg-white p-4 text-sm font-bold text-slate-600">
                Thinking it through…
              </p>
            </div>
          )}
        </div>
        <QueryInput onSend={handleSendQuery} isLoading={isLoading} />
      </section>
    </div>
  );
};

export default TutoringSession;
