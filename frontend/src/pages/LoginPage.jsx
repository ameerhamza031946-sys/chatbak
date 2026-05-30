import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Bot, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  // Session expired query param notice
  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      setError("Your session has expired. Please sign in again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Confetti burst for premium user experience
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });
      navigate("/chat");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative font-sans selection:bg-indigo-500/30">
      
      {/* Background radial glow */}
      <div className="absolute w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative z-10 text-left border border-slate-800"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link to="/" className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Bot size={24} />
          </Link>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-extrabold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to resume your chat history</p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-4.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <span className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">Forgot?</span>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/70 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all duration-200"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Navigation bottom */}
        <div className="text-xs text-center text-slate-400 border-t border-slate-800/60 pt-4">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
