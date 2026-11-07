import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Train3D } from './kit/Train3D'
import { presets } from './presets'
import { headInfo } from './kit/layout'
import type { TrainColors } from './kit/types'

export type ViewerState = { driving: boolean; pantoUp: boolean; lightsOn: boolean }

/** Places the camera so the whole train fits, a little from the front side. */
function Framing({ head, controls }: { head: { x: number; length: number }; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const L = head.length
    // distance so that ~L metres fit horizontally and ~7 m vertically (fov 32°)
    const tanV = Math.tan((32 / 2) * (Math.PI / 180))
    const dist = Math.max((L * 0.55 + 2) / (tanV * aspect), 3.6 / tanV)
    const k = dist / 1.07 // camera direction below has length ≈ 1.07
    const tx = head.x + L * 0.08
    camera.position.set(tx + k * 0.62, 2.2 + k * 0.28, k * 0.82)
    controls.current?.target.set(tx, 1.7, 0)
    controls.current?.update()
  }, [camera, head.x, head.length, size.width, size.height, controls])
  return null
}

export default function TrainViewer({ presetId, colors, state, autoRotate = true }: { presetId: string; colors: TrainColors; state: ViewerState; autoRotate?: boolean }) {
  const preset = presets[presetId]
  const head = useMemo(() => (preset ? headInfo(preset) : { x: 0, length: 15, total: 15 }), [preset])
  const length = head.total
  const controls = useRef<OrbitControlsImpl>(null)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (!preset) return null
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 32, near: 0.5, far: 400 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: 'none' }}>
      <Suspense fallback={null}>
        <hemisphereLight args={['#dff2fc', '#8d7a5c', 0.7]} />
        <directionalLight position={[8, 14, 10]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={12} shadow-camera-bottom={-6} />
        <directionalLight position={[-10, 6, -8]} intensity={0.6} color="#ffd9a8" />
        {/* studio reflections, generated locally (no download) */}
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 6, 1]} />
          <Lightformer intensity={1.2} position={[-8, 2, 6]} scale={[10, 3, 1]} color="#ffe6c4" />
          <Lightformer intensity={1} position={[8, 2, -6]} scale={[10, 3, 1]} color="#cfe8ff" />
          <Lightformer intensity={0.6} position={[0, 1, 10]} scale={[20, 1.5, 1]} />
        </Environment>
        <Train3D preset={preset} colors={colors} driving={state.driving} pantoUp={state.pantoUp} lightsOn={state.lightsOn} />
        <ContactShadows position={[0, -0.24, 0]} scale={length + 20} blur={2.2} opacity={0.45} far={6} resolution={512} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
          <circleGeometry args={[length * 0.9 + 10, 48]} />
          <meshStandardMaterial color="#cfe7b8" roughness={1} />
        </mesh>
        <OrbitControls
          ref={controls}
          enablePan={false}
          autoRotate={autoRotate && !reduceMotion && !state.driving}
          autoRotateSpeed={0.6}
          minDistance={6}
          maxDistance={length * 2.2 + 20}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2 - 0.04}
          enableDamping
        />
        <Framing head={head} controls={controls} />
      </Suspense>
    </Canvas>
  )
}
