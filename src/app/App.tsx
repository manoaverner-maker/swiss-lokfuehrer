import { lazy, Suspense, useEffect } from 'react'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import i18n from '../i18n'
import { useActiveProfile } from '../store/profiles'
import { useSettings } from '../store/settings'
import { unlockAudio } from '../audio/engine'
import { StationPage } from '../features/home/StationPage'

const LexiconPage = lazy(() => import('../features/lexicon/LexiconPage').then((m) => ({ default: m.LexiconPage })))
const TrainDetailPage = lazy(() => import('../features/lexicon/TrainDetailPage').then((m) => ({ default: m.TrainDetailPage })))
const ParentsPage = lazy(() => import('../features/parents/ParentsPage').then((m) => ({ default: m.ParentsPage })))
const ComingSoon = lazy(() => import('../features/placeholder/ComingSoon').then((m) => ({ default: m.ComingSoon })))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center text-6xl">
      <span className="animate-bounce">🚂</span>
    </div>
  )
}

/** Keeps i18n in sync with the active profile's language. */
function useLanguageSync() {
  const profile = useActiveProfile()
  const guest = useSettings((s) => s.guestLanguage)
  const lang = profile?.language ?? guest
  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
  }, [lang])
}

function Root() {
  useLanguageSync()
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </MotionConfig>
  )
}

const router = createHashRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <StationPage /> },
      { path: '/lexicon', element: <LexiconPage /> },
      { path: '/lexicon/:id', element: <TrainDetailPage /> },
      { path: '/parents', element: <ParentsPage /> },
      { path: '/map', element: <ComingSoon titleKey="tiles.map" /> },
      { path: '/games', element: <ComingSoon titleKey="tiles.games" /> },
      { path: '/album', element: <ComingSoon titleKey="tiles.album" /> },
      { path: '/license', element: <ComingSoon titleKey="tiles.license" /> },
      { path: '/knowledge', element: <ComingSoon titleKey="tiles.knowledge" /> },
      { path: '*', element: <StationPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
