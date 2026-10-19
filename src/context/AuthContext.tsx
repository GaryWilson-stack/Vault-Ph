import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authModalMessage?: string | null;
  openAuthModal: (mode?: 'login' | 'signup', message?: string | null, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (
    mode: 'login' | 'signup' = 'login',
    message: string | null = null,
    onSuccess?: () => void
  ) => {
    setAuthModalMode(mode);
    setAuthModalMessage(message);
    if (onSuccess) {
      setOnAuthSuccessCallback(() => onSuccess);
    } else {
      setOnAuthSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage(null);
  };

  const triggerAuthSuccess = () => {
    if (onAuthSuccessCallback) {
      try {
        onAuthSuccessCallback();
      } catch (err) {
        console.error('Error executing auth success callback:', err);
      }
      setOnAuthSuccessCallback(null);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data?.session) {
      triggerAuthSuccess();
    }
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error && (data?.session || data?.user)) {
      triggerAuthSuccess();
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        authModalMode,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
