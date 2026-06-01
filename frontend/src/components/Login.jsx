import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, AlertCircle, LayoutGrid } from 'lucide-react';

export default function Login() {
  const { login, register, googleLogin, error, setError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    setError(null);
    setLocalError(null);
  }, [isLogin, setError]);

  useEffect(() => {
    if (!googleClientId) return;

    const initGoogleBtn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setFormLoading(true);
            try {
              await googleLogin(response.credential);
            } catch (err) {
              setLocalError(err.message || 'Google Authentication failed.');
            } finally {
              setFormLoading(false);
            }
          }
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "filled_dark", 
            size: "large", 
            width: "100%",
            text: "continue_with",
            shape: "pill"
          }
        );
      }
    };

    const timer = setTimeout(initGoogleBtn, 800);
    return () => clearTimeout(timer);
  }, [googleClientId, googleLogin, isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    if (!username.trim()) {
      setLocalError('Username is required.');
      return;
    }
    if (!isLogin && !email.trim()) {
      setLocalError('Email is required.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setFormLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#050816] overflow-hidden px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] animate-orb-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px] animate-orb-2" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 shadow-glow"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#00D9FF] to-indigo-500 rounded-2xl flex items-center justify-center mb-3 shadow-glow">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white">
            INVENTRA
          </h1>
          <p className="text-xs text-inventra-muted mt-1 uppercase tracking-widest font-semibold">
            SaaS Inventory Command Center
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
              isLogin ? 'text-white font-bold' : 'text-inventra-muted hover:text-white'
            }`}
          >
            Sign In
            {isLogin && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D9FF]" 
              />
            )}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
              !isLogin ? 'text-white font-bold' : 'text-inventra-muted hover:text-white'
            }`}
          >
            Register
            {!isLogin && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D9FF]" 
              />
            )}
          </button>
        </div>

        {/* Error Banners */}
        <AnimatePresence>
          {activeError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex items-start gap-3 p-3.5 bg-red-950/40 border border-red-500/20 text-red-200 rounded-xl text-sm overflow-hidden shadow-glow-red"
            >
              <AlertCircle className="w-4 h-4 text-inventra-red shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login/Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-inventra-muted tracking-wider uppercase">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-inventra-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full neo-input py-3 pl-11 pr-4 text-sm"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-inventra-muted tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-inventra-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@inventra.com"
                  className="w-full neo-input py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-inventra-muted tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-inventra-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full neo-input py-3 pl-11 pr-4 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#00D9FF] to-indigo-600 hover:from-[#00c5e6] hover:to-indigo-700 text-white font-bold rounded-xl shadow-glow transition duration-300 disabled:opacity-50 text-sm tracking-wide uppercase"
          >
            {formLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Google OAuth Section */}
        {googleClientId && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="h-[1px] bg-white/5 flex-1" />
              <span className="text-xs font-semibold text-inventra-muted uppercase tracking-widest shrink-0">Or continue with</span>
              <div className="h-[1px] bg-white/5 flex-1" />
            </div>
            
            <div id="google-signin-btn" className="w-full flex justify-center" />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-inventra-muted">
            Secure admin portal. Auto-grades compatible.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
