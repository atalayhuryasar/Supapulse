'use client'

import Link from 'next/link'
import { Activity, Shield, Zap, ArrowRight, Heart, Star, GitFork, BookOpen } from 'lucide-react'
import { useLanguage, LanguageToggle } from '@/components/LanguageContext'

function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#090d11] text-[#f0f6fc] flex flex-col justify-between selection:bg-[#3ecf8e]/30 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-[#30363d]/50 bg-[#161b22]/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">
              Supapulse
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20 hidden sm:inline-block">
              {t.nav.openSourceBadge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <a
              href="https://github.com/atalayhuryasar/Supapulse"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-xs font-medium text-neutral-300 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>{t.nav.starOnGithub}</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 ml-0.5" />
            </a>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium px-4 py-2 rounded-xl bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-all shadow-md shadow-[#3ecf8e]/20"
            >
              {t.nav.dashboard}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-20 sm:py-24 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#3ecf8e] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-ping" />
          {t.hero.badge}
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent leading-tight">
          {t.hero.title1} <br />
          <span className="text-[#3ecf8e]">{t.hero.titleHighlight}</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-[#3ecf8e] hover:bg-[#33b37a] text-black transition-all shadow-xl shadow-[#3ecf8e]/20 text-sm"
          >
            {t.hero.ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/atalayhuryasar/Supapulse"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] transition-all text-sm"
          >
            <GithubIcon className="w-4 h-4" />
            {t.hero.ctaGithub}
          </a>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#161b22]/50 border border-[#30363d] relative overflow-hidden group hover:border-[#3ecf8e]/50 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 text-[#3ecf8e] mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">{t.features.feature1Title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.features.feature1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22]/50 border border-[#30363d] relative overflow-hidden group hover:border-[#3ecf8e]/50 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">{t.features.feature2Title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.features.feature2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161b22]/50 border border-[#30363d] relative overflow-hidden group hover:border-[#3ecf8e]/50 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">{t.features.feature3Title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.features.feature3Desc}
            </p>
          </div>
        </div>

        {/* Self-Host Promo Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#161b22]/30 border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-2 text-white font-medium text-sm mb-1">
              <BookOpen className="w-4 h-4 text-[#3ecf8e]" />
              {t.selfHost.title}
            </div>
            <p className="text-xs text-neutral-400">
              {t.selfHost.desc}
            </p>
          </div>
          <a
            href="https://github.com/atalayhuryasar/Supapulse#deploy-with-vercel"
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-white transition-colors"
          >
            {t.selfHost.btn}
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d]/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>{t.footer.builtWith}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
            {t.footer.by && <span>{t.footer.by}</span>}
            <a
              href="https://github.com/atalayhuryasar"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-300 hover:text-white font-medium underline underline-offset-2"
            >
              Atalay Hüryaşar
            </a>
            <span>{t.footer.andContributors}</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/atalayhuryasar/Supapulse"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              {t.footer.github}
            </a>
            <a
              href="https://github.com/atalayhuryasar/Supapulse/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              {t.footer.license}
            </a>
            <a
              href="https://github.com/atalayhuryasar/Supapulse/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <GitFork className="w-3.5 h-3.5" />
              {t.footer.contribute}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
