'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import {
  Activity,
  Play,
  Trash2,
  Power,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit3,
  Shield,
  History,
  Bell,
  Check,
} from 'lucide-react'
import { toggleProjectActive, deleteProject } from '@/app/actions/project-actions'
import { useLanguage } from '@/components/LanguageContext'
import { EditProjectModal } from '@/components/EditProjectModal'
import { PingLogsModal } from '@/components/PingLogsModal'

export function ProjectCard({ project }: { project: Project }) {
  const { t, lang } = useLanguage()
  const [pinging, setPinging] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project>(project)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [copiedBadge, setCopiedBadge] = useState(false)

  const handleTestPing = async () => {
    try {
      setPinging(true)
      const res = await fetch(`/api/projects/${currentProject.id}/ping`, {
        method: 'POST',
      })
      const data = await res.json()

      const newLog = {
        id: Date.now(),
        project_id: currentProject.id,
        status: data.success ? ('success' as const) : ('failed' as const),
        status_code: data.statusCode,
        response_time_ms: data.responseTimeMs,
        message: data.message,
        created_at: new Date().toISOString(),
      }

      setCurrentProject((prev) => ({
        ...prev,
        last_ping_at: new Date().toISOString(),
        last_ping_status: data.success ? 'success' : 'failed',
        last_ping_code: data.statusCode,
        last_ping_message: data.message,
        ping_logs: [...(prev.ping_logs || []), newLog],
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setPinging(false)
    }
  }

  const handleToggle = async () => {
    try {
      setToggling(true)
      const nextState = !currentProject.is_active
      await toggleProjectActive(currentProject.id, currentProject.is_active)
      setCurrentProject((prev) => ({ ...prev, is_active: nextState }))
    } catch (err) {
      console.error('Toggle error:', err)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(t.card.deleteConfirm)) {
      try {
        setDeleting(true)
        await deleteProject(currentProject.id)
      } catch (err) {
        console.error('Delete error:', err)
        setDeleting(false)
      }
    }
  }

  const handleCopyBadge = () => {
    const originUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://supapulse.huryasar.com'
    const badgeMarkdown = `[![Supapulse Status](${originUrl}/api/projects/${currentProject.id}/badge)](${originUrl})`
    navigator.clipboard.writeText(badgeMarkdown)
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2000)
  }

  return (
    <>
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#3ecf8e]/50 transition-all flex flex-col justify-between group shadow-lg hover:shadow-xl hover:shadow-[#3ecf8e]/5 gap-5">
        {/* Top Header: Title, URL, Tags and Primary State Controls */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon & Project Info */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div
              className={`p-3 rounded-xl border shrink-0 transition-colors mt-0.5 ${
                currentProject.is_active
                  ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/30 text-[#3ecf8e]'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}
            >
              <Activity className={`w-5 h-5 ${currentProject.is_active && 'group-hover:animate-pulse'}`} />
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="font-bold text-white text-lg leading-snug break-words"
                title={currentProject.name}
              >
                {currentProject.name}
              </h3>

              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                <a
                  href={currentProject.supabase_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-400 hover:text-[#3ecf8e] inline-flex items-center gap-1 max-w-full group/link transition-colors"
                >
                  <span className="truncate">{new URL(currentProject.supabase_url).hostname}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/link:opacity-100" />
                </a>

                {currentProject.target_table && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#21262d] border border-[#30363d] text-neutral-300 font-mono">
                    table: {currentProject.target_table}
                  </span>
                )}

                {currentProject.webhook_url && (
                  <span
                    title={t.card.webhookActive}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono flex items-center gap-1"
                  >
                    <Bell className="w-2.5 h-2.5" /> alerts active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Power Toggle & Delete */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pill & Power Button */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              title={currentProject.is_active ? t.card.pauseTooltip : t.card.resumeTooltip}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                currentProject.is_active
                  ? 'border-[#3ecf8e]/40 bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e]/20 hover:border-[#3ecf8e] shadow-[0_0_10px_rgba(62,207,142,0.2)]'
                  : 'border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:border-[#3ecf8e]/50 hover:bg-[#3ecf8e]/10 hover:text-[#3ecf8e]'
              } disabled:opacity-50`}
            >
              <Power className={`w-3.5 h-3.5 ${toggling ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {currentProject.is_active ? 'Active' : 'Paused'}
              </span>
            </button>

            {/* Quick Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              title={t.card.deleteTooltip}
              className="p-2 rounded-xl border border-neutral-700 hover:border-red-500/60 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.25)] transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${deleting ? 'animate-pulse text-red-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Middle Status Box */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d]/60 space-y-3">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-neutral-400" /> {t.card.lastPulse}:
              </span>
              <span className="font-mono text-neutral-200 truncate">
                {currentProject.last_ping_at
                  ? new Date(currentProject.last_ping_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : t.card.noPingYet}
              </span>
            </div>

            <div className="flex items-center sm:justify-end gap-2">
              <span className="text-neutral-400 shrink-0">{t.card.status}</span>
              {currentProject.last_ping_status === 'success' && (
                <span className="flex items-center gap-1.5 text-[#3ecf8e] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t.card.activeSuccess}
                </span>
              )}
              {currentProject.last_ping_status === 'failed' && (
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> {t.card.failed}
                </span>
              )}
              {!currentProject.last_ping_status && (
                <span className="text-neutral-500">{t.card.pending}</span>
              )}
            </div>
          </div>

          {/* Last Ping Message Box */}
          {currentProject.last_ping_message && (
            <div className="text-xs font-mono text-neutral-300 bg-neutral-900/80 px-3 py-2 rounded-lg border border-neutral-800 break-words leading-relaxed">
              {currentProject.last_ping_message}
            </div>
          )}

          {/* Uptime & Latency History Bars */}
          {currentProject.ping_logs && currentProject.ping_logs.length > 0 && (() => {
            const logs = [...currentProject.ping_logs]
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .slice(-10)

            const validLatencies = logs
              .map((l) => l.response_time_ms)
              .filter((ms): ms is number => typeof ms === 'number' && ms > 0)

            const avgMs =
              validLatencies.length > 0
                ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
                : null

            return (
              <div
                onClick={() => setIsLogsOpen(true)}
                title={t.card.logsTooltip}
                className="pt-2 border-t border-[#30363d]/40 cursor-pointer group/history transition-opacity hover:opacity-95"
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span className="group-hover/history:text-neutral-200 transition-colors flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    {t.card.uptimeHistory}
                  </span>
                  {avgMs !== null && (
                    <span className="font-mono text-emerald-400 font-medium">
                      ~{avgMs}ms {t.card.avgLatency}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 h-6">
                  {logs.map((log, idx) => {
                    const isSuccess = log.status === 'success'
                    return (
                      <div
                        key={log.id || idx}
                        title={`${new Date(log.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US')}: ${
                          isSuccess
                            ? `${t.card.activeSuccess} (${log.response_time_ms || 0}ms)`
                            : `${t.card.failed}: ${log.message || 'Error'}`
                        }`}
                        className={`flex-1 h-5 rounded-md transition-all hover:scale-110 ${
                          isSuccess
                            ? 'bg-[#3ecf8e] hover:bg-[#33b37a] shadow-[0_0_8px_rgba(62,207,142,0.25)]'
                            : 'bg-red-500 hover:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Bottom Action Bar: Spacious & Balanced */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#30363d]/50">
          {/* Secondary Actions: Tool Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Logs Inspection Action */}
            <button
              onClick={() => setIsLogsOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.card.logsBtn}</span>
            </button>

            {/* Status Badge Copy Action */}
            <button
              onClick={handleCopyBadge}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {copiedBadge ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  <span className="text-[#3ecf8e] font-semibold">{t.card.badgeCopied}</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#3ecf8e]" />
                  <span>{t.card.badgeBtn}</span>
                </>
              )}
            </button>

            {/* Edit Project Action */}
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.card.editBtn}</span>
            </button>
          </div>

          {/* Primary Action: Test Pulse / Ping Now */}
          <button
            onClick={handleTestPing}
            disabled={pinging || !currentProject.is_active}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-[#3ecf8e] hover:bg-[#33b37a] text-[#0d1117] transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_12px_rgba(62,207,142,0.25)] ml-auto sm:ml-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${pinging && 'animate-spin'}`} />
            <span>{pinging ? t.card.testing : t.card.testPulseBtn}</span>
          </button>
        </div>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={currentProject}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProjectUpdated={(updated) => setCurrentProject(updated)}
      />

      {/* Ping Logs Modal */}
      <PingLogsModal
        project={currentProject}
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </>
  )
}
