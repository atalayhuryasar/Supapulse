'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/ProjectCard'
import { AddProjectModal } from '@/components/AddProjectModal'
import { Plus, Server, Activity, ShieldAlert, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DashboardClient({
  initialProjects,
  userEmail,
}: {
  initialProjects: Project[]
  userEmail?: string
}) {
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

          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400 hidden sm:inline-block">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
              title="Çıkış Yap"
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
              <p className="text-xs text-neutral-400 font-medium">Toplam Proje</p>
              <p className="text-2xl font-bold text-white">{initialProjects.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Aktif Nabızlar</p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Ping Sıklığı</p>
              <p className="text-lg font-bold text-white">Her 3 Günde 1</p>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">İzlenen Projeler</h1>
            <p className="text-sm text-neutral-400">
              Kayıtlı projeleriniz otomatik olarak uyanık tutulur.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-all cursor-pointer shadow-lg shadow-[#3ecf8e]/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Proje Ekle
          </button>
        </div>

        {/* Projects Grid or Empty State */}
        {initialProjects.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[#30363d] bg-[#161b22]/30 flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-neutral-800/50 text-neutral-400 mb-4">
              <Server className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Henüz proje eklenmedi</h3>
            <p className="text-sm text-neutral-400 max-w-sm mb-6">
              Supabase ücretsiz projenizi ekleyerek 7 gün sonra duraklatılmasını otomatik olarak engelleyin.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3ecf8e] text-black hover:bg-[#33b37a] transition-colors"
            >
              İlk Projeyi Ekle
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
