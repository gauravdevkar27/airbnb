'use client';
 
import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';
 
type Role         = 'user' | 'admin';
type ResendStatus = 'idle' | 'sending' | 'sent' | 'error';
 
interface AuthState {
  isLoading:    boolean;
  error:        string | null;
  isUnverified: boolean;
  resendStatus: ResendStatus;
 
  login:              (email: string, password: string, onSuccess?: () => void) => Promise<void>;
  logout:             () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  clearError:         () => void;
  reset:              () => void;
}
 
const initialState = {
  isLoading:    false,
  error:        null,
  isUnverified: false,
  resendStatus: 'idle' as ResendStatus,
};
 
const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
 
  login: async (email, password, onSuccess) => {
    set({ isLoading: true, error: null, isUnverified: false });
 
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email:    email.trim().toLowerCase(),
        password,
      });
 
      if (!result?.ok) {
        const errMsg = result?.error ?? 'Something went wrong.';
        if (errMsg === 'EMAIL_NOT_VERIFIED') {
          set({ isUnverified: true, error: 'Please verify your email before logging in.' });
        } else {
          set({ error: errMsg });
        }
        return;
      }
 
      set({ ...initialState });
      onSuccess?.();
 
    } catch {
      set({ error: 'An unexpected error occurred. Please try again.' });
    } finally {
      set({ isLoading: false });
    }
  },
 
  logout: async () => {
    set({ isLoading: true });
    await signOut({ callbackUrl: '/login' });
    set({ ...initialState });
  },
 
  resendVerification: async (email) => {
    set({ resendStatus: 'sending' });
    try {
      const res = await fetch('/api/resend-verification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
 
      if (res.ok) {
        set({ resendStatus: 'sent' });
      } else {
        const data = await res.json();
        set({ resendStatus: 'error', error: data.error ?? 'Failed to resend.' });
      }
    } catch {
      set({ resendStatus: 'error' });
    }
  },
 
  clearError: () => set({ error: null }),
  reset:      () => set({ ...initialState }),
}));
 
export default useAuthStore;