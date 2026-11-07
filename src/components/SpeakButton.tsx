import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { speak } from '../audio/speech'
import { unlockAudio } from '../audio/engine'
import { SpeakerIcon } from './icons'
import type { Language } from '../i18n'

/** 🔊 button: reads the given text aloud in the current language. */
export function SpeakButton({ text, size = 64, className = '' }: { text: string; size?: number; className?: string }) {
  const { t, i18n } = useTranslation()
  return (
    <motion.button
      type="button"
      aria-label={t('common.listen')}
      whileTap={{ scale: 0.85, rotate: -8 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-sky-deep text-white ${className}`}
      style={{ width: size, height: size, boxShadow: 'var(--shadow-toy)' }}
      onClick={(e) => {
        e.stopPropagation()
        unlockAudio()
        speak(text, i18n.language as Language, { slow: true })
      }}
    >
      <SpeakerIcon size={size * 0.5} />
    </motion.button>
  )
}
