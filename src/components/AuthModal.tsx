import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, Loader2, User } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, authModalMessage, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(authModalMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    setIsSignUp(authModalMode === 'signup');
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Registration successful! Please check your email to confirm your account.');
          setTimeout(() => {
            closeAuthModal();
          }, 2500);
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Welcome back!');
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={closeAuthModal}
    >
      <div
        className="relative max-w-md w-full bg-[#08152A] border border-[#00CFFF]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,207,255,0.25)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0B1D36] bg-[#050B18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1677FF] to-[#00CFFF] p-[1.5px] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                {isSignUp ? 'Create Vault Account' : 'Sign In to Vault PH'}
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                {isSignUp ? 'Track orders & faster top-up checkouts' : 'Access your order history & saved details'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg bg-[#0B1D36] hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {authModalMessage && (
            <div className="p-3.5 rounded-xl bg-[#00CFFF]/10 border border-[#00CFFF]/40 text-[#00CFFF] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#00CFFF] shrink-0" />
              <span>{authModalMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-200">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 bg-[#050B18] border border-[#0B1D36] focus:border-[#00CFFF] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 font-bold text-sm text-white bg-gradient-to-r from-[#1677FF] to-[#00CFFF] rounded-xl hover:shadow-[0_0_20px_rgba(0,207,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-2 text-center text-xs text-[#94A3B8]">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className="text-[#00CFFF] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className="text-[#00CFFF] font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
