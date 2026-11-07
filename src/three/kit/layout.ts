import type { CarSpec, TrainPreset } from './types'

export const GAP = 0.8

/** x position of every car (train centred on 0), head car at the front (+x). */
export function layoutCars(cars: CarSpec[]) {
  const xs: number[] = []
  let x = 0
  cars.forEach((c, i) => {
    if (i > 0) x -= cars[i - 1].length / 2 + GAP + c.length / 2
    xs.push(x)
  })
  const front = cars[0].length / 2
  const back = xs[xs.length - 1] - cars[cars.length - 1].length / 2
  const shift = -(front + back) / 2
  return { xs: xs.map((v) => v + shift), total: front - back }
}

/** Where the head car is, so the camera can frame its nose. */
export function headInfo(p: TrainPreset) {
  if (p.special === 'krokodil') return { x: 0, length: 19.4, total: 19.4 }
  if (p.special === 'rack') return { x: 0, length: 12, total: 12 }
  const { xs, total } = layoutCars(p.cars)
  return { x: xs[0], length: p.cars[0].length, total }
}
