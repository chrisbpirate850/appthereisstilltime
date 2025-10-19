'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  type User
} from 'firebase/auth';

interface SignupModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentAnonymousUser?: User | null;
  reason?: 'trial_expired' | 'trial_limit' | 'feature_locked' | 'voluntary';
}

/**
 * Signup/Login Modal
 *
 * Handles:
 * - New user signup (email/password)
 * - Existing user login
 * - Anonymous → Registered account linking
 * - Preserves anonymous user's session data
 */
export function SignupModal({
  onClose,
  onSuccess,
  currentAnonymousUser,
  reason = 'voluntary'
}: SignupModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReasonMessage = () => {
    switch (reason) {
      case 'trial_expired':
        return 'Your 7-day trial has ended. Sign up to continue using There Is Still Time.';
      case 'trial_limit':
        return "You've used your 2 free sessions today. Sign up for unlimited sessions.";
      case 'feature_locked':
        return 'Sign up for free to unlock this feature.';
      default:
        return 'Sign up to save your progress and access all features.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // New user signup
        if (currentAnonymousUser?.isAnonymous) {
          // Link anonymous account to new credentials
          const credential = EmailAuthProvider.credential(email, password);
          const result = await linkWithCredential(currentAnonymousUser, credential);

          console.log('✅ Anonymous account linked:', result.user.uid);
          onSuccess(result.user);
        } else {
          // Fresh signup (no anonymous account)
          const result = await createUserWithEmailAndPassword(auth, email, password);

          console.log('✅ New account created:', result.user.uid);
          onSuccess(result.user);
        }
      } else {
        // Existing user login
        const result = await signInWithEmailAndPassword(auth, email, password);

        console.log('✅ User logged in:', result.user.uid);
        onSuccess(result.user);
      }
    } catch (err: any) {
      console.error('❌ Auth error:', err);

      // User-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Try signing up instead.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/provider-already-linked') {
        setError('This account is already linked. Try logging in.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        {reason === 'voluntary' && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-twilight-400 hover:text-white transition-smooth"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-light text-white mb-2">
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </h2>
          <p className="text-sm text-twilight-300">
            {getReasonMessage()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-twilight-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-twilight-900/50 border border-twilight-700 rounded-lg text-white placeholder-twilight-500 focus:outline-none focus:border-twilight-500 transition-smooth"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm text-twilight-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-twilight-900/50 border border-twilight-700 rounded-lg text-white placeholder-twilight-500 focus:outline-none focus:border-twilight-500 transition-smooth"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-twilight-600 hover:bg-twilight-500 text-white rounded-lg font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {mode === 'signup' ? 'Creating account...' : 'Logging in...'}
              </span>
            ) : (
              mode === 'signup' ? 'Sign Up' : 'Log In'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError(null);
            }}
            className="text-sm text-twilight-400 hover:text-twilight-300 transition-smooth"
          >
            {mode === 'signup' ? (
              <>
                Already have an account? <span className="underline">Log in</span>
              </>
            ) : (
              <>
                Don't have an account? <span className="underline">Sign up</span>
              </>
            )}
          </button>
        </div>

        {/* Benefits (for voluntary signups) */}
        {reason === 'voluntary' && mode === 'signup' && (
          <div className="mt-6 pt-6 border-t border-twilight-700">
            <p className="text-xs text-twilight-400 mb-3">What you get for free:</p>
            <ul className="space-y-2 text-sm text-twilight-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-twilight-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unlimited focus sessions
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-twilight-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                5 Zen hourglass themes
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-twilight-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Progress tracking
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
