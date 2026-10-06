export interface PingResult {
  success: boolean
  statusCode: number
  responseTimeMs: number
  message: string
  endpointTested?: string
}

/**
 * Executes a multi-layered heartbeat ping to keep Supabase projects alive and prevent inactivity pausing.
 *
 * Supabase free-tier projects are paused if they don't receive active database/API requests for 7 days.
 * Strategy:
 * 1. Primary Strategy: Direct Postgres Database Query via PostgREST (`/rest/v1/<table_name>?select=*&limit=1`).
 *    -> Probes common application table names in parallel. When matched, PostgREST executes a real
 *       `SELECT ... LIMIT 1` on the PostgreSQL database, which completely resets Supabase's inactivity timer.
 * 2. Secondary Strategy: API Gateway & GraphQL Probes:
 *    -> `OPTIONS /rest/v1/`: Registers active traffic at Supabase's Kong/Envoy API gateway for the project ref.
 *    -> `POST /graphql/v1`: Hits the pg_graphql engine.
 * 3. Tertiary Strategy: Auth Engine Probe:
 *    -> `POST /auth/v1/recover`: Triggers GoTrue Auth probe.
 *    -> `GET /auth/v1/health` and `GET /rest-admin/v1/ready`.
 */
export async function pingSupabaseProject(
  supabaseUrl: string,
  anonKey: string,
  targetTable?: string | null
): Promise<PingResult> {
  // Normalize URL
  let cleanUrl = supabaseUrl.trim().replace(/\/+$/, '')
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`
  }

  const cleanKey = anonKey.trim()
  const startTime = Date.now()

  const defaultHeaders: Record<string, string> = {
    apikey: cleanKey,
    Authorization: `Bearer ${cleanKey}`,
  }

  // 0. Golden Strategy: Dedicated Heartbeat RPC (Zero Table Exposure, RLS-Proof)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const rpcRes = await fetch(`${cleanUrl}/rest/v1/rpc/supapulse_heartbeat`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)

    if (rpcRes.status === 200) {
      const responseTimeMs = Date.now() - startTime
      return {
        success: true,
        statusCode: 200,
        responseTimeMs,
        message: 'Pulse successful (Dedicated Heartbeat RPC: 200 OK)',
        endpointTested: '/rest/v1/rpc/supapulse_heartbeat',
      }
    }
  } catch {
    // Continue to Table & Gateway strategies if RPC is not installed
  }

  // 1. Primary Strategy: Direct PostgreSQL Table Read via PostgREST
  const sanitizedTarget = targetTable?.trim().replace(/^\/+/, '')
  const commonTables = [
    ...(sanitizedTarget ? [sanitizedTarget] : []),
    'reservations',
    'activities',
    'profiles',
    'users',
    'todos',
    'items',
    'posts',
    'projects',
    'accounts',
    'notes',
    'logs',
    'settings',
    'events',
    'members',
    'messages',
  ]

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const tablePromises = commonTables.map(async (table) => {
      const res = await fetch(`${cleanUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: defaultHeaders,
        signal: controller.signal,
        cache: 'no-store',
      })
      if (res.status === 200) {
        return { table, status: res.status }
      }
      throw new Error(`Status ${res.status}`)
    })

    const result = await Promise.any(tablePromises)
    clearTimeout(timeoutId)
    const responseTimeMs = Date.now() - startTime

    return {
      success: true,
      statusCode: result.status,
      responseTimeMs,
      message: `Active Postgres query executed on "${result.table}" (200 OK)`,
      endpointTested: `/rest/v1/${result.table}`,
    }
  } catch {
    // Continue to gateway, graphql, and auth fallbacks
  }

  // 2. Secondary Strategy: API Gateway, GraphQL, and Auth Probes
  const fallbackEndpoints = [
    {
      name: 'REST Gateway (OPTIONS)',
      path: '/rest/v1/',
      options: { method: 'OPTIONS', headers: defaultHeaders },
    },
    {
      name: 'GraphQL Probe',
      path: '/graphql/v1',
      options: {
        method: 'POST',
        headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      },
    },
    {
      name: 'Auth Recover Probe',
      path: '/auth/v1/recover',
      options: {
        method: 'POST',
        headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'heartbeat_probe_supapulse@internal.invalid' }),
      },
    },
    {
      name: 'Auth Health',
      path: '/auth/v1/health',
      options: { method: 'GET', headers: defaultHeaders },
    },
    {
      name: 'PostgREST Ready',
      path: '/rest-admin/v1/ready',
      options: { method: 'GET', headers: defaultHeaders },
    },
  ]

  for (const ep of fallbackEndpoints) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(`${cleanUrl}${ep.path}`, {
        ...ep.options,
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeoutId)

      if (res.status >= 200 && res.status < 300) {
        const responseTimeMs = Date.now() - startTime
        return {
          success: true,
          statusCode: res.status,
          responseTimeMs,
          message: `Pulse successful (${ep.name}: ${res.status} OK)`,
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
