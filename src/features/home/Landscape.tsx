import { motion } from 'framer-motion'
import { useState } from 'react'
import { sfx, unlockAudio } from '../../audio/engine'

/** Evening sky, Alps and drifting clouds (decorative background). */
export function Landscape() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 110 1200 560" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7ccbf2" />
            <stop offset="0.55" stopColor="#bfe6fb" />
            <stop offset="0.8" stopColor="#ffe2bf" />
            <stop offset="1" stopColor="#ffd09a" />
          </linearGradient>
          <linearGradient id="mtnFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fb7d6" />
            <stop offset="1" stopColor="#c9d6e8" />
          </linearGradient>
          <linearGradient id="mtnNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a95b8" />
            <stop offset="1" stopColor="#9db3cf" />
          </linearGradient>
          <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc56a" />
            <stop offset="1" stopColor="#4f9e45" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff5d6" />
            <stop offset="0.5" stopColor="#ffd27a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#sky)" />
        <circle cx="930" cy="250" r="140" fill="url(#sun)" />
        <circle cx="930" cy="250" r="46" fill="#fff3c9" />
        {/* far range */}
        <path d="M0 470 L120 330 L190 390 L300 250 L380 330 L470 280 L560 360 L660 230 L760 340 L840 300 L960 380 L1060 270 L1200 380 L1200 800 L0 800Z" fill="url(#mtnFar)" />
        {/* near range with snow */}
        <path d="M0 520 L160 380 L260 470 L400 320 L520 450 L640 360 L760 470 L900 340 L1030 460 L1200 390 L1200 800 L0 800Z" fill="url(#mtnNear)" />
        <path d="M160 380 L200 415 L182 420 L165 408 L148 418 L128 410Z M400 320 L448 372 L425 368 L405 382 L382 365 L360 368Z M640 360 L680 395 L660 398 L642 388 L622 398Z M900 340 L945 383 L922 380 L902 392 L882 380 L862 378Z" fill="#fbfcfd" />
        {/* hills */}
        <path d="M0 600 Q 200 520 420 580 T 820 570 T 1200 560 L1200 800 L0 800Z" fill="url(#hill)" />
        {[90, 160, 1010, 1090, 1150].map((x, i) => (
          <g key={x} transform={`translate(${x} ${560 + (i % 2) * 14})`}>
            <rect x="-3" y="20" width="6" height="14" fill="#6b4a2b" />
            <path d="M0 -18 L16 22 L-16 22Z" fill="#2f7d3a" />
          </g>
        ))}
      </svg>
      <Clouds />
    </div>
  )
}

const cloudDefs = [
  { top: '8%', scale: 1, dur: 70, delay: -10 },
  { top: '18%', scale: 0.7, dur: 95, delay: -50 },
  { top: '4%', scale: 0.55, dur: 120, delay: -80 },
]

function Clouds() {
  return (
    <>
      {cloudDefs.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}
    </>
  )
}

function Cloud({ top, scale, dur, delay }: { top: string; scale: number; dur: number; delay: number }) {
  const [puffs, setPuffs] = useState(0)
  return (
    <div className="absolute left-0" style={{ top, animation: `drift ${dur}s linear ${delay}s infinite` }}>
      <motion.button
        type="button"
        aria-label="cloud"
        className="pointer-events-auto block"
        key={puffs}
        initial={{ scale: scale * 0.8 }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 8 }}
        onClick={() => {
          unlockAudio()
          sfx.pop()
          setPuffs((p) => p + 1)
        }}
      >
        <svg width="180" height="80" viewBox="0 0 180 80">
          <g fill="#fff" opacity="0.95">
            <ellipse cx="60" cy="50" rx="45" ry="26" />
            <ellipse cx="100" cy="38" rx="40" ry="30" />
            <ellipse cx="135" cy="52" rx="35" ry="22" />
          </g>
        </svg>
      </motion.button>
    </div>
  )
}
