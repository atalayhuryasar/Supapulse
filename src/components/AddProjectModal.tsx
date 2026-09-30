'use client'

import { useState } from 'react'
import { Plus, X, Globe, Key, Tag } from 'lucide-react'
import { createProject } from '@/app/actions/project-actions'

export function AddProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

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
      <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e]">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Yeni Proje Ekle</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" /> Proje Adı
            </label>
            <input
              type="text"
              name="name"
              placeholder="Örn: E-Ticaret API veya Yan Projem"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-400" /> Supabase Project URL
            </label>
            <input
              type="text"
              name="supabase_url"
              placeholder="https://xyzabcdefg.supabase.co"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-sm focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500 font-mono text-xs"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Project Settings -&gt; API -&gt; Project URL
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-neutral-400" /> Project Anon Public Key
            </label>
            <textarea
              name="anon_key"
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-[#3ecf8e] focus:outline-none placeholder-neutral-500 font-mono resize-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Sadece public/anon key gereklidir. Gizli anahtarınızı (service_role) ASLA paylaşmayın!
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:bg-[#21262d] transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Ekleniyor...' : 'Projeyi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
