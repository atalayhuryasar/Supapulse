'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { Activity, Play, Trash2, Power, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import { toggleProjectActive, deleteProject } from '@/app/actions/project-actions'
import { useLanguage } from '@/components/LanguageContext'

export function ProjectCard({ project }: { project: Project }) {
  const { t, lang } = useLanguage()
  const [pinging, setPinging] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project>(project)

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

  return (
    <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#3ecf8e]/50 transition-all flex flex-col justify-between group overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                currentProject.is_active
                  ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/30 text-[#3ecf8e]'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}
            >
              <Activity className={`w-5 h-5 ${currentProject.is_active && 'group-hover:animate-pulse'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-base leading-snug truncate" title={currentProject.name}>
                {currentProject.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <a
                  href={currentProject.supabase_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-neutral-400 hover:text-[#3ecf8e] inline-flex items-center gap-1 max-w-full group/link"
                >
                  <span className="truncate">{new URL(currentProject.supabase_url).hostname}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/link:opacity-100" />
                </a>
                {currentProject.target_table && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-neutral-300 font-mono">
                    table: {currentProject.target_table}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleToggle}
              disabled={toggling}
              title={currentProject.is_active ? t.card.pauseTooltip : t.card.resumeTooltip}
              className={`p-2 rounded-xl border text-xs transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center ${
                currentProject.is_active
                  ? 'border-[#3ecf8e]/40 bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e]/20 hover:border-[#3ecf8e] hover:shadow-[0_0_12px_rgba(62,207,142,0.35)]'
                  : 'border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:border-[#3ecf8e]/50 hover:bg-[#3ecf8e]/10 hover:text-[#3ecf8e]'
              } disabled:opacity-50`}
            >
              <Power className={`w-4 h-4 transition-transform ${toggling ? 'animate-spin' : 'hover:scale-110'}`} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title={t.card.deleteTooltip}
              className="p-2 rounded-xl border border-neutral-700 hover:border-red-500/60 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.25)] transition-all duration-200 cursor-pointer active:scale-90 flex items-center justify-center disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${deleting ? 'animate-pulse text-red-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="my-4 p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {t.card.lastPulse}
            </span>
            <span className="font-mono text-neutral-300">
              {currentProject.last_ping_at
                ? new Date(currentProject.last_ping_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : t.card.noPingYet}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">{t.card.status}</span>
            {currentProject.last_ping_status === 'success' && (
              <span className="flex items-center gap-1 text-[#3ecf8e] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.card.activeSuccess}
              </span>
            )}
            {currentProject.last_ping_status === 'failed' && (
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <XCircle className="w-3.5 h-3.5" /> {t.card.failed}
              </span>
            )}
            {!currentProject.last_ping_status && (
              <span className="text-neutral-500">{t.card.pending}</span>
            )}
          </div>

          {currentProject.last_ping_message && (
            <div className="text-[11px] font-mono text-neutral-400 truncate bg-neutral-900/60 p-1.5 rounded border border-neutral-800">
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
              <div className="pt-2 border-t border-[#30363d]/40">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                  <span>{t.card.uptimeHistory}</span>
                  {avgMs !== null && (
                    <span className="font-mono text-emerald-400">
                      ~{avgMs}ms {t.card.avgLatency}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 h-6">
                  {logs.map((log, idx) => {
                    const isSuccess = log.status === 'success'
                    return (
                      <div
                        key={log.id || idx}
                        title={`${new Date(log.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US')}: ${
                          isSuccess ? `${t.card.activeSuccess} (${log.response_time_ms || 0}ms)` : `${t.card.failed}: ${log.message || 'Error'}`
                        }`}
                        className={`flex-1 h-5 rounded transition-all hover:scale-110 cursor-pointer ${
                          isSuccess
                            ? 'bg-[#3ecf8e] hover:bg-[#33b37a] shadow-[0_0_8px_rgba(62,207,142,0.3)]'
                            : 'bg-red-500 hover:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleTestPing}
          disabled={pinging || !currentProject.is_active}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] hover:border-neutral-500 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${pinging && 'animate-spin'}`} />
          {pinging ? t.card.testing : t.card.testPulseBtn}
        </button>
      </div>
    </div>
  )
}
