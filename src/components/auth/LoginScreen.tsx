import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return null; // or redirect, but layout will handle this
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const loginDemo = async (roleEmail: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: roleEmail, password: 'password123' });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-mist flex items-center justify-center overflow-y-auto z-[1000] p-4 sm:p-6 transition-all duration-panel">
      <div className="bg-paper border border-line rounded-lg shadow-modal p-6 sm:p-10 w-full max-w-[440px] text-center animate-[modalSlideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)] my-auto">
        
        <div className="mb-8">
          <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="3" y="4" width="18" height="3" rx="1.5" fill="url(#logoGradLarge)"/>
            <rect x="6" y="10" width="12" height="3" rx="1.5" fill="url(#logoGradLarge)"/>
            <rect x="9" y="16" width="6" height="3" rx="1.5" fill="url(#logoGradLarge)"/>
          </svg>
          <h2 className="font-bold text-2xl text-ink tracking-tight mb-2">Welcome to Pipeline</h2>
          <p className="text-slate text-[13.5px] leading-relaxed">Select a profile to log in and manage your CRM pipeline</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-danger-subtle text-status-danger text-sm rounded-md font-semibold">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => loginDemo('admin@pipeline.com')}
            disabled={loading}
            className="flex items-center gap-4 px-5 py-3.5 rounded-md border border-line bg-paper text-ink cursor-pointer text-left transition-all duration-fast hover:border-accent hover:bg-mist hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 bg-accent">A</div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-semibold text-sm text-ink">Administrator</span>
              <span className="text-xs text-slate">admin@pipeline.com</span>
            </div>
          </button>

          <button 
            onClick={() => loginDemo('manager@pipeline.com')}
            disabled={loading}
            className="flex items-center gap-4 px-5 py-3.5 rounded-md border border-line bg-paper text-ink cursor-pointer text-left transition-all duration-fast hover:border-accent hover:bg-mist hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 bg-status-progress">M</div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-semibold text-sm text-ink">Sales Manager</span>
              <span className="text-xs text-slate">manager@pipeline.com</span>
            </div>
          </button>

          <button 
            onClick={() => loginDemo('exec@pipeline.com')}
            disabled={loading}
            className="flex items-center gap-4 px-5 py-3.5 rounded-md border border-line bg-paper text-ink cursor-pointer text-left transition-all duration-fast hover:border-accent hover:bg-mist hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 bg-status-new">S</div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-semibold text-sm text-ink">Sales Executive</span>
              <span className="text-xs text-slate">exec@pipeline.com</span>
            </div>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-line text-left">
          <p className="text-xs text-slate font-semibold uppercase tracking-wider mb-3">Or sign in with email</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full border border-line rounded-md px-3 py-2 text-[13px] bg-paper text-ink outline-none transition-colors duration-fast focus:border-accent"
              required
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full border border-line rounded-md px-3 py-2 text-[13px] bg-paper text-ink outline-none transition-colors duration-fast focus:border-accent"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="mt-1 w-full border-none rounded-sm px-[18px] py-[9px] text-[13px] font-semibold cursor-pointer font-sans transition-all duration-fast bg-accent text-white hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
