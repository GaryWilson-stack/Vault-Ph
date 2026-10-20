import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// Secret key required to register an administrative account. 
// Can also be set in .env as VITE_ADMIN_SECRET_KEY
const ADMIN_INVITE_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'VAULT-ADMIN-2026';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Enforce secret invite passkey to create an admin account
        if (secretKey.trim() !== ADMIN_INVITE_KEY) {
          setErrorMsg('Invalid Admin Secret Key. You are not authorized to create an administrative account.');
          setLoading(false);
          return;
        }

        // Register in Supabase with admin metadata
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              role: 'admin',
              is_admin: true,
            },
          },
        });

        if (error) {
          // If Supabase is unavailable in local dev, create local admin session
          if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
            localStorage.setItem('vault_ph_admin_authenticated', 'true');
            localStorage.setItem('vault_ph_admin_user', JSON.stringify({ email: email.trim(), role: 'admin' }));
            navigate('/admin');
            return;
          }
          throw error;
        }

        if (data.user) {
          localStorage.setItem('vault_ph_admin_authenticated', 'true');
          setSuccessMsg('Admin account created successfully! Signing in...');
          setTimeout(() => {
            navigate('/admin');
          }, 1000);
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // Check emergency local storage bypass if Supabase is offline/mock
          const storedAdmin = localStorage.getItem('vault_ph_admin_user');
          if (storedAdmin) {
            const parsed = JSON.parse(storedAdmin);
            if (parsed.email === email.trim()) {
              localStorage.setItem('vault_ph_admin_authenticated', 'true');
              navigate('/admin');
              return;
            }
          }
          throw error;
        }

        const user = data.user;
        const isAdmin = user?.user_metadata?.role === 'admin' || user?.user_metadata?.is_admin === true || user?.email?.includes('admin');

        if (!isAdmin) {
          await supabase.auth.signOut();
          throw new Error('Access Denied: This account does not possess administrator privileges.');
        }

        localStorage.setItem('vault_ph_admin_authenticated', 'true');
        navigate('/admin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1677FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#08152A] border border-[#0B1D36] rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] p-[2px] mb-4 shadow-[0_0_25px_rgba(0,207,255,0.3)]">
            <div className="w-full h-full bg-[#050B18] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#00CFFF]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-wide">
            VAULT PH <span className="text-[#00CFFF]">ADMIN</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1.5">
            {isRegister ? 'Register an authorized staff administrator' : 'Secure administrative console sign in'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Staff Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
              />
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-11 pr-4 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00CFFF] transition-all"
              />
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Secret Invite Key (Only visible when creating an admin account) */}
          {isRegister && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                <span>Secret Admin Passkey</span>
                <span className="text-[10px] text-gray-400">Required</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter organization admin key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  className="w-full h-11 pl-11 pr-4 bg-[#050B18] border border-amber-500/40 focus:border-amber-400 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-gray-400">
                Only team members with the organization secret passkey can generate admin credentials.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 text-sm font-bold text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              'Create Admin Account'
            ) : (
              'Authorize & Enter Dashboard'
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 pt-5 border-t border-[#0B1D36] text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-[#00CFFF] hover:underline cursor-pointer"
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : 'Need to register a new admin? Enter passkey'}
          </button>
        </div>

        {/* Back to Storefront */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault Ph Storefront</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
