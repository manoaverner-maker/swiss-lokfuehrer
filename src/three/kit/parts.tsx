import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { chrome, matte, metal } from './materials'
import { useTrainAnim } from './anim'

/** Wheelset group that turns with the distance travelled. */
function Wheelset({ x, r, gauge }: { x: number; r: number; gauge: number }) {
  const ref = useRef<THREE.Group>(null)
  const { distance } = useTrainAnim()
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = -distance.current / r
  })
  return (
    <group position={[x, r, 0]} ref={ref}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, (s * gauge) / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={metal('#3b3f45')} castShadow>
            <cylinderGeometry args={[r, r, 0.12, 20]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, s * 0.065]} material={metal('#8a9099')}>
            <cylinderGeometry args={[r * 0.55, r * 0.55, 0.02, 16]} />
          </mesh>
          {/* spoke marker so turning is visible */}
          <mesh position={[0, r * 0.35, s * 0.07]} material={matte('#c9a227')}>
            <boxGeometry args={[0.08, r * 0.5, 0.01]} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={metal('#2b2e33')}>
        <cylinderGeometry args={[0.07, 0.07, gauge, 8]} />
      </mesh>
    </group>
  )
}

export function Bogie({ x, axles = 2, r = 0.46, gauge }: { x: number; axles?: 2 | 3; r?: number; gauge: number }) {
  const spacing = r * 2 + 0.5
  const xs = axles === 2 ? [-spacing / 2, spacing / 2] : [-spacing, 0, spacing]
  const frameL = spacing * (axles - 1) + r * 2 + 0.3
  return (
    <group position={[x, 0, 0]}>
      {xs.map((ax) => (
        <Wheelset key={ax} x={ax} r={r} gauge={gauge} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, r + 0.05, s * (gauge / 2 + 0.17)]} material={matte('#2f3237')} castShadow>
          <boxGeometry args={[frameL, 0.34, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, r + 0.25, 0]} material={matte('#2a2d31')}>
        <boxGeometry args={[frameL * 0.5, 0.18, gauge + 0.3]} />
      </mesh>
      {/* springs */}
      {xs.map((ax) =>
        [-1, 1].map((s) => (
          <mesh key={`${ax}${s}`} position={[ax, r + 0.32, s * (gauge / 2 + 0.17)]} material={metal('#c9a227')}>
            <cylinderGeometry args={[0.09, 0.09, 0.22, 10]} />
          </mesh>
        )),
      )}
    </group>
  )
}

const UP = new THREE.Vector3(0, 1, 0)
const TMP = new THREE.Vector3()

/** Stretches a unit cylinder between two points (in the xy plane). */
function place(m: THREE.Mesh | null, x0: number, y0: number, x1: number, y1: number) {
  if (!m) return
  const len = Math.hypot(x1 - x0, y1 - y0)
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0)
  m.scale.set(1, len, 1)
  TMP.set(x1 - x0, y1 - y0, 0).normalize()
  m.quaternion.setFromUnitVectors(UP, TMP)
}

/** Single-arm pantograph; rises and lowers smoothly. */
export function Pantograph({ x, y, mirrored = false }: { x: number; y: number; mirrored?: boolean }) {
  const lower = useRef<THREE.Mesh>(null)
  const upper = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Group>(null)
  const { panto } = useTrainAnim()
  const a = 1.25
  const b = 1.35
  const dir = mirrored ? -1 : 1

  useFrame(() => {
    const t = panto.current
    const alpha = THREE.MathUtils.lerp(0.12, 0.72, t)
    const kx = dir * a * Math.cos(alpha)
    const ky = 0.25 + a * Math.sin(alpha)
    const hx = dir * 0.25
    const dx = hx - kx
    const hy = ky + Math.sqrt(Math.max(0.01, b * b - dx * dx)) * (0.25 + 0.75 * t)
    place(lower.current, 0, 0.25, kx, ky)
    place(upper.current, kx, ky, hx, hy)
    head.current?.position.set(hx, hy, 0)
  })

  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0.1, 0]} material={matte('#2f3237')}>
        <boxGeometry args={[1.2, 0.2, 1.1]} />
      </mesh>
      {[-0.45, 0.45].map((z) => (
        <mesh key={z} position={[0, 0.22, z]} material={matte('#cfcfcf')}>
          <cylinderGeometry args={[0.07, 0.09, 0.14, 8]} />
        </mesh>
      ))}
      <mesh ref={lower} material={metal('#4a4f57')}>
        <cylinderGeometry args={[0.045, 0.045, 1, 8]} />
      </mesh>
      <mesh ref={upper} material={metal('#4a4f57')}>
        <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
      </mesh>
      <group ref={head}>
        <mesh material={metal('#3a3e44')}>
          <boxGeometry args={[0.12, 0.06, 1.8]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={chrome()}>
          <boxGeometry args={[0.08, 0.04, 1.4]} />
        </mesh>
      </group>
    </group>
  )
}

/** Swiss front light: lamp that glows when lights are on. */
export function Lamp({ position, r = 0.14, red = false }: { position: [number, number, number]; r?: number; red?: boolean }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const { lights } = useTrainAnim()
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = lights.current * (red ? 1.6 : 2.4)
  })
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, 16, 12]} />
        <meshStandardMaterial ref={mat} color={red ? '#7a1010' : '#f5f1dc'} emissive={red ? '#ff2a2a' : '#fff4c2'} emissiveIntensity={0} roughness={0.2} />
      </mesh>
      <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={matte('#2d3036')}>
        <cylinderGeometry args={[r * 1.35, r * 1.35, 0.05, 16]} />
      </mesh>
    </group>
  )
}

export function Gangway({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <mesh position={[x, y + h / 2, 0]} material={matte('#2b2e33')}>
      <boxGeometry args={[0.7, h, 2.0]} />
    </mesh>
  )
}

