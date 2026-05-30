import React from "react";
import { Link } from "react-router-dom";
import { Bot, Zap, Shield, Database, Mic, ArrowRight, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/60 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <MessageSquare size={18} />
          </div>
          <span className="text-base font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            AI Nexus Chat
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-20 pb-24 relative z-10 flex flex-col items-center justify-center text-center gap-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Tag badge */}
          <motion.div
            variants={itemVariants}
            className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <Bot size={12} /> Next-Generation AI Engine
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] text-slate-100"
          >
            Unleash the Power of{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Multi-Model AI
            </span>{" "}
            in Real Time
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed"
          >
            Chat with leading OpenAI & Google Gemini models. Stream responses instantly, voice-dictate prompts, save session logs, and customize settings on a premium glassmorphic interface.
          </motion.p>

          {/* CTA triggers */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <Link
              to="/register"
              className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Start Chatting Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-base flex items-center justify-center cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Access Demo Workspace
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid Section */}
        <section className="w-full mt-24">
          <div className="flex flex-col items-center gap-3 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Engineered for Speed, Scaled for Security
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Explore advanced SaaS modules running out-of-the-box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-slate-200">Real-Time Streaming</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast API SSE channels deliver tokens immediately. Enjoy real-time typing indicators, stops, and regenerations.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center">
                <Mic size={20} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-slate-200">Speech-To-Text Input</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Speak naturally into your device using browser Web Speech API. Instantly transcribes voice commands into the input box.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-slate-200">Session Memory</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Save, pin, search, rename, and export conversations. Connected dynamically to MongoDB with robust memory fallback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full mt-16 pb-12 border-t border-slate-800/60 pt-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">
            Loved by Developers and Designers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-3xl bg-slate-800/20 border border-slate-800/60 flex flex-col gap-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
              </div>
              <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                "AI Nexus Chat feels incredibly snappy! The code block syntax rendering with dynamic copying makes it my primary scratchpad for testing scripts."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                  SL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Sarah Lundberg</h4>
                  <span className="text-[10px] text-slate-500">Frontend Engineer</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/20 border border-slate-800/60 flex flex-col gap-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
                <Star size={14} className="fill-current" />
              </div>
              <p className="text-xs md:text-sm text-slate-300 italic leading-relaxed">
                "Having seamless access to both Google Gemini and GPT-4o on a unified interface is a game-changer. The glassmorphic dark mode styling is beautiful."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-purple-400">
                  MR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Marcus Rossi</h4>
                  <span className="text-[10px] text-slate-500">SaaS Consultant</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 py-10 mt-auto border-t border-slate-850">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>&copy; 2026 AI Nexus Chat. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">API Keys Guide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
