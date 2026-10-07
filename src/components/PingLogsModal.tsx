'use client'

import { useEffect } from 'react'
import { Project, PingLog } from '@/types/project'
import { useLanguage } from '@/components/LanguageContext'
import {
  X,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  Radio,
} from 'lucide-react'

interface PingLogsModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function PingLogsModal({ project, isOpen, onClose }: PingLogsModalProps) {
  const { t, lang } = useLanguage()

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

  const logs: PingLog[] = [...(project.ping_logs || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const totalPulses = logs.length
  const successCount = logs.filter((l) => l.status === 'success').length
  const successRate =
    totalPulses > 0 ? Math.round((successCount / totalPulses) * 100) : 100

  const validLatencies = logs
    .map((l) => l.response_time_ms)
    .filter((ms): ms is number => typeof ms === 'number' && ms > 0)

  const avgLatency =
    validLatencies.length > 0
      ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
      : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t.logsModal.title}
              </h2>
              <p className="text-xs text-neutral-400 font-mono truncate max-w-md">
                {project.name} • {new URL(project.supabase_url).hostname}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#30363d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Overview Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-[#0d1117] border-b border-[#30363d]/80">
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block">{t.logsModal.totalPulses}</span>
              <span className="text-base font-bold text-white font-mono">{totalPulses}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block">{t.logsModal.successRate}</span>
              <span className="text-base font-bold text-[#3ecf8e] font-mono">
                {totalPulses > 0 ? `${successRate}%` : '100%'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d]/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block">{t.logsModal.avgLatency}</span>
              <span className="text-base font-bold text-white font-mono">
                {avgLatency !== null ? `${avgLatency}ms` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Logs Table / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-300">{t.logsModal.noLogsTitle}</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                {t.logsModal.noLogsDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const isSuccess = log.status === 'success'
                const formattedDate = new Date(log.created_at).toLocaleString(
                  lang === 'tr' ? 'tr-TR' : 'en-US',
                  {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  }
                )

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]/60 hover:border-[#30363d] transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    {/* Status & Code */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isSuccess
                            ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold font-mono ${
                              isSuccess ? 'text-[#3ecf8e]' : 'text-red-400'
                            }`}
                          >
                            {log.status_code ? `${log.status_code}` : isSuccess ? '200 OK' : 'Failed'}
                          </span>
                          <span className="text-neutral-500 text-[11px]">•</span>
                          <span className="text-neutral-400 text-[11px] font-mono">
                            {formattedDate}
                          </span>
                        </div>
                        <p className="text-neutral-300 font-mono text-[11px] truncate mt-0.5 max-w-md">
                          {log.message || (isSuccess ? 'Heartbeat pulse acknowledged' : 'Heartbeat failed')}
                        </p>
                      </div>
                    </div>

                    {/* Latency Badge */}
                    {log.response_time_ms !== null && log.response_time_ms !== undefined && (
                      <div className="shrink-0 font-mono text-[11px] px-2 py-1 rounded bg-[#161b22] border border-[#30363d] text-emerald-400">
                        ~{log.response_time_ms}ms
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-colors cursor-pointer"
          >
            {t.logsModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
