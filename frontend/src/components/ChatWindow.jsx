import React, { useEffect, useRef } from "react";
import { Bot, MessageSquare, Compass, Terminal, PenTool, Sparkles, Cpu, ArrowRight } from "lucide-react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";

const PROMPT_SUGGESTIONS = [
  {
    title: "Explain React 19 Features",
    desc: "Understand what is new in the latest React version",
    icon: <Bot className="text-indigo-500" size={16} />,
    prompt: "Can you explain the main new features in React 19, including Server Actions and document metadata support?"
  },
  {
    title: "Write a Web Scraper",
    desc: "Get a Python scraping script using BeautifulSoup",
    icon: <Terminal className="text-green-500" size={16} />,
    prompt: "Write a clean Python script using requests and BeautifulSoup to scrape the titles of articles from a blog."
  },
  {
    title: "Draft an Onboarding Email",
    desc: "Compose a welcome email for software developers",
    icon: <PenTool className="text-amber-500" size={16} />,
    prompt: "Draft a professional and welcoming onboarding email template for a newly hired senior software engineer."
  },
  {
    title: "Brainstorm SaaS Ideas",
    desc: "Generate micro-SaaS tech ideas using AI",
    icon: <Sparkles className="text-purple-500" size={16} />,
    prompt: "Give me 5 micro-SaaS ideas that solve developer pain points, incorporating AI models or automations."
  }
];

const ChatWindow = () => {
  const {
    messages,
    loadingMessages,
    selectedModel,
    setSelectedModel,
    models,
    sendMessage
  } = useChat();

  const messagesEndRef = useRef(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages load/update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading conversations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto select-text">
      {messages.length === 0 ? (
        /* Empty State dashboard */
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center gap-8">
          
          {/* Welcome Branding */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <Bot size={32} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 justify-center">
                Meet <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Nexus AI</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Choose a model and type your prompt below to start an interactive chat session.
              </p>
            </div>

            {/* Model Configuration Selector */}
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
              <Cpu size={14} className="text-indigo-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none border-0 pr-6 pl-1 cursor-pointer appearance-none"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id} className="dark:bg-slate-900">
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => sendMessage(s.prompt)}
                className="glass-panel p-4 rounded-3xl text-left cursor-pointer border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 group transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 group-hover:bg-indigo-500/10 transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                      {s.title}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-1">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Messages bubbles */
        <div className="flex-1 flex flex-col">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
