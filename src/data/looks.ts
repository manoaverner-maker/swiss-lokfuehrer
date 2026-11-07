import type { TrainLook } from '../components/trainGeometry'
import type { Train } from './schema'

/** 2D side-view look per train (placeholder until the 3D presets in Phase 2). */
const looks: Record<string, Omit<TrainLook, 'body' | 'roof' | 'stripe' | 'window'>> = {
  re460: { kind: 'loco', coaches: 0 },
  rabe501: { kind: 'emu', coaches: 0 },
  ge44ii: { kind: 'loco', boxy: true, coaches: 0 },
}

export function lookFor(train: Train, coaches?: number): TrainLook {
  const c = train.model.type === 'procedural' ? train.model.colors : {}
  const base = looks[train.id] ?? { kind: 'loco' }
  return {
    ...base,
    coaches: coaches ?? base.coaches,
    body: c.body ?? '#E30613',
    roof: c.roof ?? '#3A3D42',
    stripe: c.stripe ?? '#FFFFFF',
    window: c.window,
  }
}
