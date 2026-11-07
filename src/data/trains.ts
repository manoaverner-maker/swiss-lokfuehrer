import type { Train } from './schema'

// Data is validated with Zod by scripts/validate-data.ts during `npm run build`,
// so the app itself does not ship the validator.
const files = import.meta.glob<{ default: Train }>('./trains/*.json', { eager: true })

export const trains: Train[] = Object.values(files)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name))

export const trainById = (id: string) => trains.find((t) => t.id === id)
