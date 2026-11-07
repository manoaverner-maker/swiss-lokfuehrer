import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Screen } from '../../components/Screen'
import { SpeakButton } from '../../components/SpeakButton'
import { trains } from '../../data/trains'
import { operatorColors } from '../../data/operators'
import type { Train } from '../../data/schema'
import { useMode } from '../../store/profiles'
import { sfx } from '../../audio/engine'
import { speak } from '../../audio/speech'
import type { Language } from '../../i18n'

const url = (p: string) => `${import.meta.env.BASE_URL}${p}`

type Filters = { operator?: string; category?: string; gauge?: string; era?: string }

const categoryIcon: Record<string, string> = { locomotive: '🚂', multiple_unit: '🚆', rack_railway: '⛰️', shunter: '🔧', historic: '🕰️', composition: '🚃' }
const gaugeIcon: Record<string, string> = { standard: '🛤️', meter: '🏔️', other: '🧗' }
const eraIcon: Record<string, string> = { historic: '🕰️', classic: '⭐', modern: '🚀' }

function Chip({ active, onClick, children, color, label }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string; label: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex h-14 shrink-0 items-center gap-2 rounded-full border-4 px-4 font-display text-lg font-bold ${active ? 'border-anthracite bg-white' : 'border-transparent bg-white/70'}`}
    >
      {color && <span className="h-5 w-5 rounded-full" style={{ background: color }} />}
      {children}
    </motion.button>
  )
}

export function LexiconPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const mode = useMode()
  const lang = i18n.language as Language
  const [f, setF] = useState<Filters>({})

  const values = useMemo(
    () => ({
      operator: [...new Set(trains.map((x) => x.operator))],
      category: [...new Set(trains.map((x) => x.category))],
      gauge: [...new Set(trains.map((x) => x.gauge))],
      era: [...new Set(trains.map((x) => x.era))],
    }),
    [],
  )
  const shown = trains.filter((x) => (Object.keys(f) as (keyof Filters)[]).every((k) => !f[k] || x[k] === f[k]))

  const toggle = (k: keyof Filters, v: string, label: string) => {
    sfx.pop()
    if (mode === 'junior') speak(label, lang)
    setF((cur) => ({ ...cur, [k]: cur[k] === v ? undefined : v }))
  }

  const groups: { key: keyof Filters; label: string; render: (v: string) => { icon: React.ReactNode; text: string; color?: string } }[] = [
    { key: 'operator', label: t('filters.operator'), render: (v) => ({ icon: null, text: v, color: operatorColors[v as Train['operator']].main }) },
    { key: 'category', label: t('filters.category'), render: (v) => ({ icon: categoryIcon[v], text: t(`lexicon.category.${v}`) }) },
    { key: 'gauge', label: t('filters.gauge'), render: (v) => ({ icon: gaugeIcon[v], text: t(`lexicon.gauge.${v}`) }) },
    { key: 'era', label: t('filters.era'), render: (v) => ({ icon: eraIcon[v], text: t(`lexicon.era.${v}`) }) },
  ]

  return (
    <Screen title={t('lexicon.title')}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          {groups.filter((g) => mode === 'pro' || g.key === 'operator' || g.key === 'category').map((g) => (
            <div key={g.key} className="flex items-center gap-2 overflow-x-auto pb-1">
              {mode === 'pro' && <span className="w-24 shrink-0 text-sm font-extrabold opacity-60">{g.label}</span>}
              {values[g.key].map((v) => {
                const r = g.render(v)
                return (
                  <Chip key={v} active={f[g.key] === v} onClick={() => toggle(g.key, v, r.text)} color={r.color} label={r.text}>
                    {r.icon && <span className="text-2xl">{r.icon}</span>}
                    {(mode === 'pro' || g.key === 'operator') && <span>{r.text}</span>}
                  </Chip>
                )
              })}
            </div>
          ))}
          {Object.values(f).some(Boolean) && (
            <button type="button" onClick={() => { sfx.back(); setF({}) }} className="self-start rounded-full bg-anthracite px-4 py-2 font-display font-bold text-white">
              ✕ {t('filters.reset')}
            </button>
          )}
        </div>

        {shown.length === 0 && (
          <div className="flex items-center justify-center gap-3 py-10 text-xl font-bold">
            🤷 {t('filters.none')} <SpeakButton text={t('filters.none')} size={52} />
          </div>
        )}

        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {shown.map((train, i) => {
              const op = operatorColors[train.operator]
              const photo = train.images.find((im) => !im.placeholder)
              return (
                <motion.button
                  key={train.id}
                  layout
                  type="button"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: Math.min(i, 8) * 0.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sfx.tap()
                    if (mode === 'junior') speak(train.nickname ?? train.name, lang)
                    navigate(`/lexicon/${train.id}`)
                  }}
                  className="panel flex flex-col overflow-hidden text-left"
                >
                  <div className="relative h-40 w-full" style={{ background: `linear-gradient(180deg,#dff2fc, ${op.main}22)` }}>
                    {photo && <img src={url(photo.thumb ?? photo.file)} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    {train.rarity !== 'common' && (
                      <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xl">{train.rarity === 'gold' ? '🥇' : '⭐'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    <span className="rounded-full px-3 py-1 text-sm font-extrabold text-white" style={{ background: op.main }}>
                      {train.operator}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-2xl leading-tight font-extrabold">{train.nickname ?? train.name}</span>
                      {mode === 'pro' && (
                        <span className="block text-sm font-bold opacity-70">
                          {train.nickname ? `${train.name} · ` : ''}
                          {train.specs.maxSpeedKmh ? `${train.specs.maxSpeedKmh} km/h` : ''}
                        </span>
                      )}
                    </span>
                    <span className="text-2xl" aria-hidden="true">
                      {categoryIcon[train.category]}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </Screen>
  )
}
