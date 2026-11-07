import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { languages, type Language } from '../i18n'
import { useProfiles } from '../store/profiles'
import { useSettings } from '../store/settings'
import { sfx, unlockAudio } from '../audio/engine'

const labels: Record<Language, string> = { en: 'EN', fr: 'FR' }

/** EN | FR switch. Saves the language in the active profile (or as guest language). */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const activeId = useProfiles((s) => s.activeId)
  const update = useProfiles((s) => s.update)
  const setSettings = useSettings((s) => s.set)
  const current = i18n.language as Language

  const choose = (lang: Language) => {
    unlockAudio()
    sfx.pop()
    if (activeId) update(activeId, { language: lang })
    else setSettings({ guestLanguage: lang })
  }

  return (
    <div role="group" aria-label={t('common.language')} className={`flex rounded-full bg-white/90 p-1 ${className}`} style={{ boxShadow: 'var(--shadow-toy)' }}>
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          aria-pressed={current === lang}
          onClick={() => choose(lang)}
          className="relative h-14 min-w-14 rounded-full px-3 font-display text-xl font-extrabold"
        >
          {current === lang && (
            <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-rail" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          )}
          <span className={`relative ${current === lang ? 'text-white' : 'text-anthracite'}`}>{labels[lang]}</span>
        </button>
      ))}
    </div>
  )
}
