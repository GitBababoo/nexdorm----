
import React, { useState } from 'react';
import { Building, ArrowRight, User, Lock, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../lib/supabase';
import { User as AppUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: AppUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await api.login(username, password);
      
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid Credentials)');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ (Connection Error)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[100px] animate-pulse" />
            <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-[420px] px-6">
            {/* Brand Header */}
            <div className="text-center mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-2xl shadow-indigo-500/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                    <Building size={36} className="text-white" strokeWidth={2} />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">NexDorm</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-slate-500 font-medium">Intelligent Management</span>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">PRO</span>
                </div>
            </div>

            {/* Glass Login Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 animate-in zoom-in-95 duration-500 relative group">
                {/* Decor Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 rounded-b-full"></div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1.5">
                         <label className={`text-xs font-bold uppercase tracking-wider transition-colors ml-1 ${focusedField === 'username' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            Username / Room No.
                         </label>
                         <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'transform scale-[1.02]' : ''}`}>
                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'username' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                <User size={20} />
                            </div>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500/50 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm focus:shadow-md focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Enter username..."
                                disabled={isLoading}
                            />
                         </div>
                    </div>

                    <div className="space-y-1.5">
                         <label className={`text-xs font-bold uppercase tracking-wider transition-colors ml-1 ${focusedField === 'password' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            Password
                         </label>
                         <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'password' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                <Lock size={20} />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500/50 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm focus:shadow-md focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                         </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center animate-in slide-in-from-top-2 fade-in flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={22} />
                        ) : (
                            <>Sign In <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-slate-400 text-xs font-medium opacity-60">
                    Powered by Supabase & Gemini AI
                </p>
                <p className="text-slate-300 text-[10px] mt-1">
                    Protected by enterprise-grade security.
                </p>
            </div>
        </div>
    </div>
  );
}
