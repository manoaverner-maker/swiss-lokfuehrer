export type TrainLook = {
  kind: 'loco' | 'emu'
  boxy?: boolean
  body: string
  roof: string
  stripe: string
  window?: string
  coaches?: number
  coachBody?: string
  coachStripe?: string
}

export const H = 100
export const LOCO_W = 190
export const COACH_W = 230
export const EMU_HEAD_W = 250
export const EMU_CAR_W = 220
export const GAP = 8

export function trainWidth(look: TrainLook) {
  const n = look.coaches ?? 0
  if (look.kind === 'loco') return LOCO_W + n * (COACH_W + GAP)
  return EMU_HEAD_W + n * (EMU_CAR_W + GAP)
}

