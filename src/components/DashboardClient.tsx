'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/ProjectCard'
import { AddProjectModal } from '@/components/AddProjectModal'
import { Plus, Server, Activity, ShieldAlert, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage, LanguageToggle } from '@/components/LanguageContext'

export function DashboardClient({
  initialProjects,
  userDisplayName,
  userAvatar,
}: {
  initialProjects: Project[]
  userDisplayName?: string
  userAvatar?: string
}) {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeCount = initialProjects.filter((p) => p.is_active).length

  return (
    <div className="min-h-screen bg-[#090d11] text-[#f0f6fc]">
      {/* Navbar */}
      <header className="border-b border-[#30363d] bg-[#161b22]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">
              Supapulse
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <a
              href="https://github.com/atalayhuryasar/Supapulse"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] text-xs font-medium text-neutral-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>GitHub</span>
            </a>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl border border-[#30363d] bg-[#0d1117] text-xs text-neutral-300">
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatar}
                  alt={userDisplayName || 'User'}
                  className="w-4 h-4 rounded-full border border-neutral-700 object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span className="font-medium truncate max-w-[180px]">
                {userDisplayName || 'Developer'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
              title={t.nav.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">{t.dashboard.totalProjects}</p>
              <p className="text-2xl font-bold text-white">{initialProjects.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">{t.dashboard.activePulses}</p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">{t.dashboard.pingFrequency}</p>
              <p className="text-lg font-bold text-white">{t.dashboard.pingFrequencyVal}</p>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.dashboard.title}</h1>
            <p className="text-sm text-neutral-400">
              {t.dashboard.subtitle}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-all cursor-pointer shadow-lg shadow-[#3ecf8e]/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.addProject}
          </button>
        </div>

        {/* Projects Grid or Empty State */}
        {initialProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[#30363d] bg-[#161b22]/30 flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-neutral-800/50 text-neutral-400 mb-4">
              <Server className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{t.dashboard.emptyTitle}</h3>
            <p className="text-sm text-neutral-400 max-w-sm mb-6">
              {t.dashboard.emptyDesc}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3ecf8e] text-black hover:bg-[#33b37a] transition-colors"
            >
              {t.dashboard.firstProjectBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
