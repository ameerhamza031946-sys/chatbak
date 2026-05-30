import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, MessageSquare, Bot, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom renderer for code blocks in markdown
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : "";
      
      const [blockCopied, setBlockCopied] = useState(false);
      const codeString = String(children).replace(/\n$/, "");

      const handleBlockCopy = () => {
        navigator.clipboard.writeText(codeString);
        setBlockCopied(true);
        setTimeout(() => setBlockCopied(false), 2000);
      };

      if (!inline && lang) {
        return (
          <div className="relative my-4 rounded-2xl overflow-hidden border border-slate-200/10 dark:border-slate-800/80 shadow-md">
            {/* Code header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-400 text-xs font-mono border-b border-slate-800">
              <span className="uppercase text-[10px] tracking-wider font-semibold">{lang}</span>
              <button
                onClick={handleBlockCopy}
                className="flex items-center gap-1 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {blockCopied ? (
                  <>
                    <Check size={11} className="text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Code content */}
            <pre className="p-4 bg-slate-950 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-300">
              <code>{codeString}</code>
            </pre>
          </div>
        );
      }

      return (
        <code
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-rose-500 dark:text-rose-300 font-mono text-sm leading-none"
          {...props}
        >
          {children}
        </code>
      );
    }
  };

  return (
    <div className={`flex w-full gap-4 py-6 px-4 border-b border-slate-200/30 dark:border-slate-800/30 ${
      isUser ? "bg-transparent" : "bg-slate-50/50 dark:bg-slate-900/15"
    }`}>
      {/* Avatar Container */}
      <div className="flex-shrink-0">
        {isUser ? (
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || "user"}`}
            alt="User"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bot size={18} />
          </div>
        )}
      </div>

      {/* Message Text Content */}
      <div className="flex-1 flex flex-col items-start gap-1 overflow-hidden">
        {/* Name and Metadata header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {isUser ? "You" : "Nexus AI"}
          </span>
          {message.model && !isUser && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 uppercase tracking-wider font-mono">
              {message.model}
            </span>
          )}
          <span className="text-[10px] text-slate-400">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Text Body */}
        <div className="prose text-slate-800 dark:text-slate-100 text-left w-full overflow-hidden break-words selection:bg-indigo-500/20">
          {message.content === "" ? (
            <div className="flex items-center gap-1.5 py-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <ReactMarkdown components={renderers}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {/* Copy prompt button (hover control) */}
      {!isUser && message.content !== "" && (
        <div className="flex-shrink-0 self-start mt-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200"
            title="Copy response"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
