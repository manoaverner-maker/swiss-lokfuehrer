/** Parametric description of a train for the 3D construction kit. Units ≈ metres. */

export type Nose =
  | { kind: 'flat'; radius?: number }
  | { kind: 'round'; len: number; lean?: number }
  | { kind: 'slope'; len: number }
  | { kind: 'wedge'; len: number }

export type WindowRow = { y: number; h: number }

export type CarSpec = {
  length: number
  height: number
  /** body underside above rail top */
  floor: number
  front?: Nose
  rear?: Nose
  /** bogie centres along the car (x, 0 = car centre). */
  bogies: { x: number; axles?: 2 | 3; wheelR?: number }[]
  pantos?: { x: number; mirrored?: boolean }[]
  windows?: { rows: WindowRow[]; x0: number; x1: number; w: number; gap: number }
  /** windscreen on the nose curve, between these heights */
  windscreen?: { y0: number; y1: number }
  cabSideWindow?: boolean
  doors?: { xs: number[]; w: number; h?: number; y?: number }
  stripes?: { y: number; h: number; color?: 'stripe' | 'accent' | 'roof' | string }[]
  /** colour the front part of the body ("cap"), e.g. a red nose */
  cap?: { len: number; color: 'stripe' | 'nose' | string }
  grilles?: { y: number; h: number; count: number; x0: number; x1: number }
  roofBoxes?: { x: number; l: number; w: number; h: number }[]
  lamps?: { low: number; top: number; spread?: number }
  skirt?: boolean
}

export type TrainColors = {
  body: string
  roof: string
  stripe: string
  window?: string
  nose?: string
  accent?: string
  door?: string
}

export type TrainPreset = {
  gauge: 'standard' | 'meter' | 'narrow'
  cars: CarSpec[]
  /** special builds that use their own geometry */
  special?: 'krokodil' | 'rack'
  /** typical cruising speed in the viewer (m/s of the scrolling track) */
  cruise?: number
}

export const gaugeWidth = { standard: 1.435, meter: 1.0, narrow: 0.8 } as const
