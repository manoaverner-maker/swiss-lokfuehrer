import type { Nose } from './types'

export type P = [number, number]

function cubic(p0: P, p1: P, p2: P, p3: P, n: number): P[] {
  const out: P[] = []
  for (let i = 1; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
  }
  return out
}

/** Points of the front end of a car (right side, x = +L/2), from the bottom up to the roof. */
export function frontCurve(nose: Nose | undefined, L: number, H: number): P[] {
  const X = L / 2
  const n = nose ?? { kind: 'flat', radius: 0.18 }
  switch (n.kind) {
    case 'flat': {
      const r = n.radius ?? 0.3
      const pts: P[] = [[X, 0], [X, H - r]]
      for (let i = 1; i <= 6; i++) {
        const a = (i / 6) * (Math.PI / 2)
        pts.push([X - r + Math.cos(a) * r, H - r + Math.sin(a) * r])
      }
      return pts
    }
    case 'round': {
      const lean = n.lean ?? 0.15
      return [[X, 0], [X, H * 0.42], ...cubic([X, H * 0.42], [X - lean * 0.6, H * 0.72], [X - n.len * 0.55, H], [X - n.len, H], 12)]
    }
    case 'slope':
      return [[X, 0], [X, H * 0.18], ...cubic([X, H * 0.18], [X - n.len * 0.1, H * 0.6], [X - n.len * 0.5, H], [X - n.len, H], 16)]
    case 'wedge':
      return [[X, 0], [X, H * 0.3], ...cubic([X, H * 0.3], [X - n.len * 0.42, H * 0.6], [X - n.len * 0.72, H * 0.98], [X - n.len, H], 14)]
  }
}

/** Closed side profile of a car body (counter-clockwise). */
export function profile(L: number, H: number, front?: Nose, rear?: Nose): P[] {
  const f = frontCurve(front, L, H)
  const r = frontCurve(rear, L, H)
    .map(([x, y]) => [-x, y] as P)
    .reverse()
  return [...f, ...r]
}

/** Keep only the part of a polygon with x >= xMin (Sutherland–Hodgman). */
export function clipX(poly: P[], xMin: number): P[] {
  const out: P[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const ain = a[0] >= xMin
    const bin = b[0] >= xMin
    if (ain) out.push(a)
    if (ain !== bin) {
      const t = (xMin - a[0]) / (b[0] - a[0])
      out.push([xMin, a[1] + t * (b[1] - a[1])])
    }
  }
  return out
}

/** x of the curve at height y (curve goes bottom → top). */
export function xAtY(curve: P[], y: number): number {
  for (let i = 1; i < curve.length; i++) {
    const [x0, y0] = curve[i - 1]
    const [x1, y1] = curve[i]
    if (y >= Math.min(y0, y1) && y <= Math.max(y0, y1) && y1 !== y0) return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0)
  }
  return curve[curve.length - 1][0]
}

/** A thin shell lying on the curve between two heights – used for windscreens. */
export function shell(curve: P[], y0: number, y1: number, out = 0.03, inn = 0.12): P[] {
  const pts: P[] = [[xAtY(curve, y0), y0]]
  for (const p of curve) if (p[1] > y0 && p[1] < y1) pts.push(p)
  pts.push([xAtY(curve, y1), y1])
  const normals = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    return [dy / len, -dx / len] as P
  })
  const outer = pts.map((p, i) => [p[0] + normals[i][0] * out, p[1] + normals[i][1] * out] as P)
  const inner = pts.map((p, i) => [p[0] - normals[i][0] * inn, p[1] - normals[i][1] * inn] as P).reverse()
  return [...outer, ...inner]
}
