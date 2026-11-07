import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Train } from '../../data/schema'
import { TrainSide } from '../../components/TrainSide'
import { lookFor } from '../../data/looks'
import { playTrainSound, sfx, unlockAudio } from '../../audio/engine'
import { speak } from '../../audio/speech'
import { useMode } from '../../store/profiles'
import type { Language } from '../../i18n'
import type { TrainColors } from '../../three/kit/types'

const TrainViewer = lazy(() => import('../../three/TrainViewer'))

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function ControlButton({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl px-2 font-display text-xs font-bold leading-tight ${active ? 'bg-anthracite text-white' : 'bg-white/90 text-anthracite'}`}
      style={{ boxShadow: 'var(--shadow-toy)' }}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="hidden sm:block">{label}</span>
    </motion.button>
  )
}

export function Viewer3DPanel({ train, accent }: { train: Train; accent: string }) {
  const { t, i18n } = useTranslation()
  const mode = useMode()
  const lang = i18n.language as Language
  const [state, setState] = useState({ driving: false, pantoUp: true, lightsOn: true })
  const [canWebgl] = useState(webglAvailable)
  const model = train.model
  const isElectric = !!train.specs.electrification

  const act = (label: string, fn: () => void) => {
    unlockAudio()
    if (mode === 'junior') speak(label, lang)
    fn()
  }

  if (model.type !== 'procedural' || !canWebgl) {
    return (
      <div className="flex h-full items-center justify-center overflow-x-auto p-6">
        <TrainSide look={lookFor(train)} height={130} />
      </div>
    )
  }
  const colors = model.colors as unknown as TrainColors

  return (
    <div className="relative h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <TrainSide look={lookFor(train)} height={90} moving />
            <span className="font-display text-lg font-bold opacity-60">{t('viewer.loading')}</span>
          </div>
        }
      >
        <TrainViewer presetId={model.preset} colors={colors} state={state} />
      </Suspense>
      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/80 px-3 py-1 text-sm font-bold">👆 {t('viewer.hint')}</span>
      <div className="absolute right-3 bottom-3 left-3 flex flex-wrap justify-center gap-2">
        {isElectric && <ControlButton icon="⚡" label={t('viewer.panto')} active={state.pantoUp} onClick={() => act(t('viewer.panto'), () => { sfx.pop(); setState((s) => ({ ...s, pantoUp: !s.pantoUp })) })} />}
        <ControlButton icon="💡" label={t('viewer.lights')} active={state.lightsOn} onClick={() => act(t('viewer.lights'), () => { sfx.tap(); setState((s) => ({ ...s, lightsOn: !s.lightsOn })) })} />
        <ControlButton
          icon={state.driving ? '⏹️' : '▶️'}
          label={state.driving ? t('viewer.stop') : t('viewer.drive')}
          active={state.driving}
          onClick={() =>
            act(state.driving ? t('viewer.stop') : t('viewer.drive'), () => {
              if (!state.driving) {
                if (isElectric && !state.pantoUp) setState((s) => ({ ...s, pantoUp: true }))
                sfx.motorStart()
              }
              setState((s) => ({ ...s, driving: !s.driving }))
            })
          }
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.85, rotate: -10 }}
          aria-label={t('viewer.horn')}
          onClick={() => {
            unlockAudio()
            playTrainSound(train.sound)
          }}
          className="flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl px-2 font-display text-xs font-bold text-white"
          style={{ background: accent, boxShadow: 'var(--shadow-toy)' }}
        >
          <span className="text-2xl leading-none">📢</span>
          <span className="hidden sm:block">{t('viewer.horn')}</span>
        </motion.button>
      </div>
    </div>
  )
}
