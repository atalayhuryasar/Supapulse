export interface PingResult {
  success: boolean
  statusCode: number
  responseTimeMs: number
  message: string
  endpointTested?: string
}

/**
 * Executes a deep heartbeat ping to keep Supabase projects alive and prevent inactivity pausing.
 *
 * Supabase pauses free-tier projects unless they receive actual *database activity* (SQL queries).
 * Simply calling a static endpoint or health check doesn't guarantee the Postgres engine resets its timer.
 *
 * Strategy:
 * 1. POST `/auth/v1/recover` with an internal probe email.
 *    -> This causes the GoTrue Auth engine to perform a real `SELECT * FROM auth.users WHERE email = ...`
 *    -> Wakes up the database pooler and executes active Postgres SQL without sending real emails.
 * 2. Fallback to `/auth/v1/health` and `/rest-admin/v1/ready`.
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

  const startTime = Date.now()

  // 1. Primary Strategy: Real DB Query via Auth Recover
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const dbProbeRes = await fetch(`${cleanUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        apikey: anonKey.trim(),
        Authorization: `Bearer ${anonKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'heartbeat_probe_supapulse@internal.invalid',
      }),
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)
    const responseTimeMs = Date.now() - startTime

    // 200 OK means GoTrue queried Postgres auth.users successfully!
    if (dbProbeRes.status === 200) {
      return {
        success: true,
        statusCode: 200,
        responseTimeMs,
        message: 'Pulse successful (Active Postgres DB query executed: 200 OK)',
        endpointTested: '/auth/v1/recover',
      }
    }
  } catch (error) {
    console.warn('DB probe error, falling back to health checks:', error)
  }

  // 2. Secondary Strategy: Fallback Health Checks
  const fallbackEndpoints = [
    { path: '/auth/v1/health', name: 'Auth Health' },
    { path: '/rest-admin/v1/ready', name: 'PostgREST Ready' },
    { path: '/rest/v1/', name: 'REST Root' },
  ]

  for (const ep of fallbackEndpoints) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(`${cleanUrl}${ep.path}`, {
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

      if (res.status === 200) {
        return {
          success: true,
          statusCode: 200,
          responseTimeMs,
          message: `Pulse successful (Health check: 200 OK via ${ep.name})`,
          endpointTested: ep.path,
        }
      }
    } catch {
      continue
    }
  }

  const totalTime = Date.now() - startTime
  return {
    success: false,
    statusCode: 0,
    responseTimeMs: totalTime,
    message: 'Could not connect to project database endpoints (timed out)',
  }
}
