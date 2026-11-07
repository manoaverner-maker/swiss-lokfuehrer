import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Screen } from '../../components/Screen'
import { TrainSide } from '../../components/TrainSide'
import { trains } from '../../data/trains'
import { lookFor } from '../../data/looks'
import { operatorColors } from '../../data/operators'
import { useMode } from '../../store/profiles'
import { sfx } from '../../audio/engine'
import { speak } from '../../audio/speech'
import type { Language } from '../../i18n'

export function LexiconPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const mode = useMode()
  const lang = i18n.language as Language

  return (
    <Screen title={t('lexicon.title')}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trains.map((train, i) => {
          const op = operatorColors[train.operator]
          return (
            <motion.button
              key={train.id}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sfx.tap()
                if (mode === 'junior') speak(train.nickname ?? train.name, lang)
                navigate(`/lexicon/${train.id}`)
              }}
              className="panel flex flex-col overflow-hidden text-left"
            >
              <div className="flex h-36 items-end justify-center px-4 pb-3" style={{ background: `linear-gradient(180deg, #dff2fc, ${op.main}22)` }}>
                <TrainSide look={lookFor(train)} height={70} />
              </div>
              <div className="flex items-center gap-2 p-4">
                <span className="rounded-full px-3 py-1 text-sm font-extrabold text-white" style={{ background: op.main }}>
                  {train.operator}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-2xl font-extrabold leading-tight">{train.nickname ?? train.name}</span>
                  {mode === 'pro' && train.nickname && <span className="block text-sm font-bold opacity-70">{train.name}</span>}
                </span>
                {train.rarity !== 'common' && <span className="text-2xl">{train.rarity === 'gold' ? '🥇' : '⭐'}</span>}
              </div>
            </motion.button>
          )
        })}
      </div>
    </Screen>
  )
}
