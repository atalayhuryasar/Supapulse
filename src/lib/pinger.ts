export interface PingResult {
  success: boolean
  statusCode: number
  responseTimeMs: number
  message: string
  endpointTested?: string
  /** Çağıranın zaman bütçesi bitmeden ping başlatılamadıysa true. Durum yazılmamalı. */
  skipped?: boolean
}

/**
 * Bir aşama için kullanılacak zaman aşımını döner.
 * `deadline` verilmişse kalan süreyle sınırlar; süre bitmişse `null`.
 */
function stageBudget(deadline: number | undefined, cap: number): number | null {
  if (deadline === undefined) return cap
  const left = deadline - Date.now()
  if (left <= 0) return null
  return Math.min(cap, left)
}

function skippedResult(startTime: number): PingResult {
  return {
    success: false,
    statusCode: 0,
    responseTimeMs: Date.now() - startTime,
    message: 'Skipped: time budget exhausted before this project could be pinged',
    skipped: true,
  }
}

function timedOutResult(startTime: number, stage: string): PingResult {
  return {
    success: false,
    statusCode: 0,
    responseTimeMs: Date.now() - startTime,
    message: `Timed out: deadline exceeded during ${stage}`,
  }
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
  targetTable?: string | null,
  /** Epoch ms. Verilirse hiçbir aşama bu zamanın ötesine taşmaz. */
  deadline?: number
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
  const rpcBudget = stageBudget(deadline, 5000)
  if (rpcBudget === null) return skippedResult(startTime)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), rpcBudget)

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
  // Tablo adı URL yoluna giriyor: sadece harf/rakam/alt çizgi kalsın (path traversal / sorgu enjeksiyonu).
  const sanitizedTarget = targetTable?.trim().replace(/^\/+/, '').replace(/[^A-Za-z0-9_]/g, '')
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

  const tableBudget = stageBudget(deadline, 6000)
  if (tableBudget === null) return timedOutResult(startTime, 'table probe')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), tableBudget)

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
    const fallbackBudget = stageBudget(deadline, 6000)
    if (fallbackBudget === null) return timedOutResult(startTime, 'fallback probes')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), fallbackBudget)

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
