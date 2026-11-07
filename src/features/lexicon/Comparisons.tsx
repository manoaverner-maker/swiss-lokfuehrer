import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Train } from '../../data/schema'
import { trains } from '../../data/trains'
import { operatorColors } from '../../data/operators'
import { useMode } from '../../store/profiles'
import { SpeakButton } from '../../components/SpeakButton'

// Approximate reference values (rounded on purpose, shown as "about").
const refs = [
  { key: 'Runner', emoji: '🏃', kmh: 12 },
  { key: 'Bike', emoji: '🚲', kmh: 20 },
  { key: 'Car', emoji: '🚗', kmh: 100 },
  { key: 'Cheetah', emoji: '🐆', kmh: 110 },
  { key: 'Plane', emoji: '✈️', kmh: 260 },
] as const
const ELEPHANT_T = 6
const SCHOOL_BUS_M = 12

function Bar({ value, max, color, label, emoji, highlight }: { value: number; max: number; color: string; label: string; emoji: string; highlight?: boolean }) {
  return (
    <div className="flex items-end gap-2">
      <span className="w-8 pb-0.5 text-center text-2xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className={`mb-0.5 truncate text-sm ${highlight ? 'font-extrabold' : 'font-bold opacity-75'}`}>{label}</div>
        <div className="h-4 overflow-hidden rounded-full bg-black/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(3, (value / max) * 100)}%` }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function Icons({ emoji, count }: { emoji: string; count: number }) {
  const whole = Math.floor(count)
  const half = count - whole >= 0.5
  if (whole > 24) return <span className="text-4xl">{emoji} × {Math.round(count)}</span>
  return (
    <div className="flex flex-wrap gap-1 text-3xl">
      {Array.from({ length: whole }, (_, i) => (
        <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}>
          {emoji}
        </motion.span>
      ))}
      {half && <span className="inline-block w-[0.6em] overflow-hidden">{emoji}</span>}
    </div>
  )
}

export function Comparisons({ train }: { train: Train }) {
  const { t } = useTranslation()
  const mode = useMode()
  const accent = operatorColors[train.operator].main
  const s = train.specs
  const speed = s.maxSpeedKmh

  let speedSentence = ''
  let speedRefs: (typeof refs)[number][] = []
  if (speed) {
    const below = refs.filter((r) => r.kmh <= speed * 0.95)
    const above = refs.find((r) => r.kmh > speed * 1.05)
    const near = refs.find((r) => Math.abs(r.kmh - speed) <= speed * 0.05)
    const thing = (k: string) => t(`compare.thing${k}`)
    if (near) speedSentence = t('compare.asFastAs', { thing: thing(near.key) })
    else if (below.length) speedSentence = t('compare.fasterThan', { thing: thing(below[below.length - 1].key) })
    else if (above) speedSentence = t('compare.slowerThan', { thing: thing(above.key) })
    speedRefs = [...below.slice(-2), ...(near ? [near] : []), ...(above ? [above] : [])]
  }
  const maxSpeed = Math.max(speed ?? 0, ...speedRefs.map((r) => r.kmh))
  const half = (v: number) => (v >= 10 ? Math.round(v) : Math.round(v * 2) / 2)
  const elephants = s.weightT ? half(s.weightT / ELEPHANT_T) : 0
  const buses = s.lengthM ? half(s.lengthM / SCHOOL_BUS_M) : 0
  const others = trains.filter((x) => x.specs.maxSpeedKmh).sort((a, b) => (b.specs.maxSpeedKmh ?? 0) - (a.specs.maxSpeedKmh ?? 0))
  const fastest = others[0]?.specs.maxSpeedKmh ?? 1

  return (
    <div className="flex flex-col gap-4">
      {speed && (
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="flex-1 text-xl font-extrabold">⚡ {t('compare.speedTitle')}{t('common.colon')}{speed} km/h</h3>
            <SpeakButton text={speedSentence} size={52} />
          </div>
          <p className="mb-3 text-lg font-bold">{speedSentence}</p>
          <div className="flex flex-col gap-2">
            {[...speedRefs, { key: 'train', emoji: '🚆', kmh: speed }]
              .sort((a, b) => a.kmh - b.kmh)
              .map((r) => (
                <Bar
                  key={r.key}
                  emoji={r.emoji}
                  value={r.kmh}
                  max={maxSpeed}
                  highlight={r.key === 'train'}
                  color={r.key === 'train' ? accent : '#9fb3c4'}
                  label={`${r.key === 'train' ? train.nickname ?? train.name : t(`compare.${r.key.toLowerCase()}`)} · ${r.key === 'train' ? '' : '~'}${r.kmh} km/h`}
                />
              ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {elephants > 0 && (
          <div className="panel p-4">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="flex-1 text-xl font-extrabold">⚖️ {t('compare.weightTitle')}{t('common.colon')}{s.weightT} t</h3>
              <SpeakButton text={t('compare.elephants', { count: elephants })} size={52} />
            </div>
            <Icons emoji="🐘" count={elephants} />
            <p className="mt-2 font-bold">{t('compare.elephants', { count: elephants })}</p>
          </div>
        )}
        {buses > 0 && (
          <div className="panel p-4">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="flex-1 text-xl font-extrabold">📏 {t('compare.lengthTitle')}{t('common.colon')}{s.lengthM} m</h3>
              <SpeakButton text={t('compare.buses', { count: buses })} size={52} />
            </div>
            <Icons emoji="🚌" count={buses} />
            <p className="mt-2 font-bold">{t('compare.buses', { count: buses })}</p>
          </div>
        )}
      </div>

      {mode === 'pro' && speed && (
        <div className="panel p-4">
          <h3 className="mb-3 text-xl font-extrabold">🏁 {t('compare.otherTrains')}</h3>
          <div className="flex flex-col gap-1.5">
            {others.map((o) => (
              <Bar
                key={o.id}
                emoji={o.id === train.id ? '👉' : ''}
                value={o.specs.maxSpeedKmh ?? 0}
                max={fastest}
                highlight={o.id === train.id}
                color={o.id === train.id ? accent : '#9fb3c4'}
                label={`${o.nickname ?? o.name} · ${o.specs.maxSpeedKmh} km/h`}
              />
            ))}
          </div>
        </div>
      )}
      <p className="text-xs opacity-60">{t('compare.approx')}</p>
    </div>
  )
}
