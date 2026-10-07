import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { pingSupabaseProject } from '@/lib/pinger'
import { sendFailureAlert } from '@/lib/webhook'

// Allows running up to 60s on Vercel Pro/Hobby
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Validate secret if configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

    const results = []

    // Process pings in parallel (with limit)
    for (const project of projects) {
      const pingResult = await pingSupabaseProject(
        project.supabase_url,
        project.anon_key,
        project.target_table
      )

      // Update project status
      await supabase
        .from('projects')
        .update({
          last_ping_at: new Date().toISOString(),
          last_ping_status: pingResult.success ? 'success' : 'failed',
          last_ping_code: pingResult.statusCode,
          last_ping_message: pingResult.message,
        })
        .eq('id', project.id)

      // Optional: Insert to ping_logs
      await supabase.from('ping_logs').insert({
        project_id: project.id,
        status: pingResult.success ? 'success' : 'failed',
        status_code: pingResult.statusCode,
        response_time_ms: pingResult.responseTimeMs,
        message: pingResult.message,
      })

      // Dispatch failure alert webhook if configured
      if (!pingResult.success && project.webhook_url) {
        sendFailureAlert({
          webhookUrl: project.webhook_url,
          projectName: project.name,
          projectUrl: project.supabase_url,
          statusCode: pingResult.statusCode,
          message: pingResult.message,
        }).catch((err) => console.error('Error dispatching webhook alert:', err))
      }

      results.push({
        id: project.id,
        name: project.name,
        success: pingResult.success,
        statusCode: pingResult.statusCode,
        responseTimeMs: pingResult.responseTimeMs,
      })
    }

    return NextResponse.json({
      message: `Successfully processed ${results.length} project(s)`,
      processed: results.length,
      results,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Cron job fatal error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
