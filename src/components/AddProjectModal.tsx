'use client'

import { useState } from 'react'
import { Plus, X, Globe, Key, Tag, Database, ShieldCheck, Copy, Check, Sparkles } from 'lucide-react'
import { createProject } from '@/app/actions/project-actions'
import { useLanguage } from '@/components/LanguageContext'

export function AddProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSql, setCopiedSql] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  if (!isOpen) return null

  const handleCopySql = (e: React.MouseEvent) => {
    e.preventDefault()
    const sql = `create or replace function public.supapulse_heartbeat()
returns text language sql security definer as $$ select 'pulse_ok'; $$;
grant execute on function public.supapulse_heartbeat() to anon, authenticated;`
    navigator.clipboard.writeText(sql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.preventDefault()
    const prompt = `You are an expert full-stack engineer and Supabase specialist.
Configure this project for Supapulse keep-alive by following these steps:

1. Create and execute this dedicated heartbeat RPC function in Supabase:
CREATE OR REPLACE FUNCTION public.supapulse_heartbeat()
RETURNS text LANGUAGE sql SECURITY DEFINER AS $$ SELECT 'pulse_ok'; $$;
GRANT EXECUTE ON FUNCTION public.supapulse_heartbeat() TO anon, authenticated;

2. Inspect local env files (.env, .env.local) to find:
- Project URL (NEXT_PUBLIC_SUPABASE_URL)
- Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
(NEVER share or expose the service_role secret key)

3. Provide the URL and Anon Key so I can paste them into Supapulse (https://supapulse.huryasar.com).`
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await createProject(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t.modal.addTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Pro Security & Heartbeat RPC Guide Box */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#0e1713] border border-[#3ecf8e]/25 text-neutral-300 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-[#3ecf8e] font-medium text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t.modal.proSecurityTitle}</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {t.modal.proSecurityDesc}
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a2e24] hover:bg-[#244233] border border-[#3ecf8e]/30 text-[#3ecf8e] text-[11px] font-medium transition-colors cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? t.modal.sqlCopied : t.modal.copySqlBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-neutral-700 text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#3ecf8e]" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedPrompt ? t.modal.agentPromptCopied : t.modal.copyAgentPromptBtn}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" /> {t.modal.nameLabel}
            </label>
            <input
              type="text"
              name="name"
              placeholder={t.modal.namePlaceholder}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-400" /> {t.modal.urlLabel}
            </label>
            <input
              type="text"
              name="supabase_url"
              placeholder={t.modal.urlPlaceholder}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500 font-mono text-xs"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              {t.modal.urlHint}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neutral-400" /> {t.modal.keyLabel}
            </label>
            <textarea
              name="anon_key"
              rows={3}
              placeholder={t.modal.keyPlaceholder}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500 font-mono resize-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              {t.modal.keyHint}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-400" /> {t.modal.targetTableLabel}
            </label>
            <input
              type="text"
              name="target_table"
              placeholder={t.modal.targetTablePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500 font-mono text-xs"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              {t.modal.targetTableHint}
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:bg-[#21262d] transition-colors"
            >
              {t.modal.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-colors disabled:opacity-50"
            >
              {loading ? t.modal.saving : t.modal.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
