import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ToyButton } from './ToyButton'
import { LocoIcon } from './icons'

/** Always-present big "back to the station" button (loco symbol). */
export function HomeButton({ to = '/' }: { to?: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <ToyButton aria-label={t('common.back')} sound="back" className="!px-3 text-rail" color="#fff" textColor="#E30613" onClick={() => navigate(to)}>
      <span className="text-white">
        <LocoIcon size={44} color="#E30613" />
      </span>
    </ToyButton>
  )
}
