import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Mic, MicOff } from "lucide-react";
import { useChat } from "../context/ChatContext";

const ChatInput = () => {
  const { sendMessage, isStreaming, stopStream } = useChat();
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea heights
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  // Configure Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start voice:", err);
      }
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      stopStream();
      return;
    }

    if (text.trim()) {
      sendMessage(text.trim());
      setText("");
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6 flex flex-col gap-2">
      {/* Active stop stream indicator */}
      {isStreaming && (
        <button
          onClick={stopStream}
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-lg text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-red-500 cursor-pointer flex items-center gap-1.5 transition-all duration-200"
        >
          <Square size={10} className="fill-current" /> Stop generating
        </button>
      )}

      {/* Input Box Container */}
      <div className="glass-panel w-full rounded-3xl p-2 flex items-end gap-2 shadow-lg shadow-slate-100 dark:shadow-none focus-within:ring-2 focus-within:ring-indigo-500/30 border border-slate-200 dark:border-slate-800/80 transition-all duration-200">
        {/* Voice dictation */}
        <button
          onClick={handleToggleVoice}
          className={`p-3 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200 ${
            isListening ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 animate-pulse" : "text-slate-400"
          }`}
          title={isListening ? "Stop Voice Input" : "Start Voice Input"}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text area input */}
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isListening}
          className="flex-1 max-h-48 px-2 py-3 bg-transparent border-0 outline-none resize-none text-slate-800 dark:text-slate-100 text-sm leading-relaxed focus:ring-0 focus:outline-none placeholder-slate-400"
        />

        {/* Submit */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !isStreaming}
          className={`p-3 rounded-2xl cursor-pointer text-white shadow-lg transition-all duration-200 ${
            text.trim() || isStreaming
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
          }`}
        >
          <Send size={16} />
        </button>
      </div>

      <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
        AI Nexus Chat can make mistakes. Please verify important information.
      </span>
    </div>
  );
};

export default ChatInput;
