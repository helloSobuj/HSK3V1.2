import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Loader2, User, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const result = await authService.register(username, password);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        const result = await authService.login(username, password);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="inline-flex p-3 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-800 tracking-tight">HanziHero</h1>
          <p className="text-slate-500 mt-2">
            {isRegistering ? 'Create your learning profile' : 'Welcome back to your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            {isRegistering && (
              <div className="relative animate-in fade-in slide-in-from-top-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegistering ? 'Start Learning' : 'Login'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline decoration-2 decoration-transparent hover:decoration-indigo-200 transition-all"
          >
            {isRegistering ? 'Login here' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};