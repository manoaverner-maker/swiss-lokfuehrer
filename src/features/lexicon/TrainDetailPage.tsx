import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Screen } from '../../components/Screen'
import { SpeakButton } from '../../components/SpeakButton'
import { ToyButton } from '../../components/ToyButton'
import { TrainSide } from '../../components/TrainSide'
import { trainById } from '../../data/trains'
import { lookFor } from '../../data/looks'
import { operatorColors } from '../../data/operators'
import { useMode } from '../../store/profiles'
import type { Language } from '../../i18n'
import type { Train } from '../../data/schema'

const fmt = (n: number, lang: Language) => n.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA')

function specRows(train: Train, lang: Language, t: (k: string) => string) {
  const s = train.specs
  const rows: { key: string; field: string; value: string; icon: string }[] = [
    { key: 'operator', field: 'operator', value: `${train.operator} · ${operatorColors[train.operator].fullName}`, icon: '🏢' },
    { key: 'category', field: 'category', value: t(`lexicon.category.${train.category}`), icon: '🚆' },
    { key: 'gauge', field: 'gauge', value: t(`lexicon.gauge.${train.gauge}`), icon: '🛤️' },
  ]
  if (train.manufacturer) rows.push({ key: 'manufacturer', field: 'manufacturer', value: train.manufacturer, icon: '🏭' })
  rows.push({ key: 'inService', field: 'inService.from', value: String(train.inService.from), icon: '📅' })
  if (train.numberBuilt) rows.push({ key: 'numberBuilt', field: 'numberBuilt', value: fmt(train.numberBuilt, lang), icon: '🔢' })
  if (s.maxSpeedKmh) rows.push({ key: 'maxSpeed', field: 'specs.maxSpeedKmh', value: `${fmt(s.maxSpeedKmh, lang)} km/h`, icon: '⚡' })
  if (s.powerKw) rows.push({ key: 'power', field: 'specs.powerKw', value: `${fmt(s.powerKw, lang)} kW (${fmt(Math.round(s.powerKw * 1.36), lang)} PS/hp)`, icon: '💪' })
  if (s.weightT) rows.push({ key: 'weight', field: 'specs.weightT', value: `${fmt(s.weightT, lang)} t`, icon: '⚖️' })
  if (s.lengthM) rows.push({ key: 'length', field: 'specs.lengthM', value: `${fmt(s.lengthM, lang)} m`, icon: '📏' })
  if (s.seats) rows.push({ key: 'seats', field: 'specs.seats', value: fmt(s.seats, lang), icon: '💺' })
  if (s.electrification) rows.push({ key: 'electrification', field: 'specs.electrification', value: s.electrification, icon: '🔌' })
  return rows
}

export function TrainDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const mode = useMode()
  const lang = i18n.language as Language
  const train = trainById(id)
  if (!train) return <Navigate to="/lexicon" replace />

  const op = operatorColors[train.operator]
  const desc = train.description[lang][mode === 'junior' ? 'junior' : 'pro']
  const facts = train.funFacts.filter((f) => mode === 'pro' || f.junior).slice(0, mode === 'junior' ? 2 : 5)
  const title = train.nickname ?? train.name
  const unverified = new Set(train.verified ? [] : train.unverifiedFields ?? [])

  return (
    <Screen title={title} speakText={`${title}. ${desc}`} back="/lexicon">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="panel flex flex-col items-center gap-3 overflow-hidden p-5"
          style={{ background: `linear-gradient(180deg,#ffffff, ${op.main}1f)` }}
        >
          <div className="w-full overflow-x-auto">
            <div className="mx-auto w-max py-4">
              <TrainSide look={lookFor(train)} height={130} />
            </div>
          </div>
          <div className="flex w-full items-center gap-3">
            <p className="flex-1 text-xl font-semibold sm:text-2xl">{desc}</p>
            <SpeakButton text={desc} />
          </div>
          <div className="flex gap-3">
            <ToyButton sound="horn" color="#fff" textColor={op.main}>
              📢 {t('lexicon.horn')}
            </ToyButton>
          </div>
        </motion.div>

        {/* photos: placeholders until Phase 2 */}
        <section>
          <h2 className="mb-2 text-2xl font-extrabold">📷 {t('lexicon.photos')}</h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {train.images.map((img, i) => (
              <figure key={i} className="panel w-64 shrink-0 snap-start overflow-hidden">
                <div className="flex h-40 items-center justify-center text-5xl" style={{ background: `repeating-linear-gradient(45deg, ${op.main}18 0 14px, #ffffff 14px 28px)` }}>
                  {img.placeholder ? '🖼️' : <img src={img.file} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <figcaption className="p-2 text-xs opacity-70">{img.placeholder ? t('lexicon.photoSoon') : `© ${img.author} · ${img.license}`}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-extrabold">🗂️ {t('lexicon.specs')}</h2>
          <div className={`grid gap-3 ${mode === 'junior' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {specRows(train, lang, t)
              .filter((r) => mode === 'pro' || ['maxSpeed', 'weight', 'length', 'gauge'].includes(r.key))
              .map((r) => (
                <div key={r.key} className="panel flex items-center gap-3 p-3">
                  <span className="text-3xl">{r.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold opacity-60">{t(`lexicon.fields.${r.key}`)}</span>
                    <span className="block font-display text-xl font-extrabold">{r.value}</span>
                    {unverified.has(r.field) && mode === 'pro' && (
                      <span className="mt-0.5 inline-block rounded-full bg-gold/30 px-2 text-xs font-bold">⚠ {t('lexicon.unverified')}</span>
                    )}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-extrabold">💡 {t('lexicon.funFacts')}</h2>
          <div className="flex flex-col gap-3">
            {facts.map((f, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * i }} className="panel flex items-center gap-3 p-4">
                <span className="flex-1 text-lg font-semibold">{f[lang]}</span>
                <SpeakButton text={f[lang]} size={56} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  )
}
