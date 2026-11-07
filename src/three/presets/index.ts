import type { CarSpec, TrainPreset } from '../kit/types'

/*
 * Each train is a preset of the construction kit. Dimensions in metres, roughly to scale.
 * Long trains show the head car plus one more car.
 */

const locoLamps = { low: 0.55, top: 2.55 }

const re460: TrainPreset = {
  gauge: 'standard',
  cruise: 9,
  cars: [
    {
      length: 18.5,
      height: 2.85,
      floor: 1.3,
      front: { kind: 'round', len: 1.7, lean: 0.4 },
      rear: { kind: 'round', len: 1.7, lean: 0.4 },
      windscreen: { y0: 1.4, y1: 2.55 },
      cabSideWindow: true,
      bogies: [{ x: 5.5, wheelR: 0.55 }, { x: -5.5, wheelR: 0.55 }],
      pantos: [{ x: 3.4 }, { x: -3.4, mirrored: true }],
      grilles: { y: 1.05, h: 1.0, count: 7, x0: -4.6, x1: 4.6 },
      roofBoxes: [{ x: 0, l: 3.6, w: 1.6, h: 0.35 }],
      stripes: [{ y: 0.12, h: 0.12, color: 'roof' }],
      lamps: locoLamps,
    },
  ],
}

const re420: TrainPreset = {
  gauge: 'standard',
  cruise: 7,
  cars: [
    {
      length: 15.4,
      height: 2.75,
      floor: 1.3,
      front: { kind: 'flat', radius: 0.4 },
      rear: { kind: 'flat', radius: 0.4 },
      windscreen: { y0: 1.5, y1: 2.35 },
      cabSideWindow: true,
      bogies: [{ x: 4.1, wheelR: 0.52 }, { x: -4.1, wheelR: 0.52 }],
      pantos: [{ x: 2.9 }, { x: -2.9, mirrored: true }],
      grilles: { y: 1.1, h: 0.9, count: 5, x0: -3.6, x1: 3.6 },
      roofBoxes: [{ x: 0, l: 2.6, w: 1.4, h: 0.3 }],
      lamps: { low: 0.5, top: 2.5 },
    },
  ],
}

const ae66: TrainPreset = {
  gauge: 'standard',
  cruise: 6,
  cars: [
    {
      length: 18.4,
      height: 2.8,
      floor: 1.35,
      front: { kind: 'round', len: 1.0, lean: 0.3 },
      rear: { kind: 'round', len: 1.0, lean: 0.3 },
      windscreen: { y0: 1.5, y1: 2.45 },
      cabSideWindow: true,
      bogies: [{ x: 5.4, axles: 3, wheelR: 0.6 }, { x: -5.4, axles: 3, wheelR: 0.6 }],
      pantos: [{ x: 3.3 }, { x: -3.3, mirrored: true }],
      grilles: { y: 1.15, h: 0.85, count: 8, x0: -5.2, x1: 5.2 },
      stripes: [
        { y: 0.32, h: 0.07, color: 'stripe' },
        { y: 0.58, h: 0.07, color: 'stripe' },
      ],
      roofBoxes: [{ x: 0, l: 4, w: 1.5, h: 0.32 }],
      lamps: { low: 0.55, top: 2.55 },
    },
  ],
}

const ge44ii: TrainPreset = {
  gauge: 'meter',
  cruise: 6,
  cars: [
    {
      length: 12.96,
      height: 2.55,
      floor: 1.1,
      front: { kind: 'flat', radius: 0.3 },
      rear: { kind: 'flat', radius: 0.3 },
      windscreen: { y0: 1.35, y1: 2.2 },
      cabSideWindow: true,
      bogies: [{ x: 3.3, wheelR: 0.5 }, { x: -3.3, wheelR: 0.5 }],
      pantos: [{ x: 2.2 }, { x: -2.2, mirrored: true }],
      grilles: { y: 0.95, h: 0.8, count: 4, x0: -2.8, x1: 2.8 },
      stripes: [{ y: 0.15, h: 0.12, color: 'stripe' }],
      lamps: { low: 0.45, top: 2.35, spread: 0.85 },
    },
  ],
}

const giruno: TrainPreset = {
  gauge: 'standard',
  cruise: 12,
  cars: [
    {
      length: 26,
      height: 3.3,
      floor: 0.95,
      front: { kind: 'slope', len: 7 },
      rear: { kind: 'flat', radius: 0.25 },
      cap: { len: 5.2, color: 'stripe' },
      windscreen: { y0: 1.55, y1: 2.55 },
      windows: { rows: [{ y: 1.25, h: 1.0 }], x0: -12, x1: 6.5, w: 1.75, gap: 0.3 },
      doors: { xs: [-10.3, 5.8], w: 1.3, h: 2.25, y: 0.1 },
      stripes: [{ y: 0.5, h: 0.22, color: 'stripe' }],
      bogies: [{ x: 9.2, wheelR: 0.42 }, { x: -9.4, wheelR: 0.42 }],
      lamps: { low: 0.7, top: 2.8 },
    },
    {
      length: 19,
      height: 3.3,
      floor: 0.95,
      front: { kind: 'flat', radius: 0.25 },
      rear: { kind: 'flat', radius: 0.25 },
      windows: { rows: [{ y: 1.25, h: 1.0 }], x0: -8.8, x1: 8.8, w: 1.75, gap: 0.3 },
      doors: { xs: [7.4], w: 1.3, h: 2.25, y: 0.1 },
      stripes: [{ y: 0.5, h: 0.22, color: 'stripe' }],
      bogies: [{ x: 7, wheelR: 0.42 }, { x: -7, wheelR: 0.42 }],
      pantos: [{ x: 0 }],
      roofBoxes: [{ x: -4, l: 3, w: 1.6, h: 0.3 }],
    },
  ],
}

