import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Landscape } from './Landscape'
import { ArrivingTrain } from './ArrivingTrain'
import { StationClock } from './StationClock'
import { ProfileEditor, type ProfileDraft } from './ProfileEditor'
import { CapAvatar } from '../../components/CapAvatar'
import { LanguageToggle } from '../../components/LanguageToggle'
import { Modal } from '../../components/Modal'
import { SpeakButton } from '../../components/SpeakButton'
import { GearIcon } from '../../components/icons'
import { useActiveProfile, useProfiles, capColors } from '../../store/profiles'
import { sfx, unlockAudio } from '../../audio/engine'
import { speak } from '../../audio/speech'
import type { Language } from '../../i18n'

const tiles = [
  { key: 'map', emoji: '🗺️', to: '/map', color: '#2A86C8' },
  { key: 'lexicon', emoji: '🚆', to: '/lexicon', color: '#E30613' },
  { key: 'games', emoji: '🎮', to: '/games', color: '#4CAF50' },
  { key: 'album', emoji: '🃏', to: '/album', color: '#F2A900' },
  { key: 'license', emoji: '🪪', to: '/license', color: '#8E44AD' },
  { key: 'knowledge', emoji: '📚', to: '/knowledge', color: '#FF7A45' },
] as const

function useStageHeight() {
  const [h, setH] = useState(() => (typeof window === 'undefined' ? 300 : calc()))
  function calc() {
    const portrait = window.innerHeight > window.innerWidth
    return Math.round(Math.min(Math.max(window.innerHeight * (portrait ? 0.4 : 0.36), 210), 440))
  }
  useEffect(() => {
    const on = () => setH(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return h
}

export function StationPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const profiles = useProfiles((s) => s.profiles)
  const select = useProfiles((s) => s.select)
  const add = useProfiles((s) => s.add)
  const [creating, setCreating] = useState(false)
  const stageH = useStageHeight()
  const trainH = Math.round(stageH * 0.34)
  const lang = i18n.language as Language
  const greeted = useRef<string | null>(null)

  const greet = (name: string, language: Language) => {
    const text = i18n.getFixedT(language)('station.greeting', { name })
    speak(text, language)
  }

  useEffect(() => {
    if (!profile) greeted.current = null
  }, [profile])

  const pick = (id: string) => {
    unlockAudio()
    sfx.horn()
    const p = profiles.find((x) => x.id === id)
    select(id)
    if (p && greeted.current !== id) {
      greeted.current = id
      greet(p.name, p.language)
    }
  }

  const create = (d: ProfileDraft) => {
    const id = add(d)
    setCreating(false)
    select(id)
    greeted.current = id
    greet(d.name, d.language)
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div className="relative">
      <Landscape />

      {/* top bar */}
      <div className="safe-pad relative z-10 flex items-center gap-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        {profile ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              sfx.back()
              select(null)
            }}
            className="flex h-16 min-w-0 items-center gap-2 rounded-full bg-white/90 pr-4 pl-1"
            style={{ boxShadow: 'var(--shadow-toy)' }}
            aria-label={t('station.switchDriver')}
          >
            <CapAvatar color={profile.cap} size={56} />
            <span className="max-w-[4.5rem] truncate font-display text-xl font-extrabold sm:max-w-[10rem]">{profile.name}</span>
          </motion.button>
        ) : (
          <div />
        )}
        <div className="flex-1" />
        <LanguageToggle className="shrink-0" />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          aria-label={t('parents.title')}
          onClick={() => navigate('/parents')}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-anthracite/70"
        >
          <GearIcon />
        </motion.button>
      </div>

      {/* stage: clock + platform + train */}
      <div className="relative z-0 shrink-0" style={{ height: stageH }}>
        <div className="absolute flex flex-col items-center" style={{ right: '8%', top: 4 }}>
          <StationClock size={Math.round(stageH * 0.36)} />
          <div className="h-10 w-2 rounded bg-anthracite" />
        </div>
        <div className="absolute inset-x-0 bottom-0" style={{ height: trainH * 0.35 }}>
          <div className="absolute inset-x-0 bottom-0 h-full bg-[#8d8f94]" />
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#5b5e63]" />
          <div className="absolute inset-x-0 bottom-[30%] h-1 bg-[#b9a27e]" />
        </div>
        <div className="absolute inset-x-0" style={{ bottom: trainH * 0.25 }}>
          <ArrivingTrain height={trainH} />
        </div>
      </div>
      </div>

      {/* platform with content */}
      <div className="relative z-10 flex-1 bg-[#e9e3d6] pt-2 pb-6" style={{ boxShadow: 'inset 0 6px 0 #fbfcfd' }}>
        <div className="safe-pad">
          <AnimatePresence mode="wait">
            {!profile ? (
              <motion.section key="pick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-4xl">
                <div className="mb-3 flex items-center justify-center gap-3">
                  <h1 className="text-center text-3xl font-extrabold sm:text-4xl">{t('station.whoIsDriving')}</h1>
                  <SpeakButton text={t('station.whoIsDriving')} size={56} />
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {profiles.map((p, i) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i, type: 'spring', stiffness: 260, damping: 14 }}
                      whileTap={{ scale: 0.9, rotate: -4 }}
                      whileHover={{ y: -4 }}
                      onClick={() => pick(p.id)}
                      className="panel flex w-40 flex-col items-center gap-1 p-3 sm:w-44"
                    >
                      <CapAvatar color={p.cap} size={104} />
                      <span className="w-full truncate font-display text-2xl font-extrabold">{p.name}</span>
                      <span className="rounded-full bg-black/5 px-3 text-sm font-bold">
                        {p.mode === 'junior' ? '🧸' : '🏆'} {t(`profile.${p.mode}`)} · {p.language.toUpperCase()}
                      </span>
                    </motion.button>
                  ))}
                  <motion.button
                    type="button"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * profiles.length, type: 'spring', stiffness: 260, damping: 14 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      sfx.pop()
                      setCreating(true)
                    }}
                    className="flex w-40 flex-col items-center justify-center gap-2 rounded-[var(--radius-blob)] border-4 border-dashed border-anthracite/30 p-3 sm:w-44"
                  >
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-6xl font-bold text-anthracite/50">+</span>
                    <span className="font-display text-lg font-bold">{t('station.newDriver')}</span>
                  </motion.button>
                </div>
              </motion.section>
            ) : (
              <motion.section key="tiles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-5xl">
                <div className="mb-3 flex items-center justify-center gap-3">
                  <h1 className="text-center text-2xl font-extrabold sm:text-4xl">{t('station.greeting', { name: profile.name })}</h1>
                  <SpeakButton text={t('station.greeting', { name: profile.name })} size={56} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {tiles.map((tile, i) => (
                    <motion.button
                      key={tile.key}
                      type="button"
                      initial={{ scale: 0, rotate: -6 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.06 * i, type: 'spring', stiffness: 260, damping: 15 }}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        unlockAudio()
                        sfx.tap()
                        if (profile.mode === 'junior') speak(t(`tiles.${tile.key}`), lang)
                        navigate(tile.to)
                      }}
                      className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-[var(--radius-blob)] p-3 text-white sm:min-h-36"
                      style={{ background: tile.color, boxShadow: 'var(--shadow-toy)' }}
                    >
                      <motion.span className="text-5xl sm:text-6xl" aria-hidden="true" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}>
                        {tile.emoji}
                      </motion.span>
                      <span className="font-display text-xl font-extrabold drop-shadow sm:text-2xl">{t(`tiles.${tile.key}`)}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)}>
        <ProfileEditor
          initial={{ name: '', mode: 'junior', language: lang, cap: capColors[profiles.length % capColors.length] }}
          onSave={create}
          onCancel={() => setCreating(false)}
        />
      </Modal>
    </div>
  )
}
