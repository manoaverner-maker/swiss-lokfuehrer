import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './safeStorage'
import { personal } from '../config/personal'
import type { Language } from '../i18n'

type SettingsState = {
  volume: number // 0..1
  soundOn: boolean
  musicOn: boolean
  speechOn: boolean
  /** Language used while no profile is selected */
  guestLanguage: Language
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      volume: 0.8,
      soundOn: true,
      musicOn: false,
      speechOn: true,
      guestLanguage: personal.defaultLanguage,
      set: (patch) => set(patch),
    }),
    { name: 'lokfuehrer.settings', version: 1, storage: safeStorage },
  ),
)
