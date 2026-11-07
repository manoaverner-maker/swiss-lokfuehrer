import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './safeStorage'
import { personal } from '../config/personal'
import type { Language } from '../i18n'

export type Mode = 'junior' | 'pro'

export const capColors = ['#E30613', '#2A5DA8', '#5BA145', '#F2A900', '#8E44AD', '#2D3036'] as const

export type Progress = {
  stars: number
  cards: string[]
  discovered: string[]
  km: number
}

export type Profile = {
  id: string
  name: string
  mode: Mode
  language: Language
  cap: string
  progress: Progress
}

const emptyProgress = (): Progress => ({ stars: 0, cards: [], discovered: [], km: 0 })

const newId = () => Math.random().toString(36).slice(2, 10)

const seedProfiles = (): Profile[] =>
  personal.kids.map((kid, i) => ({
    id: newId(),
    name: kid.name,
    mode: kid.defaultMode,
    language: personal.defaultLanguage,
    cap: capColors[i % capColors.length],
    progress: emptyProgress(),
  }))

type ProfilesState = {
  profiles: Profile[]
  activeId: string | null
  select: (id: string | null) => void
  add: (p: Omit<Profile, 'id' | 'progress'>) => string
  update: (id: string, patch: Partial<Omit<Profile, 'id' | 'progress'>>) => void
  remove: (id: string) => void
  resetProgress: (id: string) => void
  updateProgress: (id: string, fn: (p: Progress) => Progress) => void
}

export const useProfiles = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: seedProfiles(),
      activeId: null,
      select: (id) => set({ activeId: id }),
      add: (p) => {
        const id = newId()
        set((s) => ({ profiles: [...s.profiles, { ...p, id, progress: emptyProgress() }] }))
        return id
      },
      update: (id, patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      remove: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      resetProgress: (id) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, progress: emptyProgress() } : p)) })),
      updateProgress: (id, fn) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, progress: fn(p.progress) } : p)) })),
    }),
    { name: 'lokfuehrer.profiles', version: 1, storage: safeStorage },
  ),
)

export const useActiveProfile = () =>
  useProfiles((s) => s.profiles.find((p) => p.id === s.activeId) ?? null)

/** Mode of the active profile; "junior" when nobody is signed in (safest for the 6-year-old). */
export const useMode = (): Mode => useActiveProfile()?.mode ?? 'junior'
