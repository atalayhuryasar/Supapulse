import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { pingSupabaseProject } from '@/lib/pinger'
import { sendFailureAlert } from '@/lib/webhook'
import { mapWithConcurrency } from '@/lib/concurrency'

// Allows running up to 60s on Vercel Pro/Hobby
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Aynı anda pinglenecek proje sayısı. Supabase tarafında gereksiz yük oluşturmadan
// duvar saatini düşürmek için yeterli.
const MAX_CONCURRENCY = 5
// Tek bir projenin en kötü senaryosu (RPC 5s + tablo 6s + 2 yedek 6s) ~23s.
// 20s bütçe, sağlıklı projeleri kesmeden yavaş olanları sınırlar.
const PER_PROJECT_BUDGET_MS = 20_000
// maxDuration = 60'ın altında kal: sonuçların DB'ye yazılması ve yanıt için pay bırak.
const TOTAL_BUDGET_MS = 50_000

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

type ProjectOutcome =
  | {
      status: 'pinged'
      id: string
      name: string
      success: boolean
      statusCode: number
      responseTimeMs: number
    }
  | { status: 'skipped'; id: string; name: string; reason: string }
  | { status: 'error'; id: string; name: string; reason: string }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Fail closed: secret yoksa endpoint açık kalmasın.
  if (!cronSecret) {
    console.error('CRON_SECRET is not configured; refusing to run the cron job.')
    return NextResponse.json({ error: 'Cron secret is not configured' }, { status: 500 })
  }

  const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
  if (!safeEqual(provided, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Fetch all active projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching projects for cron:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ message: 'No active projects to ping', processed: 0 })
    }

    const overallDeadline = Date.now() + TOTAL_BUDGET_MS

    const pingOne = async (project: (typeof projects)[number]): Promise<ProjectOutcome> => {
      // Kısmi bütçeyle başlatmak yanlış "failed" üretir; hiç başlatma, raporla.
      if (overallDeadline - Date.now() < PER_PROJECT_BUDGET_MS) {
        return {
          status: 'skipped',
          id: project.id,
          name: project.name,
          reason: 'overall cron budget exhausted',
        }
      }

      const pingResult = await pingSupabaseProject(
        project.supabase_url,
        project.anon_key,
        project.target_table,
        Date.now() + PER_PROJECT_BUDGET_MS
      )

      // Bütçe ping başlamadan bittiyse durumu yazma: proje sağlıklı olabilir.
      if (pingResult.skipped) {
        return {
          status: 'skipped',
          id: project.id,
          name: project.name,
          reason: pingResult.message,
        }
      }

      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          last_ping_at: new Date().toISOString(),
          last_ping_status: pingResult.success ? 'success' : 'failed',
          last_ping_code: pingResult.statusCode,
          last_ping_message: pingResult.message,
        })
        .eq('id', project.id)

      if (updateErr) {
        console.error(`Error updating project ${project.id} after ping:`, updateErr)
      }

      const { error: logErr } = await supabase.from('ping_logs').insert({
        project_id: project.id,
        status: pingResult.success ? 'success' : 'failed',
        status_code: pingResult.statusCode,
        response_time_ms: pingResult.responseTimeMs,
        message: pingResult.message,
      })

      if (logErr) {
        console.error(`Error inserting ping log for ${project.id}:`, logErr)
      }

      // Uyarıyı await et: yanıt dönünce fonksiyon dondurulduğu için
      // fire-and-forget çağrılar serverless'ta kaybolabiliyor.
      if (!pingResult.success && project.webhook_url) {
        try {
          await sendFailureAlert({
            webhookUrl: project.webhook_url,
            projectName: project.name,
            projectUrl: project.supabase_url,
            statusCode: pingResult.statusCode,
            message: pingResult.message,
          })
        } catch (err) {
          console.error('Error dispatching webhook alert:', err)
        }
      }

      return {
        status: 'pinged',
        id: project.id,
        name: project.name,
        success: pingResult.success,
        statusCode: pingResult.statusCode,
        responseTimeMs: pingResult.responseTimeMs,
      }
    }

    const outcomes = await mapWithConcurrency(
      projects,
      MAX_CONCURRENCY,
      async (project): Promise<ProjectOutcome> => {
        try {
          return await pingOne(project)
        } catch (err: unknown) {
          // Tek bir projenin hatası tüm cron çalışmasını düşürmesin.
          const message = err instanceof Error ? err.message : String(err)
          console.error(`Error pinging project ${project.id}:`, err)
          return { status: 'error', id: project.id, name: project.name, reason: message }
        }
      }
    )

    const results = outcomes.filter((o) => o.status === 'pinged')
    const skipped = outcomes.filter((o) => o.status === 'skipped')
    const errors = outcomes.filter((o) => o.status === 'error')

    return NextResponse.json({
      message:
        skipped.length > 0 || errors.length > 0
          ? `Processed ${results.length} project(s), skipped ${skipped.length}, failed ${errors.length}`
          : `Successfully processed ${results.length} project(s)`,
      processed: results.length,
      skipped: skipped.length,
      failed: errors.length,
      results,
      skippedProjects: skipped,
      errors,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Cron job fatal error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
