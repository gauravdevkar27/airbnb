// app/store/useAuthStore.ts
'use client';

import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';

type ResendStatus = 'idle' | 'sending' | 'sent' | 'error';

interface AuthState {
  // ── State ─────────────────────────────────────────────────────────────────
  isLoading:    boolean;
  error:        string | null;
  isUnverified: boolean;       // true when EMAIL_NOT_VERIFIED error
  resendStatus: ResendStatus;

  // ── Actions ───────────────────────────────────────────────────────────────
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

  // ── login ─────────────────────────────────────────────────────────────────
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

      // Success — let the page handle the redirect via onSuccess callback
      set({ ...initialState });
      onSuccess?.();

    } catch {
      set({ error: 'An unexpected error occurred. Please try again.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    await signOut({ callbackUrl: '/login' });
    set({ ...initialState });
  },

  // ── resendVerification ────────────────────────────────────────────────────
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
        set({
          resendStatus: 'error',
          error: data.error ?? 'Failed to resend. Try again shortly.',
        });
      }
    } catch {
      set({ resendStatus: 'error' });
    }
  },

  // ── helpers ───────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
  reset:      () => set({ ...initialState }),
}));

export default useAuthStore;