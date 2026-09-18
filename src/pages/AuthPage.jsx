import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthPage = ({ onNavigate }) => {
  const { login, signup, loginDemo } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(formData.email || 'alex.rivera@finedge.io', formData.password || 'password123');
      } else if (tab === 'signup') {
        await signup(formData.name || 'Alex Rivera', formData.email, formData.password);
      } else {
        alert('Password reset instructions sent to your email.');
        setTab('login');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginDemo();
    } catch (err) {
      setError('Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-ai/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary-hover to-accent text-white shadow-glow-md mb-2">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            G13 Intelligence Platform
          </h2>
          <p className="text-xs text-slate-400">
            Secure enterprise workspace for executive meeting accountability
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/8 text-xs font-semibold">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                tab === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@finedge.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-ai hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#080B16] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-2 text-sm shadow-glow-sm"
              loading={loading}
              icon={ArrowRight}
            >
              {tab === 'login' ? 'Sign In to Workspace' : 'Create Account & Continue'}
            </Button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#101526] px-3 text-[11px] text-slate-400 font-mono uppercase tracking-wider absolute">
              Quick Evaluator Access
            </span>
          </div>

          <Button
            type="button"
            variant="ai"
            className="w-full py-3 text-xs"
            onClick={handleDemoSignIn}
            loading={loading}
            icon={Sparkles}
          >
            1-Click Demo Login as Alex Rivera (Engineering Lead)
          </Button>

          <div className="text-center">
            <p className="text-[11px] text-slate-400">
              New accounts automatically proceed to Voice Memory Onboarding to calibrate speaker recognition.
            </p>
          </div>
        </div>

        {/* Back to landing */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
