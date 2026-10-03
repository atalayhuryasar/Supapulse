import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Project } from '@/types/project'
import { DashboardClient } from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, ping_logs(id, project_id, status, status_code, response_time_ms, message, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  const userMetadata = user.user_metadata || {}
  const userDisplayName =
    user.email ||
    userMetadata.full_name ||
    userMetadata.name ||
    (userMetadata.user_name ? `@${userMetadata.user_name}` : null) ||
    (userMetadata.preferred_username ? `@${userMetadata.preferred_username}` : null) ||
    'Developer'

  const userAvatar = (userMetadata.avatar_url as string) || (userMetadata.picture as string) || undefined

  return (
    <DashboardClient
      initialProjects={(projects as Project[]) || []}
      userDisplayName={userDisplayName}
      userAvatar={userAvatar}
    />
  )
}

