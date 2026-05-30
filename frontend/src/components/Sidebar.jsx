import React, { useState } from "react";
import { Plus, Search, Pin, Edit3, Trash2, Download, Settings, MessageSquare, Check, X, Menu } from "lucide-react";
import { useChat } from "../context/ChatContext";
import UserProfile from "./UserProfile";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ onOpenSettings, isMobileOpen, onCloseMobile }) => {
  const {
    conversations,
    activeConvoId,
    setActiveConvoId,
    searchQuery,
    setSearchQuery,
    createNewChat,
    renameConversation,
    pinConversation,
    deleteConversation,
    exportConversation
  } = useChat();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (e, convo) => {
    e.stopPropagation();
    setEditingId(convo.id);
    setEditTitle(convo.title);
  };

  const handleSaveRename = async (e, convoId) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(convoId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSelectChat = (id) => {
    setActiveConvoId(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sidebar-glass border-r border-slate-200/50 dark:border-slate-800/40 flex flex-col h-full transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <MessageSquare size={18} />
          </div>
          <span className="text-base font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            AI Nexus Chat
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-2 flex flex-col gap-3">
        <button
          onClick={() => {
            createNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations Scroll List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 select-none">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <span className="text-xs">No active chats found</span>
          </div>
        ) : (
          conversations.map((convo) => {
            const isActive = activeConvoId === convo.id;
            const isEditing = editingId === convo.id;

            return (
              <div
                key={convo.id}
                onClick={() => !isEditing && handleSelectChat(convo.id)}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-300"
                }`}
              >
                {/* Text content or edit input */}
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                  <MessageSquare size={15} className={`shrink-0 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(e, convo.id);
                        if (e.key === "Escape") handleCancelRename(e);
                      }}
                      className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-indigo-400 focus:outline-none text-sm px-1.5 py-0.5 rounded-lg"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-semibold truncate leading-tight flex-1">
                      {convo.title}
                    </span>
                  )}
                </div>

                {/* Pin indicators/actions */}
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(e, convo.id)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-green-500"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Pin */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pinConversation(convo.id, !convo.pinned);
                        }}
                        className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                          convo.pinned ? "text-indigo-500" : "text-slate-400 hover:text-slate-600"
                        }`}
                        title={convo.pinned ? "Unpin Chat" : "Pin Chat"}
                      >
                        <Pin size={12} className={convo.pinned ? "fill-indigo-500" : ""} />
                      </button>

                      {/* Rename */}
                      <button
                        onClick={(e) => handleStartRename(e, convo)}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Rename"
                      >
                        <Edit3 size={12} />
                      </button>

                      {/* Export */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportConversation(convo.id);
                        }}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Export JSON"
                      >
                        <Download size={12} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this chat session?")) {
                            deleteConversation(convo.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>

                {/* Show static pin icon when not hovering, if pinned */}
                {convo.pinned && !isEditing && (
                  <Pin
                    size={12}
                    className="group-hover:hidden text-indigo-400 dark:text-indigo-500 fill-indigo-400 dark:fill-indigo-500 shrink-0 ml-1.5"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 flex flex-col gap-3">
        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Settings size={15} /> AI Settings
        </button>

        <UserProfile />
      </div>
    </aside>
  );
};

export default Sidebar;
