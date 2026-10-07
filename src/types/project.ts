export interface Project {
  id: string
  user_id: string
  name: string
  supabase_url: string
  anon_key: string
  target_table?: string | null
  webhook_url?: string | null
  is_active: boolean
  last_ping_at: string | null
  last_ping_status: 'success' | 'failed' | 'pending' | null
  last_ping_code: number | null
  last_ping_message: string | null
  created_at: string
  updated_at: string
  ping_logs?: PingLog[]
}

export interface PingLog {
  id: number
  project_id: string
  status: 'success' | 'failed'
  status_code: number | null
  response_time_ms: number | null
  message: string | null
  created_at: string
}