const ddHead = (len: number, noseLen: number, rearKind: CarSpec['rear']): CarSpec => ({
  length: len,
  height: 3.95,
  floor: 0.6,
  front: { kind: 'wedge', len: noseLen },
  rear: rearKind,
  cap: { len: noseLen + 0.6, color: 'nose' },
  windscreen: { y0: 1.9, y1: 3.05 },
  windows: {
    rows: [
      { y: 0.75, h: 0.95 },
      { y: 2.45, h: 0.95 },
    ],
    x0: -len / 2 + 0.6,
    x1: len / 2 - noseLen - 0.4,
    w: 1.7,
    gap: 0.35,
  },
  doors: { xs: [-len / 2 + 5.4, len / 2 - noseLen - 2.4], w: 1.4, h: 2.1, y: 0.08 },
  bogies: [{ x: len / 2 - 3.2, wheelR: 0.42 }, { x: -len / 2 + 2.6, wheelR: 0.42 }],
  lamps: { low: 0.65, top: 3.45 },
})

const ddMiddle = (len: number): CarSpec => ({
  length: len,
  height: 3.95,
  floor: 0.6,
  front: { kind: 'flat', radius: 0.3 },
  rear: { kind: 'flat', radius: 0.3 },
  windows: {
    rows: [
      { y: 0.75, h: 0.95 },
      { y: 2.45, h: 0.95 },
    ],
    x0: -len / 2 + 0.6,
    x1: len / 2 - 0.6,
    w: 1.7,
    gap: 0.35,
  },
  doors: { xs: [-len / 2 + 4.6, len / 2 - 4.6], w: 1.4, h: 2.1, y: 0.08 },
  bogies: [{ x: len / 2 - 2.6, wheelR: 0.42 }, { x: -len / 2 + 2.6, wheelR: 0.42 }],
  pantos: [{ x: 0 }],
})

const fvdosto: TrainPreset = { gauge: 'standard', cruise: 10, cars: [ddHead(26, 4.2, { kind: 'flat', radius: 0.3 }), ddMiddle(24)] }

const mutz: TrainPreset = {
  gauge: 'standard',
  cruise: 9,
  cars: [{ ...ddHead(25, 3.0, { kind: 'flat', radius: 0.3 }), stripes: [{ y: 0.12, h: 0.18, color: 'stripe' }] }, { ...ddMiddle(24), stripes: [{ y: 0.12, h: 0.18, color: 'stripe' }] }],
}

const allegra: TrainPreset = {
  gauge: 'meter',
  cruise: 7,
  cars: [
    {
      length: 17,
      height: 2.75,
      floor: 1.05,
      front: { kind: 'round', len: 2.4, lean: 0.75 },
      rear: { kind: 'flat', radius: 0.25 },
      windscreen: { y0: 1.25, y1: 2.35 },
      cabSideWindow: true,
      windows: { rows: [{ y: 1.15, h: 0.95 }], x0: -7.8, x1: 4.6, w: 1.35, gap: 0.3 },
      doors: { xs: [-5.8, 3.4], w: 1.2, h: 2.0, y: 0.05 },
      stripes: [{ y: 0.32, h: 0.1, color: 'stripe' }],
      bogies: [{ x: 5.8, wheelR: 0.4 }, { x: -6, wheelR: 0.4 }],
      roofBoxes: [{ x: -2, l: 4, w: 1.6, h: 0.35 }],
      lamps: { low: 0.55, top: 2.6, spread: 0.8 },
    },
    {
      length: 15,
      height: 2.75,
      floor: 1.05,
      front: { kind: 'flat', radius: 0.25 },
      rear: { kind: 'flat', radius: 0.25 },
      windows: { rows: [{ y: 1.15, h: 0.95 }], x0: -6.8, x1: 6.8, w: 1.35, gap: 0.3 },
      doors: { xs: [5.4], w: 1.2, h: 2.0, y: 0.05 },
      stripes: [{ y: 0.32, h: 0.1, color: 'stripe' }],
      bogies: [{ x: 5, wheelR: 0.4 }, { x: -5, wheelR: 0.4 }],
      pantos: [{ x: 0 }],
    },
  ],
}

const krokodil: TrainPreset = { gauge: 'standard', special: 'krokodil', cruise: 4, cars: [re420.cars[0]] }
const pilatus: TrainPreset = { gauge: 'narrow', special: 'rack', cruise: 2, cars: [re420.cars[0]] }

export const presets: Record<string, TrainPreset> = {
  re460,
  re420,
  ae66,
  ce68ii: krokodil,
  giruno,
  fvdosto,
  ge44ii,
  allegra,
  mutz,
  pilatus,
}
