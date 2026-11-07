import { createContext, useContext, type MutableRefObject } from 'react'

/** Shared animation state of one train: distance travelled, pantograph and light state. */
export type TrainAnim = {
  distance: MutableRefObject<number>
  speed: MutableRefObject<number>
  panto: MutableRefObject<number> // 0 = down, 1 = up (smoothed)
  lights: MutableRefObject<number> // 0..1 (smoothed)
}

export const TrainAnimContext = createContext<TrainAnim | null>(null)

export function useTrainAnim(): TrainAnim {
  const ctx = useContext(TrainAnimContext)
  if (!ctx) throw new Error('useTrainAnim outside a train')
  return ctx
}
