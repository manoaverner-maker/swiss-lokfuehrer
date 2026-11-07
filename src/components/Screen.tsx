import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { HomeButton } from './HomeButton'
import { SpeakButton } from './SpeakButton'
import { LanguageToggle } from './LanguageToggle'

/** Standard page frame: home button, title with 🔊, language switch. */
export function Screen({ title, speakText, children, back = '/', background }: { title: string; speakText?: string; children: ReactNode; back?: string; background?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex min-h-full flex-col"
      style={{ background: background ?? 'linear-gradient(180deg,#bfe6fb 0%,#fff4e6 60%)' }}
    >
      <header className="safe-pad flex items-center gap-3 pb-3" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <HomeButton to={back} />
        <h1 className="min-w-0 flex-1 truncate text-3xl font-extrabold text-anthracite sm:text-4xl">{title}</h1>
        <SpeakButton text={speakText ?? title} />
        <LanguageToggle className="hidden sm:flex" />
      </header>
      <main className="safe-pad flex-1 pb-8">{children}</main>
    </motion.div>
  )
}
