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
  const webhook_url = (formData.get('webhook_url') as string)?.trim() || null

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
  if (webhook_url) {
    payload.webhook_url = webhook_url
  }

  let { error } = await supabase.from('projects').insert(payload)

  // Gracefully fallback if target_table or webhook_url column does not exist yet on DB
  if (error && (error.message?.includes('target_table') || error.message?.includes('webhook_url'))) {
    if (error.message?.includes('webhook_url')) delete payload.webhook_url
    if (error.message?.includes('target_table')) delete payload.target_table
    const retry = await supabase.from('projects').insert(payload)
    error = retry.error
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturum açmanız gerekiyor' }
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  let supabase_url = (formData.get('supabase_url') as string)?.trim()
  const anon_key = (formData.get('anon_key') as string)?.trim()
  const target_table = (formData.get('target_table') as string)?.trim().replace(/^\/+/, '') || null
  const webhook_url = (formData.get('webhook_url') as string)?.trim() || null

  if (!id || !name || !supabase_url || !anon_key) {
    return { error: 'Lütfen tüm gerekli alanları doldurun' }
  }

  if (!supabase_url.startsWith('http://') && !supabase_url.startsWith('https://')) {
    supabase_url = `https://${supabase_url}`
  }

  const updateData: Record<string, unknown> = {
    name,
    supabase_url,
    anon_key,
    target_table,
    webhook_url,
  }

  let { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  // Gracefully handle if webhook_url or target_table columns are not yet migrated
  if (error && (error.message?.includes('webhook_url') || error.message?.includes('target_table'))) {
    if (error.message?.includes('webhook_url')) delete updateData.webhook_url
    if (error.message?.includes('target_table')) delete updateData.target_table
    const retry = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
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

export async function testWebhookAction(webhookUrl: string, projectName: string) {
  const { sendTestWebhook } = await import('@/lib/webhook')
  return await sendTestWebhook(webhookUrl, projectName)
}
