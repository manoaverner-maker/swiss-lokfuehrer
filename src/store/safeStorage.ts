import { createJSONStorage, type StateStorage } from 'zustand/middleware'

// localStorage can be missing or throw (private mode, blocked storage). The app must keep working.
const memory = new Map<string, string>()

const raw: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name) ?? memory.get(name) ?? null
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem: (name, value) => {
    memory.set(name, value)
    try {
      window.localStorage.setItem(name, value)
    } catch {
      /* ignore, memory copy is enough */
    }
  },
  removeItem: (name) => {
    memory.delete(name)
    try {
      window.localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

export const safeStorage = createJSONStorage(() => raw)
