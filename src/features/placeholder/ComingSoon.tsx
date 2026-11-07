import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Screen } from '../../components/Screen'
import { TrainSide } from '../../components/TrainSide'

/** Friendly placeholder for areas that come in later phases. */
export function ComingSoon({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()
  const title = t(titleKey)
  return (
    <Screen title={title} speakText={`${title}. ${t('common.comingSoon')}`}>
      <div className="flex flex-col items-center gap-6 pt-6 text-center">
        <motion.div animate={{ x: [-20, 20, -20] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <TrainSide look={{ kind: 'loco', boxy: true, body: '#F2A900', roof: '#3A3D42', stripe: '#2D3036', coaches: 0 }} height={110} moving />
        </motion.div>
        <div className="h-3 w-full max-w-xl rounded bg-[repeating-linear-gradient(90deg,#F2A900_0_24px,#2D3036_24px_48px)]" />
        <h2 className="text-3xl font-extrabold">🚧 {t('common.comingSoon')}</h2>
        <p className="text-xl">{t('common.comingSoonSub')}</p>
      </div>
    </Screen>
  )
}
