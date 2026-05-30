import React, { useState } from "react";
import { Menu, Settings, Cpu, Bot, MessageSquare } from "lucide-react";
import { useChat } from "../context/ChatContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import SettingsModal from "../components/SettingsModal";

const ChatPage = () => {
  const { activeConvoId, conversations, selectedModel, models } = useChat();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Retrieve active conversation details
  const activeConvo = conversations.find((c) => c.id === activeConvoId);
  const activeModelDetails = models.find((m) => m.id === selectedModel);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      
      {/* Sidebar - responsive controls embedded */}
      <Sidebar
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Workspace Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 select-none shrink-0 z-30">
          
          {/* Left section: mobile toggle + convo title */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 overflow-hidden text-left">
              <MessageSquare size={16} className="text-indigo-500 hidden sm:block shrink-0" />
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[160px] sm:max-w-[280px]">
                {activeConvo ? activeConvo.title : "New Chat Session"}
              </h1>
            </div>
          </div>

          {/* Right section: model info pill + settings triggers */}
          <div className="flex items-center gap-3">
            {/* Active Model Indicator */}
            {activeModelDetails && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50">
                <Cpu size={12} className="text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {activeModelDetails.name}
                </span>
              </div>
            )}

            {/* Quick settings gear */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all duration-200"
              title="AI Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Chat Window Body */}
        <ChatWindow />

        {/* Input prompt footer bar */}
        <ChatInput />
      </div>

      {/* Settings Modal (Controlled) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Backdrop shadow for sliding mobile sidebars */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}
    </div>
  );
};

export default ChatPage;
