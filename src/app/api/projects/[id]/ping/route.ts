import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pingSupabaseProject } from '@/lib/pinger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch project
  const { data: project, error: fetchErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Ping project
  const pingResult = await pingSupabaseProject(project.supabase_url, project.anon_key)

  // Update project in DB
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
    console.error('Error updating project after manual ping:', updateErr)
  }

  // Add ping log
  await supabase.from('ping_logs').insert({
    project_id: project.id,
    status: pingResult.success ? 'success' : 'failed',
    status_code: pingResult.statusCode,
    response_time_ms: pingResult.responseTimeMs,
    message: pingResult.message,
  })

  return NextResponse.json({
    success: pingResult.success,
    statusCode: pingResult.statusCode,
    responseTimeMs: pingResult.responseTimeMs,
    message: pingResult.message,
  })
}
