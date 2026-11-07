import { useEffect, useRef } from 'react'

/**
 * Station clock – own interpretation of the Swiss railway clock behaviour:
 * the second hand sweeps round in ~58.5 s, waits at the top, and the minute hand jumps at :00.
 * Own look: dot markers, rounded hands, second hand ends in a small "3-lamp triangle".
 */
export function StationClock({ size = 140, onTap }: { size?: number; onTap?: () => void }) {
  const hourRef = useRef<SVGGElement>(null)
  const minRef = useRef<SVGGElement>(null)
  const secRef = useRef<SVGGElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const now = new Date()
      const s = now.getSeconds() + now.getMilliseconds() / 1000
      const m = now.getMinutes()
      const h = now.getHours() % 12
      const secAngle = Math.min(s / 58.5, 1) * 360
      // Minute hand jumps once per minute, with a tiny spring overshoot right after the jump
      const jump = s < 0.25 ? Math.sin((s / 0.25) * Math.PI) * 1.2 : 0
      secRef.current?.setAttribute('transform', `rotate(${secAngle} 50 50)`)
      minRef.current?.setAttribute('transform', `rotate(${m * 6 + jump} 50 50)`)
      hourRef.current?.setAttribute('transform', `rotate(${h * 30 + m * 0.5} 50 50)`)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" onClick={onTap} role="img" aria-label="clock">
      <circle cx="50" cy="52" r="48" fill="rgba(0,0,0,.18)" />
      <circle cx="50" cy="50" r="48" fill="#2D3036" />
      <circle cx="50" cy="50" r="44" fill="#FBFCFD" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180
        const big = i % 15 === 0
        const hour = i % 5 === 0
        const r = big ? 3.4 : hour ? 2.3 : 0.8
        const dist = 38
        return <circle key={i} cx={50 + Math.sin(a) * dist} cy={50 - Math.cos(a) * dist} r={r} fill="#2D3036" />
      })}
      <g ref={hourRef}>
        <rect x="47" y="25" width="6" height="30" rx="3" fill="#2D3036" />
      </g>
      <g ref={minRef}>
        <rect x="47.8" y="14" width="4.4" height="41" rx="2.2" fill="#2D3036" />
      </g>
      <g ref={secRef}>
        <rect x="49.2" y="20" width="1.6" height="42" rx="0.8" fill="#E30613" />
        {/* three little lamps in a triangle */}
        <circle cx="50" cy="17" r="2.2" fill="#E30613" />
        <circle cx="46.8" cy="22.4" r="2.2" fill="#E30613" />
        <circle cx="53.2" cy="22.4" r="2.2" fill="#E30613" />
      </g>
      <circle cx="50" cy="50" r="2.4" fill="#E30613" />
    </svg>
  )
}
