import React from "react";
import { X, Sliders, Cpu, Info } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    models,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
  } = useChat();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="glass-panel w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col gap-6 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2">
                <Sliders className="text-indigo-500" size={18} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  AI Model Configurations
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5">
              {/* Model Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Cpu size={12} /> Default AI Model
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer appearance-none text-sm transition-all duration-200"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider === "openai" ? "OpenAI" : "Gemini"})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    \u25be
                  </div>
                </div>
                
                {/* Model description */}
                {models.map((m) => m.id === selectedModel && (
                  <p key={m.id} className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {m.tagline}
                  </p>
                ))}
              </div>

              {/* Temperature Selector */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Creativity Temperature
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer py-2 bg-transparent"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                  <span>Precise / Factual (0.0)</span>
                  <span>Creative / Flowing (1.0)</span>
                </div>
              </div>

              {/* API Info Notice */}
              <div className="flex gap-2.5 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/30 dark:border-indigo-500/10 text-left">
                <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Provider Configuration
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    AI Nexus Chat supports seamless API keys for OpenAI and Google Gemini. If API keys are omitted in `.env`, the app operates in Demo mode.
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
