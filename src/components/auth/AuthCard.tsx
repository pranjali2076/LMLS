'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AuthCard() {
  const router = useRouter();
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Field validation touched states
  const [touched, setTouched] = useState({ username: false, password: false });

  const isUsernameEmpty = touched.username && !username.trim();
  const isPasswordShort = touched.password && password.length > 0 && password.length < 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // Validate inputs
    if (!username.trim()) {
      setErrorMessage('Please enter your Username or User ID.');
      setTouched((prev) => ({ ...prev, username: true }));
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your secure password.');
      setTouched((prev) => ({ ...prev, password: true }));
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      setTouched((prev) => ({ ...prev, password: true }));
      return;
    }

    setIsLoading(true);
    try {
      const gEmail = username.includes('@') ? username.trim() : `${username.trim()}@gmail.com`;
      const gName = gEmail
        .split('@')[0]
        .split(/[._-]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const ok = await login(gEmail, password, true, { email: gEmail, name: gName });
      if (ok) {
        setSuccessNotice(`Authentication successful! Redirecting as ${gName}...`);
        setTimeout(() => {
          router.replace('/app');
        }, 500);
      } else {
        setErrorMessage('Invalid credentials. Check your username or password.');
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const gEmail = username.includes('@') ? username.trim() : 'alex.rivera@gmail.com';
      const gName = gEmail
        .split('@')[0]
        .split(/[._-]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      const ok = await login(gEmail, '', true, { email: gEmail, name: gName });
      if (ok) {
        setSuccessNotice(`Signed in with Google as ${gName} (${gEmail})! Launching workspace...`);
        setTimeout(() => {
          router.replace('/app');
        }, 500);
      }
    } catch {
      setErrorMessage('Google authentication failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const fillDemo = (demoType: 'admin' | 'student') => {
    if (demoType === 'admin') {
      setUsername('alex.rivera');
      setPassword('Cognitive2026!');
    } else {
      setUsername('researcher_demo');
      setPassword('SecurePass456!');
    }
    setTouched({ username: true, password: true });
    setErrorMessage(null);
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-1">
      {/* Ambient background glow ring */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-600/20 blur-xl opacity-75 animate-pulse" />

      {/* Main Glassmorphism Card */}
      <div className="relative rounded-2xl glass-panel-emerald p-8 sm:p-10 shadow-2xl border border-emerald-500/25 backdrop-blur-2xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/10">
            <Sparkles className="w-7 h-7 text-slate-950 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            LMLS <span className="text-emerald-400 font-extrabold">Cognitive</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Intelligent Multi-Domain Workspace for Academic, Health & Productivity
          </p>
        </div>

        {/* Validation / Status alerts */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            role="alert"
            className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successNotice && (
          <div
            id="auth-success-banner"
            role="status"
            className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm animate-in fade-in duration-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username / User ID */}
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Username / User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. alex.rivera or UID-4902"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isUsernameEmpty
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-emerald-500/80 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {isUsernameEmpty && (
              <p className="mt-1 text-xs text-rose-400 font-medium">Username cannot be blank.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
              >
                Autofill Demo
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isPasswordShort
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-emerald-500/80 focus:ring-emerald-500/20'
                }`}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {isPasswordShort && (
              <p className="mt-1 text-xs text-rose-400 font-medium">
                Password must be at least 4 characters.
              </p>
            )}
          </div>

          {/* Remember me & Security status */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500/30 accent-emerald-500"
              />
              <span>Keep session active</span>
            </label>
            <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
            </span>
          </div>

          {/* Submit Sign In Button */}
          <button
            type="submit"
            id="signin-submit-btn"
            disabled={isLoading || isGoogleLoading}
            className="w-full relative group flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Authenticating Session...
              </span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider line */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/90 px-3 text-slate-400 font-medium tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 shadow-sm"
        >
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting Google OAuth...
            </span>
          ) : (
            <>
              {/* Official Google Vector Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Demo Quick Presets Footer */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 mb-2">Instant Demo Personas:</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              Dr. Alex Rivera (Architect)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student')}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              Research Fellow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
