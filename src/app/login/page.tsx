'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = searchParams.get('next') ?? '/'
  const urlError = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpSent, setSignUpSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setFormError(error.message)
      } else {
        router.push(next)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      setLoading(false)
      if (error) {
        setFormError(error.message)
      } else if (data.session) {
        // Email confirmation disabled — signed in immediately
        router.push(next)
      } else {
        setSignUpSent(true)
      }
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setFormError(null)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="flex min-h-screen bg-[#030712]">
      {/* Left panel */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-slate-950 to-black lg:flex lg:w-1/2">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
              animation: 'pulse 6s ease-in-out infinite 2s',
            }}
          />
        </div>

        <div className="relative z-10 px-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-10 w-10 fill-white">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
            </svg>
            <span
              className="text-3xl font-black"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #f0abfc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Slideshow Maker
            </span>
          </div>

          <h2 className="mb-4 text-2xl font-bold text-white">
            Turn images into viral<br />TikTok slideshows
          </h2>
          <p className="mb-10 text-slate-400">
            Design, edit, and upload directly from your browser.
          </p>

          <div className="flex flex-col items-center gap-3">
            {[
              { icon: '🖼️', label: '1080×1350 Native Canvas' },
              { icon: '✨', label: 'Text, fonts & overlays' },
              { icon: '🚀', label: 'Upload straight to TikTok' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <svg viewBox="0 0 24 24" className="mb-2 h-8 w-8 fill-white">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
            </svg>
            <span className="text-lg font-bold text-white">TikTok Slideshow Maker</span>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            {mode === 'signin' ? 'Sign in to continue' : 'Sign up to get started'}
          </p>

          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-white/[0.04] p-1 ring-1 ring-white/[0.08]">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-all"
                style={
                  mode === m
                    ? {
                        background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                        color: '#fff',
                        boxShadow: '0 0 12px rgba(124,58,237,0.35)',
                      }
                    : { color: '#94a3b8' }
                }
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* URL error */}
          {urlError && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {urlError === 'no_code'
                ? 'The sign-in link was invalid or expired. Please try again.'
                : urlError}
            </div>
          )}

          {signUpSent ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/20">
                <svg
                  className="h-7 w-7 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  style={{
                    strokeDasharray: 40,
                    strokeDashoffset: 0,
                    animation: 'checkmark 0.4s ease-out forwards',
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white">Confirm your email</h2>
              <p className="text-sm text-slate-400">
                We sent a confirmation link to{' '}
                <span className="font-medium text-white">{email}</span>.<br />
                After confirming, you can sign in with your password.
              </p>
              <button
                className="mt-5 text-sm text-violet-400 underline underline-offset-2"
                onClick={() => { setSignUpSent(false); switchMode('signin') }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
            >
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-4 w-full rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 transition focus:ring-violet-500/60"
              />

              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mb-4 w-full rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 transition focus:ring-violet-500/60"
              />

              {mode === 'signup' && (
                <>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="confirm">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mb-4 w-full rounded-xl bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 transition focus:ring-violet-500/60"
                  />
                </>
              )}

              {formError && (
                <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(124,58,237,0.4)',
                }}
              >
                {loading
                  ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                  : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes checkmark {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <LoginForm />
    </Suspense>
  )
}
