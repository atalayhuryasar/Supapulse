'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturum açmanız gerekiyor' }
  }

  const name = formData.get('name') as string
  let supabase_url = (formData.get('supabase_url') as string)?.trim()
  const anon_key = (formData.get('anon_key') as string)?.trim()
  const target_table = (formData.get('target_table') as string)?.trim().replace(/^\/+/, '') || null

  if (!name || !supabase_url || !anon_key) {
    return { error: 'Lütfen tüm alanları doldurun' }
  }

  if (!supabase_url.startsWith('http://') && !supabase_url.startsWith('https://')) {
    supabase_url = `https://${supabase_url}`
  }

  const payload: Record<string, unknown> = {
    user_id: user.id,
    name,
    supabase_url,
    anon_key,
    is_active: true,
  }
  if (target_table) {
    payload.target_table = target_table
  }

  let { error } = await supabase.from('projects').insert(payload)

  // Gracefully fallback if target_table column does not exist yet on DB
  if (error && error.message?.includes('target_table')) {
    delete payload.target_table
    const retry = await supabase.from('projects').insert(payload)
    error = retry.error
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleProjectActive(id: string, currentState: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ is_active: !currentState })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
