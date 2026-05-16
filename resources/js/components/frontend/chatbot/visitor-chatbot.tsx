import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};

const quickQuestions = [
  'Quelles trainings sont disponibles ?',
  'Comment participer a un evenement ?',
  'Comment vous contacter ?',
];

type ChatbotConfig = {
  enabled: boolean;
  title: string;
  welcome_message: string;
  quick_questions: string[];
  lead_capture_enabled: boolean;
  lead_prompt: string;
};

const VisitorChatbot = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "Bonjour. Je suis l'assistant Redeemer. Je peux vous aider 24h/24 sur les trainings, evenements, services et contacts.",
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);
  const configuredQuickQuestions = config?.quick_questions?.length
    ? config.quick_questions
    : quickQuestions;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/chatbot/config', {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        setConfig(data);
        if (typeof data?.welcome_message === 'string' && data.welcome_message.trim() !== '') {
          setMessages([{ id: 'welcome', role: 'bot', text: data.welcome_message }]);
        }
      } catch {
        // Keep local defaults if API config is unavailable.
      }
    };

    loadConfig();
  }, []);

  const ask = async (text: string) => {
    const prompt = text.trim();
    if (!prompt) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await response.json();
      const botText =
        typeof data?.reply === 'string'
          ? data.reply
          : "Je n'ai pas pu traiter votre demande pour le moment.";

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: botText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: 'Une erreur reseau est survenue. Reessayez dans quelques instants.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const saveLead = async () => {
    const email = leadEmail.trim();
    if (!email) return;

    try {
      const response = await fetch('/api/chatbot/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setLeadSaved(true);
        setLeadEmail('');
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            role: 'bot',
            text: 'Merci. Un conseiller vous recontactera rapidement.',
          },
        ]);
      }
    } catch {
      // Silently ignore and keep chat usable.
    }
  };

  if (config && !config.enabled) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[70] w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <p className="font-semibold">{config?.title || 'Assistant Redeemer'}</p>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-3 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {configuredQuickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {Boolean(config?.lead_capture_enabled) && !leadSaved && (
            <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                {config?.lead_prompt || 'Laissez votre email pour etre recontacte rapidement.'}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-9 flex-1 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  onClick={saveLead}
                  className="h-9 rounded-lg bg-slate-900 px-3 text-xs text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSend) {
                ask(input);
              }
            }}
            className="border-t border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ecrivez votre question..."
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white disabled:opacity-50"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((s) => !s)}
        className="fixed bottom-6 right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/30"
        aria-label="Ouvrir le chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
};

export default VisitorChatbot;
