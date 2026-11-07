import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gaugeWidth, type CarSpec, type TrainColors, type TrainPreset } from './types'
import { Car } from './Car'
import { GAP, layoutCars } from './layout'
import { TrainAnimContext, useTrainAnim, type TrainAnim } from './anim'
import { Gangway, Lamp, Pantograph } from './parts'
import { matte, metal, paint, glass } from './materials'

const bodyWidth = { standard: 2.95, meter: 2.65, narrow: 2.3 } as const

export type Train3DProps = {
  preset: TrainPreset
  colors: TrainColors
  driving?: boolean
  pantoUp?: boolean
  lightsOn?: boolean
  track?: boolean
  /** called with the total length so the camera can frame the train */
  onLength?: (l: number) => void
}

/** Rails, sleepers and ballast. Sleepers scroll with the distance so the train seems to move. */
function Track({ length, gauge, rack = false }: { length: number; gauge: number; rack?: boolean }) {
  const { distance } = useTrainAnim()
  const spacing = 0.65
  const count = Math.ceil(length / spacing) + 2
  const ref = useRef<THREE.InstancedMesh>(null)
  const rackRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(() => {
    const off = -(distance.current % spacing)
    if (ref.current) {
      for (let i = 0; i < count; i++) {
        dummy.position.set(-length / 2 + i * spacing + off, 0.06, 0)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }
      ref.current.instanceMatrix.needsUpdate = true
    }
    if (rackRef.current) {
      const step = 0.2
      const n = Math.ceil(length / step)
      const o = -(distance.current % step)
      for (let i = 0; i < n; i++) {
        dummy.position.set(-length / 2 + i * step + o, 0.24, 0)
        dummy.updateMatrix()
        rackRef.current.setMatrixAt(i, dummy.matrix)
      }
      rackRef.current.instanceMatrix.needsUpdate = true
    }
  })
  return (
    <group>
      <mesh position={[0, -0.12, 0]} material={matte('#9a948a')} receiveShadow>
        <boxGeometry args={[length, 0.24, gauge + 2.2]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={matte('#6b5440')} receiveShadow>
        <boxGeometry args={[0.24, 0.12, gauge + 1.0]} />
      </instancedMesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.17, (s * gauge) / 2]} material={metal('#8f959c')} receiveShadow>
          <boxGeometry args={[length, 0.12, 0.08]} />
        </mesh>
      ))}
      {rack && (
        <>
          <mesh position={[0, 0.2, 0]} material={metal('#6d737a')}>
            <boxGeometry args={[length, 0.1, 0.12]} />
          </mesh>
          <instancedMesh ref={rackRef} args={[undefined, undefined, Math.ceil(length / 0.2)]} material={metal('#9aa0a7')}>
            <boxGeometry args={[0.08, 0.06, 0.26]} />
          </instancedMesh>
        </>
      )}
    </group>
  )
}

