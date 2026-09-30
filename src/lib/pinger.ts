export interface PingResult {
  success: boolean
  statusCode: number
  responseTimeMs: number
  message: string
}

/**
 * Executes a lightweight REST ping to a Supabase project.
 * Targeting `/rest/v1/` with the project's anon key triggers PostgREST
 * and wakes the Postgres instance / connection pool without heavy overhead.
 */
export async function pingSupabaseProject(
  supabaseUrl: string,
  anonKey: string
): Promise<PingResult> {
  // Normalize URL
  let cleanUrl = supabaseUrl.trim().replace(/\/+$/, '')
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`
  }

  const endpoint = `${cleanUrl}/rest/v1/`
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: anonKey.trim(),
        Authorization: `Bearer ${anonKey.trim()}`,
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)
    const responseTimeMs = Date.now() - startTime

    // PostgREST responds with 200 (or OpenAPI doc) if valid, or sometimes 401/403/404 if keys differ.
    // However, ANY response from the project instance means the project woke up!
    const isSuccess = res.status < 500

    return {
      success: isSuccess,
      statusCode: res.status,
      responseTimeMs,
      message: isSuccess
        ? `Pulse successful (${res.status} ${res.statusText})`
        : `Server returned error (${res.status} ${res.statusText})`,
    }
  } catch (error: unknown) {
    const responseTimeMs = Date.now() - startTime
    const err = error as Error
    return {
      success: false,
      statusCode: 0,
      responseTimeMs,
      message: err.name === 'AbortError' ? 'Connection timed out (10s)' : (err.message || 'Unknown network error'),
    }
  }
}
