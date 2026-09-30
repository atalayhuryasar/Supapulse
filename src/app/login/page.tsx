'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.1 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.2L1.6 16C3.5 19.8 7.4 23 12 23z"
      />
    </svg>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      setOauthLoading(provider)
      setError(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError((err as Error).message || 'Giriş yapılırken bir hata oluştu.')
      setOauthLoading(null)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setLoading(true)
      setError(null)
      setMessage(null)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setMessage(`Giriş bağlantısı ${email} adresine gönderildi! E-posta kutunuzu (spam klasörü dahil) kontrol edin.`)
    } catch (err: unknown) {
      setError((err as Error).message || 'Giriş bağlantısı gönderilemedi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d11] text-[#f0f6fc]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#3ecf8e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#3ecf8e]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-xl text-[#3ecf8e]">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-[#3ecf8e] bg-clip-text text-transparent">
            Supapulse
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold mb-2">Giriş Yap veya Kayıt Ol</h1>
          <p className="text-sm text-neutral-400">
            Supabase projelerinizi kesintisiz uyanık tutmaya başlayın.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 mb-6 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e] text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{message}</p>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={oauthLoading !== null || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-all cursor-pointer disabled:opacity-50"
          >
            <GithubIcon className="w-5 h-5" />
            {oauthLoading === 'github' ? 'Bağlanıyor...' : 'GitHub ile Devam Et'}
          </button>

          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={oauthLoading !== null || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            {oauthLoading === 'google' ? 'Bağlanıyor...' : 'Google ile Devam Et'}
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#30363d]"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
            Veya Magic Link
          </span>
          <div className="flex-grow border-t border-[#30363d]"></div>
        </div>

        {/* Email Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adiniz@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] focus:border-[#3ecf8e] focus:outline-none text-white text-sm placeholder-neutral-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading !== null}
            className="w-full py-2.5 px-4 rounded-xl font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#3ecf8e]/20 text-sm"
          >
            {loading ? 'Gönderiliyor...' : 'Giriş Bağlantısı Gönder'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#30363d] flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-[#3ecf8e]" />
          <span>Şifresiz Güvenli Giriş & RLS Koruması</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#090d11] text-[#f0f6fc]">
        <div className="animate-pulse text-sm text-neutral-400">Yükleniyor...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