export function Train3D({ preset, colors, driving = false, pantoUp = true, lightsOn = true, track = true }: Train3DProps) {
  const distance = useRef(0)
  const speed = useRef(0)
  const panto = useRef(pantoUp ? 1 : 0)
  const lights = useRef(lightsOn ? 1 : 0)
  const anim = useMemo<TrainAnim>(() => ({ distance, speed, panto, lights }), [])
  const bob = useRef<THREE.Group>(null)
  const cruiseSpeed = preset.cruise ?? 6
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const target = driving ? cruiseSpeed : 0
    speed.current += (target - speed.current) * Math.min(1, d * 0.9)
    distance.current += speed.current * d
    panto.current += ((pantoUp ? 1 : 0) - panto.current) * Math.min(1, d * 2.5)
    lights.current += ((lightsOn ? 1 : 0) - lights.current) * Math.min(1, d * 6)
    if (bob.current) {
      const k = speed.current / Math.max(cruiseSpeed, 0.001)
      bob.current.position.y = Math.sin(state.clock.elapsedTime * 9) * 0.012 * k
      bob.current.rotation.x = Math.sin(state.clock.elapsedTime * 5.3) * 0.004 * k
    }
  })
  const gauge = gaugeWidth[preset.gauge]
  const width = bodyWidth[preset.gauge]
  const { xs, total } = useMemo(() => layoutCars(preset.cars), [preset.cars])

  let content: ReactNode
  if (preset.special === 'krokodil') content = <Krokodil colors={colors} gauge={gauge} />
  else if (preset.special === 'rack') content = <RackCar colors={colors} gauge={gauge} />
  else
    content = (
      <>
        {preset.cars.map((c, i) => (
          <group key={i} position={[xs[i], 0, 0]}>
            <Car spec={c} colors={colors} width={width} gauge={gauge} isHead={i === 0} isTail={i === preset.cars.length - 1} />
          </group>
        ))}
        {preset.cars.slice(1).map((c, i) => (
          <Gangway key={i} x={xs[i] - preset.cars[i].length / 2 - GAP / 2} y={c.floor + 0.2} h={Math.min(c.height, preset.cars[i].height) - 0.5} />
        ))}
      </>
    )

  const isRack = preset.special === 'rack'
  return (
    <TrainAnimContext.Provider value={anim}>
      <group rotation={[0, 0, isRack ? Math.atan(0.42) : 0]}>
        {track && <Track length={(isRack ? 14 : total) + 14} gauge={gauge} rack={isRack} />}
        <group ref={bob}>
          <group position={[0, 0.23, 0]}>{content}</group>
        </group>
      </group>
    </TrainAnimContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Special builds                                                       */
/* ------------------------------------------------------------------ */

/** Rod-driven wheel group of the "Krokodil": 3 big driving wheels + coupling rods + small leading wheel. */
function RodDrive({ x, dir, gauge }: { x: number; dir: 1 | -1; gauge: number }) {
  const { distance } = useTrainAnim()
  const R = 0.67
  const wheelXs = [0, 1.55, 3.1].map((v) => x + dir * v)
  const wheels = useRef<(THREE.Group | null)[]>([])
  const rods = useRef<(THREE.Mesh | null)[]>([])
  const crank = 0.32
  useFrame(() => {
    const a = -distance.current / R
    wheels.current.forEach((w) => w && (w.rotation.z = a))
    rods.current.forEach((r, i) => {
      if (!r) return
      const side = i % 2 === 0 ? 1 : -1
      const phase = a + (side === 1 ? 0 : Math.PI / 2)
      r.position.set((wheelXs[0] + wheelXs[2]) / 2 + Math.cos(phase) * crank, R + Math.sin(phase) * crank, side * (gauge / 2 + 0.2))
    })
  })
  return (
    <group>
      {wheelXs.map((wx, i) => (
        <group key={i} position={[wx, R, 0]} ref={(el) => void (wheels.current[i] = el)}>
          {[-1, 1].map((s) => (
            <group key={s} position={[0, 0, (s * gauge) / 2]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={metal('#2f3237')} castShadow>
                <cylinderGeometry args={[R, R, 0.12, 24]} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, s * 0.07]} material={paint('#7a2f1a')}>
                <cylinderGeometry args={[R * 0.8, R * 0.8, 0.02, 24]} />
              </mesh>
              <mesh position={[crank, 0, s * 0.11]} material={metal('#c9cdd2')}>
                <cylinderGeometry args={[0.07, 0.07, 0.1, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} ref={(el) => void (rods.current[i] = el)} material={metal('#c9cdd2')} castShadow>
          <boxGeometry args={[3.3, 0.12, 0.06]} />
        </mesh>
      ))}
      {/* leading wheel */}
      <group position={[x + dir * 4.5, 0.47, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, (s * gauge) / 2]} rotation={[Math.PI / 2, 0, 0]} material={metal('#2f3237')}>
            <cylinderGeometry args={[0.47, 0.47, 0.12, 18]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Krokodil({ colors, gauge }: { colors: TrainColors; gauge: number }) {
  const W = 2.9
  const cab: CarSpec = {
    length: 7,
    height: 2.75,
    floor: 1.55,
    front: { kind: 'flat', radius: 0.3 },
    rear: { kind: 'flat', radius: 0.3 },
    bogies: [],
    windows: { rows: [{ y: 1.3, h: 0.7 }], x0: -2.6, x1: 2.6, w: 0.75, gap: 0.55 },
    roofBoxes: [{ x: 0, l: 3, w: 1.6, h: 0.35 }],
    skirt: false,
    lamps: { low: 0.4, top: 2.3, spread: 1.0 },
  }
  const hood: CarSpec = {
    length: 5.8,
    height: 1.55,
    floor: 1.55,
    front: { kind: 'round', len: 1.2, lean: 0.4 },
    rear: { kind: 'flat', radius: 0.05 },
    bogies: [],
    grilles: { y: 0.45, h: 0.75, count: 5, x0: -2.4, x1: 1.6 },
    lamps: { low: 0.35, top: 1.15, spread: 0.9 },
    skirt: false,
  }
  return (
    <group>
      <Car spec={cab} colors={colors} width={W} gauge={gauge} isHead={false} isTail={false} />
      {/* cab front windows */}
      {[-1, 1].map((e) => (
        <mesh key={e} position={[e * 3.52, 1.55 + 2.0, 0]} material={glass()}>
          <boxGeometry args={[0.04, 0.6, 1.9]} />
        </mesh>
      ))}
      <group position={[6.3, 0, 0]}>
        <Car spec={hood} colors={colors} width={2.3} gauge={gauge} isHead isTail={false} />
      </group>
      <group position={[-6.3, 0, 0]} rotation={[0, Math.PI, 0]}>
        <Car spec={hood} colors={colors} width={2.3} gauge={gauge} isHead isTail={false} />
      </group>
      {/* frame + buffer beams */}
      <mesh position={[0, 1.4, 0]} material={matte(colors.stripe)} castShadow>
        <boxGeometry args={[19.4, 0.3, 2.9]} />
      </mesh>
      {[-1, 1].map((e) => (
        <group key={e} position={[e * 9.75, 1.15, 0]}>
          <mesh material={paint('#2d2a28')}>
            <boxGeometry args={[0.2, 0.5, 2.9]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[e * 0.25, 0, s * 0.85]} rotation={[0, 0, Math.PI / 2]} material={metal('#9aa0a7')}>
              <cylinderGeometry args={[0.18, 0.18, 0.4, 14]} />
            </mesh>
          ))}
        </group>
      ))}
      <RodDrive x={1.0} dir={1} gauge={gauge} />
      <RodDrive x={-1.0} dir={-1} gauge={gauge} />
      <Pantograph x={1.4} y={1.55 + 2.75 + 0.3} />
      <Pantograph x={-1.4} y={1.55 + 2.75 + 0.3} mirrored />
    </group>
  )
}

/** Pilatus rack railcar: level, stepped compartments on a steep frame, flat Locher cogwheels. */
function RackCar({ colors, gauge }: { colors: TrainColors; gauge: number }) {
  const slope = Math.atan(0.42)
  const n = 6
  const step = 1.85
  const { distance } = useTrainAnim()
  const cogs = useRef<THREE.Group>(null)
  useFrame(() => {
    if (cogs.current) cogs.current.children.forEach((c, i) => (c.rotation.y = (i % 2 ? -1 : 1) * distance.current * 3))
  })
  return (
    <group>
      {/* frame along the slope */}
      <mesh position={[0, 0.85, 0]} material={matte('#2d3036')} castShadow>
        <boxGeometry args={[12, 0.35, 2.1]} />
      </mesh>
      {[-4, 4].map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.42, (s * gauge) / 2]} rotation={[Math.PI / 2, 0, 0]} material={metal('#2f3237')}>
            <cylinderGeometry args={[0.36, 0.36, 0.1, 18]} />
          </mesh>
        )),
      )}
      {/* flat cogwheels gripping the rack from both sides */}
      <group ref={cogs}>
        {[-4, -3.3, 3.3, 4].map((x, i) =>
          [-1, 1].map((s) => (
            <mesh key={`${i}${s}`} position={[x, 0.24, s * 0.32]} material={metal('#c9a227')}>
              <cylinderGeometry args={[0.2, 0.2, 0.12, 12]} />
            </mesh>
          )),
        )}
      </group>
      {/* compartments stay level: counter-rotate each one */}
      {Array.from({ length: n }, (_, i) => {
        const x = -((n - 1) / 2) * step + i * step
        return (
          <group key={i} position={[x, 1.05, 0]} rotation={[0, 0, -slope]}>
            <group position={[0, 1.15, 0]}>
              <mesh material={paint(colors.body)} castShadow>
                <boxGeometry args={[step * Math.cos(slope) + 0.02, 1.0, 2.3]} />
              </mesh>
              <mesh position={[0, 0.85, 0]} material={glass('#6f93ab')}>
                <boxGeometry args={[step * Math.cos(slope) + 0.02, 0.7, 2.32]} />
              </mesh>
              <mesh position={[0, 1.27, 0]} material={paint(colors.roof)}>
                <boxGeometry args={[step * Math.cos(slope) + 0.06, 0.14, 2.36]} />
              </mesh>
              <mesh position={[0, -0.42, 0]} material={paint(colors.stripe)}>
                <boxGeometry args={[step * Math.cos(slope) + 0.03, 0.16, 2.33]} />
              </mesh>
            </group>
            {/* pillar under the compartment, down to the frame */}
            <mesh position={[0, 0.25 - i * 0.0, 0]} material={matte('#2d3036')}>
              <boxGeometry args={[0.3, 0.8 + 0.0, 1.8]} />
            </mesh>
          </group>
        )
      })}
      <Lamp position={[6.1, 1.6, 0.7]} />
      <Lamp position={[6.1, 1.6, -0.7]} />
      <Lamp position={[5.9, 2.8, 0]} r={0.09} />
      <Pantograph x={0} y={3.6} />
    </group>
  )
}
