import { useMemo } from 'react'
import * as THREE from 'three'
import type { CarSpec, TrainColors } from './types'
import { clipX, frontCurve, profile, shell, xAtY, type P } from './profile'
import { glass, matte, paint } from './materials'
import { Bogie, Lamp, Pantograph } from './parts'

const BEVEL = 0.14

const shade = (hex: string, f: number) => '#' + new THREE.Color(hex).multiplyScalar(f).getHexString()

function extrude(points: P[], depth: number, bevel = BEVEL) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, depth - 2 * bevel),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 6,
  })
  geo.translate(0, 0, -(depth - 2 * bevel) / 2)
  geo.computeVertexNormals()
  return geo
}

function resolve(c: string | undefined, colors: TrainColors) {
  if (!c) return colors.stripe
  if (c === 'stripe' || c === 'roof' || c === 'accent' || c === 'nose' || c === 'body' || c === 'door') return colors[c] ?? colors.stripe
  return c
}

export function Car({ spec, colors, width, gauge, isHead, isTail }: { spec: CarSpec; colors: TrainColors; width: number; gauge: number; isHead: boolean; isTail: boolean }) {
  const { length: L, height: H, floor } = spec
  const W = width

  const geo = useMemo(() => {
    const body = extrude(profile(L, H, spec.front, spec.rear), W)
    const fc = frontCurve(spec.front, L, H)
    const rc = frontCurve(spec.rear, L, H)
    let cap: THREE.ExtrudeGeometry | null = null
    if (spec.cap) {
      const big = profile(L + 0.04, H + 0.04, spec.front, spec.rear).map(([x, y]) => [x, y - 0.02] as P)
      cap = extrude(clipX(big, L / 2 - spec.cap.len), W + 0.03)
    }
    const screens: THREE.ExtrudeGeometry[] = []
    if (spec.windscreen && spec.front) screens.push(extrude(shell(fc, spec.windscreen.y0, spec.windscreen.y1, spec.cap ? 0.12 : 0.06), W * 0.86, 0.1))
    if (spec.windscreen && spec.rear) {
      const rs = extrude(shell(rc, spec.windscreen.y0, spec.windscreen.y1, spec.cap ? 0.12 : 0.06), W * 0.86, 0.1)
      rs.scale(-1, 1, 1)
      screens.push(rs)
    }
    return { body, cap, screens, fc, rc }
  }, [L, H, W, spec.front, spec.rear, spec.cap, spec.windscreen])

  // usable side range at a given height (between the two curved ends)
  const sideRange = (y: number, margin = 0.15): [number, number] => [-xAtY(geo.rc, y) + margin, xAtY(geo.fc, y) - margin]
  const sideZ = W / 2 + 0.012

  const windows = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number }[] = []
    const win = spec.windows
    if (!win) return out
    const doorXs = spec.doors?.xs ?? []
    const doorW = spec.doors?.w ?? 0
    for (const row of win.rows) {
      for (let x = win.x0; x + win.w <= win.x1 + 1e-6; x += win.w + win.gap) {
        const cx = x + win.w / 2
        if (doorXs.some((d) => Math.abs(d - cx) < doorW / 2 + win.w / 2)) continue
        const [lo, hi] = sideRange(row.y + row.h, 0.2)
        if (cx - win.w / 2 < lo || cx + win.w / 2 > hi) continue
        out.push({ x: cx, y: row.y + row.h / 2, w: win.w, h: row.h })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.windows, spec.doors, geo])

  const roofY = floor + H
  const lamp = spec.lamps

  return (
    <group>
      {/* body */}
      <group position={[0, floor, 0]}>
        <mesh geometry={geo.body} material={paint(colors.body)} castShadow receiveShadow />
        {geo.cap && spec.cap && <mesh geometry={geo.cap} material={paint(resolve(spec.cap.color, colors))} castShadow />}
        {geo.screens.map((g, i) => (
          <mesh key={i} geometry={g} material={glass(colors.window ?? '#1f2328')} />
        ))}

        {/* stripes along both sides */}
        {spec.stripes?.map((s, i) => {
          const [lo, hi] = sideRange(s.y + s.h / 2, 0.05)
          const len = hi - lo
          return [-1, 1].map((side) => (
            <mesh key={`${i}${side}`} position={[(lo + hi) / 2, s.y + s.h / 2, side * (sideZ - 0.004)]} material={paint(resolve(s.color, colors))}>
              <boxGeometry args={[len, s.h, 0.02]} />
            </mesh>
          ))
        })}

        {/* side windows */}
        {windows.map((w, i) =>
          [-1, 1].map((side) => (
            <mesh key={`${i}${side}`} position={[w.x, w.y, side * sideZ]} material={glass(colors.window ?? '#1f2328')}>
              <boxGeometry args={[w.w, w.h, 0.03]} />
            </mesh>
          )),
        )}

        {/* cab side windows */}
        {spec.cabSideWindow &&
          [spec.front && 1, spec.rear && -1].filter(Boolean).map((end) => {
            const e = end as number
            const curve = e === 1 ? geo.fc : geo.rc
            const y = H * 0.62
            const x = e * (xAtY(curve, y) - 0.75)
            return [-1, 1].map((side) => (
              <mesh key={`${e}${side}`} position={[x, y, side * sideZ]} material={glass(colors.window ?? '#1f2328')}>
                <boxGeometry args={[0.7, H * 0.26, 0.03]} />
              </mesh>
            ))
          })}

        {/* doors */}
        {spec.doors?.xs.map((dx) =>
          [-1, 1].map((side) => {
            const h = spec.doors!.h ?? H * 0.82
            const y = spec.doors!.y ?? 0.08
            return (
              <group key={`${dx}${side}`} position={[dx, y + h / 2, side * (sideZ + 0.004)]}>
                <mesh material={paint(resolve(colors.door ? 'door' : 'stripe', colors))}>
                  <boxGeometry args={[spec.doors!.w, h, 0.03]} />
                </mesh>
                <mesh position={[0, h * 0.18, side * 0.018]} material={glass(colors.window ?? '#1f2328')}>
                  <boxGeometry args={[spec.doors!.w * 0.7, h * 0.36, 0.01]} />
                </mesh>
                <mesh position={[0, 0, side * 0.02]} material={matte('#2d3036')}>
                  <boxGeometry args={[0.03, h * 0.95, 0.01]} />
                </mesh>
              </group>
            )
          }),
        )}

        {/* ventilation grilles (locomotives) */}
        {spec.grilles &&
          Array.from({ length: spec.grilles.count }, (_, i) => {
            const g = spec.grilles!
            const step = (g.x1 - g.x0) / g.count
            const x = g.x0 + step * (i + 0.5)
            return [-1, 1].map((side) => (
              <group key={`${i}${side}`} position={[x, g.y + g.h / 2, side * sideZ]}>
                <mesh material={paint(shade(colors.body, 0.72))}>
                  <boxGeometry args={[step * 0.78, g.h, 0.02]} />
                </mesh>
                {[0.3, 0.1, -0.1, -0.3].map((f) => (
                  <mesh key={f} position={[0, f * g.h, side * 0.014]} material={paint(shade(colors.body, 0.5))}>
                    <boxGeometry args={[step * 0.72, g.h * 0.06, 0.01]} />
                  </mesh>
                ))}
              </group>
            ))
          })}

        {/* lamps: 3 white in a triangle at the front, red at the back */}
        {lamp && spec.front && isHead && (
          <>
            {[-1, 1].map((s) => (
              <Lamp key={s} position={[xAtY(geo.fc, lamp.low) + 0.06, lamp.low, s * (lamp.spread ?? W * 0.33)]} />
            ))}
            <Lamp position={[xAtY(geo.fc, lamp.top) + 0.06, lamp.top, 0]} r={0.09} />
          </>
        )}
        {lamp && spec.rear && isTail &&
          [-1, 1].map((s) => <Lamp key={s} red position={[-(xAtY(geo.rc, lamp.low) + 0.06), lamp.low, s * (lamp.spread ?? W * 0.33)]} r={0.08} />)}
      </group>

      {/* roof equipment */}
      {spec.roofBoxes?.map((b, i) => (
        <mesh key={i} position={[b.x, roofY + b.h / 2 - 0.02, 0]} material={matte(colors.roof)} castShadow>
          <boxGeometry args={[b.l, b.h, b.w]} />
        </mesh>
      ))}
      {spec.pantos?.map((p, i) => (
        <Pantograph key={i} x={p.x} y={roofY - 0.02} mirrored={p.mirrored} />
      ))}

      {/* underframe */}
      {spec.skirt !== false && (
        <mesh position={[0, floor - 0.12, 0]} material={matte('#2b2e33')} castShadow>
          <boxGeometry args={[L * 0.72, 0.3, W * 0.82]} />
        </mesh>
      )}
      {spec.bogies.map((b, i) => (
        <Bogie key={i} x={b.x} axles={b.axles} r={b.wheelR} gauge={gauge} />
      ))}
    </group>
  )
}
