'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { updateProject, testWebhookAction } from '@/app/actions/project-actions'
import { useLanguage } from '@/components/LanguageContext'
import {
  X,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Bell,
  Shield,
  Copy,
  Check,
  Send,
  Database,
  Globe,
  Key,
} from 'lucide-react'

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onProjectUpdated: (updatedProject: Project) => void
}

export function EditProjectModal({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const { t } = useLanguage()

  const [name, setName] = useState(project.name)
  const [supabaseUrl, setSupabaseUrl] = useState(project.supabase_url)
  const [anonKey, setAnonKey] = useState(project.anon_key)
  const [targetTable, setTargetTable] = useState(project.target_table || '')
  const [webhookUrl, setWebhookUrl] = useState(project.webhook_url || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [testingWebhook, setTestingWebhook] = useState(false)
  const [webhookTestStatus, setWebhookTestStatus] = useState<{
    success?: boolean
    message?: string
  } | null>(null)

  const [copiedBadge, setCopiedBadge] = useState(false)

  // Sync state when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(project.name)
      setSupabaseUrl(project.supabase_url)
      setAnonKey(project.anon_key)
      setTargetTable(project.target_table || '')
      setWebhookUrl(project.webhook_url || '')
      setError(null)
      setWebhookTestStatus(null)
    }
  }, [isOpen, project])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const originUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://supapulse.huryasar.com'
  const badgeMarkdown = `[![Supapulse Status](${originUrl}/api/projects/${project.id}/badge)](${originUrl})`

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(badgeMarkdown)
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) return
    setTestingWebhook(true)
    setWebhookTestStatus(null)
    try {
      const res = await testWebhookAction(webhookUrl.trim(), name || project.name)
      if (res.success) {
        setWebhookTestStatus({ success: true, message: t.editModal.testSuccess })
      } else {
        setWebhookTestStatus({
          success: false,
          message: res.error || t.editModal.testFailed,
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      setWebhookTestStatus({ success: false, message: error.message || t.editModal.testFailed })
    } finally {
      setTestingWebhook(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('id', project.id)
    formData.append('name', name)
    formData.append('supabase_url', supabaseUrl)
    formData.append('anon_key', anonKey)
    if (targetTable.trim()) {
      formData.append('target_table', targetTable.trim())
    }
    if (webhookUrl.trim()) {
      formData.append('webhook_url', webhookUrl.trim())
    }

    try {
      const res = await updateProject(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        onProjectUpdated({
          ...project,
          name,
          supabase_url: supabaseUrl,
          anon_key: anonKey,
          target_table: targetTable.trim() || null,
          webhook_url: webhookUrl.trim() || null,
        })
        onClose()
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Error updating project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t.editModal.editTitle}</h2>
              <p className="text-xs text-neutral-400 font-mono truncate max-w-xs">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              {t.editModal.nameLabel} <span className="text-[#3ecf8e]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-[#3ecf8e] transition-colors"
            />
          </div>

          {/* Supabase URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              {t.editModal.urlLabel} <span className="text-[#3ecf8e]">*</span>
            </label>
            <input
              type="text"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm font-mono focus:outline-none focus:border-[#3ecf8e] transition-colors"
            />
          </div>

          {/* Anon Public Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neutral-400" />
              {t.editModal.keyLabel} <span className="text-[#3ecf8e]">*</span>
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm font-mono focus:outline-none focus:border-[#3ecf8e] transition-colors"
            />
          </div>

          {/* Target Table */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              {t.editModal.targetTableLabel}
            </label>
            <input
              type="text"
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
              placeholder={t.editModal.targetTablePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm font-mono focus:outline-none focus:border-[#3ecf8e] transition-colors"
            />
            <p className="text-[11px] text-neutral-400">{t.editModal.targetTableHint}</p>
          </div>

          {/* Webhook Alert Section */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d]/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-yellow-400" />
                {t.editModal.webhookLabel}
              </label>
              {webhookUrl && (
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !webhookUrl.trim()}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-3 h-3 ${testingWebhook && 'animate-spin'}`} />
                  {testingWebhook ? t.editModal.testingWebhook : t.editModal.testWebhookBtn}
                </button>
              )}
            </div>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={t.editModal.webhookPlaceholder}
              className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-[#3ecf8e] transition-colors"
            />
            <p className="text-[11px] text-neutral-400">{t.editModal.webhookHint}</p>

            {webhookTestStatus && (
              <div
                className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 border ${
                  webhookTestStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {webhookTestStatus.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{webhookTestStatus.message}</span>
              </div>
            )}
          </div>

          {/* Dynamic Status Badge Code Section */}
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d]/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#3ecf8e]" />
                {t.editModal.statusBadgeTitle}
              </span>
              <button
                type="button"
                onClick={handleCopyBadge}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#21262d] hover:bg-[#30363d] text-neutral-200 border border-[#30363d] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedBadge ? (
                  <>
                    <Check className="w-3 h-3 text-[#3ecf8e]" />
                    <span className="text-[#3ecf8e]">{t.editModal.badgeCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.editModal.copyBadgeBtn}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">{t.editModal.statusBadgeHint}</p>
            <div className="flex items-center gap-3 pt-1">
              {/* Badge Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/projects/${project.id}/badge`}
                alt="Badge Preview"
                className="h-5 shrink-0"
              />
              <code className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-1 rounded border border-neutral-800 font-mono truncate flex-1">
                {badgeMarkdown}
              </code>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#30363d]/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
            >
              {t.editModal.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#3ecf8e] hover:bg-[#33b37a] text-[#0d1117] transition-all shadow-[0_0_15px_rgba(62,207,142,0.25)] cursor-pointer disabled:opacity-50"
            >
              {loading ? t.editModal.saving : t.editModal.saveChangesBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
