import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate, useReducedMotion } from 'framer-motion'
import { TrainSide } from '../../components/TrainSide'
import { trainWidth, type TrainLook } from '../../components/trainGeometry'
import { isAudioRunning, sfx, unlockAudio } from '../../audio/engine'

const fleet: TrainLook[] = [
  { kind: 'loco', body: '#E30613', roof: '#3A3D42', stripe: '#FFFFFF', coaches: 2, coachBody: '#F4F4F2', coachStripe: '#E30613' },
  { kind: 'emu', body: '#F4F4F2', roof: '#B8BDC4', stripe: '#E30613', coaches: 2 },
  { kind: 'loco', boxy: true, body: '#C8102E', roof: '#4A4D52', stripe: '#F4F1EA', coaches: 2, coachBody: '#C8102E', coachStripe: '#F4F1EA' },
  { kind: 'emu', body: '#5BA145', roof: '#5E6F7B', stripe: '#FFFFFF', coaches: 2, window: '#2D3036' },
]

type Phase = 'arriving' | 'waiting' | 'leaving'

/** A train pulls into the station, waits, honks when tapped, and leaves again. */
export function ArrivingTrain({ height }: { height: number }) {
  const [scope, animate] = useAnimate()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('arriving')
  const [wiggle, setWiggle] = useState(0)
  const look = fleet[index % fleet.length]
  const widthPx = (trainWidth(look) / 100) * height
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const el = scope.current as HTMLElement | null
    if (!el) return
    const vw = window.innerWidth
    const stopX = Math.max(16, vw * 0.06)
    let cancelled = false
    const run = async () => {
      if (reduce) {
        await animate(el, { x: stopX }, { duration: 0 })
        setPhase('waiting')
        return
      }
      setPhase('arriving')
      await animate(el, { x: [vw + 40, stopX] }, { duration: 4.5, ease: [0.1, 0.55, 0.25, 1] })
      if (cancelled) return
      setPhase('waiting')
      if (isAudioRunning()) sfx.gong()
      timer.current = window.setTimeout(async () => {
        if (cancelled) return
        if (isAudioRunning()) sfx.doorBeep()
        await new Promise((r) => setTimeout(r, 1200))
        if (cancelled) return
        setPhase('leaving')
        await animate(el, { x: -widthPx - 60 }, { duration: 4, ease: [0.6, 0, 0.9, 0.6] })
        if (!cancelled) setIndex((i) => i + 1)
      }, 14000)
    }
    void run()
    return () => {
      cancelled = true
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [index, animate, scope, reduce, widthPx])

  return (
    <div ref={scope} className="absolute bottom-0 left-0 will-change-transform" style={{ transform: 'translateX(120vw)' }}>
      <motion.button
        type="button"
        aria-label="train"
        className="block"
        key={wiggle}
        animate={wiggle ? { y: [0, -10, 0, -4, 0], rotate: [0, -1, 0.6, 0] } : undefined}
        transition={{ duration: 0.6 }}
        onClick={() => {
          unlockAudio()
          sfx.horn()
          setWiggle((w) => w + 1)
        }}
      >
        <TrainSide look={look} height={height} moving={phase !== 'waiting'} pantoUp />
      </motion.button>
    </div>
  )
}
