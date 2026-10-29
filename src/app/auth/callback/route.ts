import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Yalnızca site içi göreli yollar: "//evil.com" veya "https://evil.com" reddedilir.
function safeNext(value: string | null): string {
  if (!value) return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/dashboard'
  }
  return value
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = safeNext(requestUrl.searchParams.get('next'))
  // Origin'i istekten veya istemcinin gönderebileceği X-Forwarded-Host'tan değil,
  // yapılandırılmış adresten al.
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/+$/, '')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const errorDesc = requestUrl.searchParams.get('error_description') || 'auth-code-error'
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDesc)}`)
}
