'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/app/components/hooks/useAuthStore';

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Pull exactly what we need from the store — no unnecessary re-renders
  const login              = useAuthStore((s) => s.login);
  const logout             = useAuthStore((s) => s.logout);
  const isLoading          = useAuthStore((s) => s.isLoading);
  const error              = useAuthStore((s) => s.error);
  const isUnverified       = useAuthStore((s) => s.isUnverified);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const resendStatus       = useAuthStore((s) => s.resendStatus);
  const clearError         = useAuthStore((s) => s.clearError);
  const reset              = useAuthStore((s) => s.reset);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [banner, setBanner]     = useState<{ type: 'success' | 'info' | 'error'; msg: string } | null>(null);

  // Reset store state when mounting the page
  useEffect(() => { reset(); }, [reset]);

  // Show banners based on query params from verify-email redirects
  useEffect(() => {
    const verified = searchParams.get('verified');
    const info     = searchParams.get('info');
    const err      = searchParams.get('error');

    if (verified === 'true') {
      setBanner({ type: 'success', msg: 'Email verified! You can now log in.' });
    } else if (info === 'already_verified') {
      setBanner({ type: 'info', msg: 'Your email is already verified. Log in below.' });
    } else if (err === 'invalid_token') {
      setBanner({ type: 'error', msg: 'Verification link is invalid. Request a new one below.' });
    } else if (err === 'token_expired') {
      setBanner({ type: 'error', msg: 'Verification link expired. Request a new one below.' });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, () => {
      router.push('/');
      router.refresh();
    });
  };

  const bannerStyles: Record<string, string> = {
    success: 'bg-green-50 border-green-300 text-green-800',
    info:    'bg-blue-50  border-blue-300  text-blue-800',
    error:   'bg-red-50   border-red-300   text-red-800',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Query-param banner */}
        {banner && (
          <div className={`mb-5 px-4 py-3 rounded-lg border text-sm ${bannerStyles[banner.type]}`}>
            {banner.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* General error */}
          {error && !isUnverified && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Email not verified block */}
          {isUnverified && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium mb-1">Email not verified</p>
              <p className="text-amber-700 mb-2">
                Check your inbox or request a new verification link.
              </p>
              {resendStatus === 'sent' ? (
                <p className="text-green-700 font-medium">New link sent — check your inbox.</p>
              ) : resendStatus === 'error' ? (
                <p className="text-red-600">{error ?? 'Failed to resend. Try again shortly.'}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => resendVerification(email)}
                  disabled={resendStatus === 'sending'}
                  className="text-amber-900 underline underline-offset-2 font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white
                       text-sm font-medium transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-rose-500 hover:text-rose-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}