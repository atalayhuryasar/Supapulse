'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, translations } from '@/lib/i18n'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: typeof translations['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('supapulse_lang') as Language
    if (saved === 'en' || saved === 'tr') {
      queueMicrotask(() => {
        setLangState(saved)
      })
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('supapulse_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center rounded-xl bg-[#161b22] border border-[#30363d] p-0.5 text-xs">
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
          lang === 'en'
            ? 'bg-[#3ecf8e] text-black font-semibold shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('tr')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
          lang === 'tr'
            ? 'bg-[#3ecf8e] text-black font-semibold shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        TR
      </button>
    </div>
  )
}
