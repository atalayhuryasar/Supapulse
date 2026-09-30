'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { Activity, Play, Trash2, Power, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import { toggleProjectActive, deleteProject } from '@/app/actions/project-actions'
import { useLanguage } from '@/components/LanguageContext'

export function ProjectCard({ project }: { project: Project }) {
  const { t, lang } = useLanguage()
  const [pinging, setPinging] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project>(project)

  const handleTestPing = async () => {
    try {
      setPinging(true)
      const res = await fetch(`/api/projects/${currentProject.id}/ping`, {
        method: 'POST',
      })
      const data = await res.json()

      setCurrentProject((prev) => ({
        ...prev,
        last_ping_at: new Date().toISOString(),
        last_ping_status: data.success ? 'success' : 'failed',
        last_ping_code: data.statusCode,
        last_ping_message: data.message,
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setPinging(false)
    }
  }

  const handleToggle = async () => {
    await toggleProjectActive(currentProject.id, currentProject.is_active)
    setCurrentProject((prev) => ({ ...prev, is_active: !prev.is_active }))
  }

  const handleDelete = async () => {
    if (confirm(t.card.deleteConfirm)) {
      await deleteProject(currentProject.id)
    }
  }

  return (
    <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#3ecf8e]/50 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                currentProject.is_active
                  ? 'bg-[#3ecf8e]/10 border-[#3ecf8e]/30 text-[#3ecf8e]'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}
            >
              <Activity className={`w-5 h-5 ${currentProject.is_active && 'group-hover:animate-pulse'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-snug">
                {currentProject.name}
              </h3>
              <a
                href={currentProject.supabase_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-[#3ecf8e] flex items-center gap-1 mt-0.5"
              >
                {new URL(currentProject.supabase_url).hostname}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggle}
              title={currentProject.is_active ? t.card.pauseTooltip : t.card.resumeTooltip}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                currentProject.is_active
                  ? 'border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-[#3ecf8e]'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-400'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title={t.card.deleteTooltip}
              className="p-1.5 rounded-lg border border-neutral-700 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
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
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleTestPing}
          disabled={pinging || !currentProject.is_active}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${pinging && 'animate-spin'}`} />
          {pinging ? t.card.testing : t.card.testPulseBtn}
        </button>
      </div>
    </div>
  )
}
