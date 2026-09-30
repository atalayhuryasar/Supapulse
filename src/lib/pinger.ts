export interface PingResult {
  success: boolean
  statusCode: number
  responseTimeMs: number
  message: string
  endpointTested?: string
}

/**
 * Executes a heartbeat ping to keep Supabase projects alive and prevent inactivity pausing.
 * We test the project's health endpoints:
 * 1. `/auth/v1/health` (GoTrue Auth engine - returns 200 OK)
 * 2. `/rest-admin/v1/ready` (PostgREST readiness - returns 200 OK)
 * 3. Fallback to `/rest/v1/`
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

  const endpoints = [
    { path: '/auth/v1/health', name: 'Auth Health' },
    { path: '/rest-admin/v1/ready', name: 'PostgREST Ready' },
    { path: '/rest/v1/', name: 'REST Root' },
  ]

  const startTime = Date.now()

  for (const ep of endpoints) {
    const fullUrl = `${cleanUrl}${ep.path}`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout per attempt

      const res = await fetch(fullUrl, {
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

      // If we get a 200 OK, return immediately!
      if (res.status === 200) {
        return {
          success: true,
          statusCode: res.status,
          responseTimeMs,
          message: `Pulse successful (200 OK via ${ep.name})`,
          endpointTested: ep.path,
        }
      }

      // If we get < 500 (e.g. 401/404), continue to next endpoint if available
      // but remember that any gateway response means project is reachable.
      if (ep === endpoints[endpoints.length - 1]) {
        return {
          success: res.status < 500,
          statusCode: res.status,
          responseTimeMs,
          message: `Pulse active (${res.status} ${res.statusText})`,
          endpointTested: ep.path,
        }
      }
    } catch {
      // If error on this endpoint, try next
      continue
    }
  }

  const totalTime = Date.now() - startTime
  return {
    success: false,
    statusCode: 0,
    responseTimeMs: totalTime,
    message: 'Could not connect to project health endpoints (timed out)',
  }
}
