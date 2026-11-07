import { motion } from 'framer-motion'
import { H, LOCO_W, COACH_W, EMU_HEAD_W, EMU_CAR_W, GAP, trainWidth, type TrainLook } from './trainGeometry'

export type { TrainLook }

function Wheel({ x, moving }: { x: number; moving: boolean }) {
  return (
    <g transform={`translate(${x} 90)`}>
      <g className={moving ? 'wheel-spin' : ''}>
        <circle r="9" fill="#2D3036" />
        <circle r="6" fill="#6B7078" />
        <path d="M-6 0H6M0-6V6" stroke="#2D3036" strokeWidth="2" />
      </g>
    </g>
  )
}

function Bogie({ x, moving }: { x: number; moving: boolean }) {
  return (
    <g>
      <rect x={x - 26} y={82} width={52} height={8} rx={3} fill="#3A3D42" />
      <Wheel x={x - 14} moving={moving} />
      <Wheel x={x + 14} moving={moving} />
    </g>
  )
}

function Pantograph({ x, up }: { x: number; up: boolean }) {
  return (
    <g transform={`translate(${x} 16)`}>
      <rect x={-12} y={-2} width={24} height={4} rx={2} fill="#3A3D42" />
      <motion.g initial={false} animate={{ scaleY: up ? 1 : 0.35 }} style={{ originY: 1, originX: 0.5 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }}>
        <path d="M-10 0 L4 -14 L-6 -26 M4 -14 L10 0" stroke="#2D3036" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
        <rect x={-16} y={-29} width={26} height={3.5} rx={1.5} fill="#2D3036" />
      </motion.g>
    </g>
  )
}

/** Front lamps of a Swiss train: 3 lamps forming a triangle (seen from the side: top + bottom). */
function Lamps({ x, on }: { x: number; on: boolean }) {
  const fill = on ? '#FFF7C2' : '#E8E8E8'
  return (
    <g>
      {on && <circle cx={x} cy={74} r={9} fill="#FFF7C2" opacity={0.35} />}
      <circle cx={x} cy={74} r={4} fill={fill} stroke="#2D3036" strokeWidth="1" />
      <circle cx={x + 10} cy={30} r={3.5} fill={fill} stroke="#2D3036" strokeWidth="1" />
    </g>
  )
}

function Loco({ look, moving, pantoUp, lightsOn }: { look: TrainLook; moving: boolean; pantoUp: boolean; lightsOn: boolean }) {
  const r = look.boxy ? 8 : 22
  const w = LOCO_W
  const d = `M ${r} 22 Q 2 22 2 ${22 + r} L 2 80 Q 2 84 6 84 L ${w - 6} 84 Q ${w - 2} 84 ${w - 2} 80 L ${w - 2} ${22 + r} Q ${w - 2} 22 ${w - r} 22 Z`
  return (
    <g>
      <Pantograph x={60} up={pantoUp} />
      <Pantograph x={130} up={false} />
      <path d={d} fill={look.body} stroke="rgba(0,0,0,.25)" strokeWidth="1.5" />
      <rect x={r * 0.6} y={18} width={w - r * 1.2} height={7} rx={3} fill={look.roof} />
      <rect x={6} y={64} width={w - 12} height={6} fill={look.stripe} opacity={0.9} />
      {/* cab windows */}
      <path d={`M ${look.boxy ? 6 : 10} 34 L 30 34 L 30 50 L ${look.boxy ? 6 : 5} 50 Z`} fill={look.window ?? '#2D3036'} />
      <path d={`M ${w - 30} 34 L ${w - (look.boxy ? 6 : 10)} 34 L ${w - (look.boxy ? 6 : 5)} 50 L ${w - 30} 50 Z`} fill={look.window ?? '#2D3036'} />
      {/* side grilles */}
      {[50, 80, 110, 140].map((gx) => (
        <rect key={gx} x={gx} y={36} width={20} height={14} rx={2} fill="rgba(0,0,0,.18)" />
      ))}
      <rect x={40} y={36} width={4} height={30} rx={2} fill="rgba(0,0,0,.15)" />
      <Lamps x={8} on={lightsOn} />
      <Bogie x={45} moving={moving} />
      <Bogie x={w - 45} moving={moving} />
    </g>
  )
}

function Coach({ x, look, moving }: { x: number; look: TrainLook; moving: boolean }) {
  const w = COACH_W
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={26} width={w} height={58} rx={8} fill={look.coachBody ?? '#F4F4F2'} stroke="rgba(0,0,0,.2)" strokeWidth="1.5" />
      <rect x={4} y={22} width={w - 8} height={7} rx={3} fill="#B8BDC4" />
      {[14, 54, 94, 134, 174].map((wx) => (
        <rect key={wx} x={wx} y={36} width={32} height={16} rx={4} fill="#2D3036" />
      ))}
      <rect x={0} y={60} width={w} height={6} fill={look.coachStripe ?? '#E30613'} />
      <Bogie x={40} moving={moving} />
      <Bogie x={w - 40} moving={moving} />
    </g>
  )
}

function EmuCar({ x, look, moving, head, lightsOn, pantoUp }: { x: number; look: TrainLook; moving: boolean; head: boolean; lightsOn: boolean; pantoUp: boolean }) {
  const w = head ? EMU_HEAD_W : EMU_CAR_W
  const body = head ? `M 70 22 Q 18 24 3 66 L 2 80 Q 2 84 8 84 L ${w} 84 L ${w} 22 Z` : `M 0 22 L ${w} 22 L ${w} 84 L 0 84 Z`
  return (
    <g transform={`translate(${x} 0)`}>
      {!head && <Pantograph x={w / 2} up={pantoUp} />}
      <path d={body} fill={look.body} stroke="rgba(0,0,0,.2)" strokeWidth="1.5" />
      {head ? (
        <path d="M 66 30 Q 34 32 22 52 L 70 52 Z" fill={look.window ?? '#2D3036'} />
      ) : null}
      <rect x={head ? 84 : 10} y={36} width={w - (head ? 94 : 20)} height={18} rx={5} fill={look.window ?? '#2D3036'} />
      <rect x={head ? 14 : 0} y={62} width={w - (head ? 14 : 0)} height={5} fill={look.stripe} />
      {head && <Lamps x={6} on={lightsOn} />}
      <Bogie x={head ? 90 : 40} moving={moving} />
      <Bogie x={w - 40} moving={moving} />
    </g>
  )
}

/** Side view of a train, facing left. Height in px; width follows the composition. */
export function TrainSide({ look, height = 100, moving = false, pantoUp = true, lightsOn = true }: { look: TrainLook; height?: number; moving?: boolean; pantoUp?: boolean; lightsOn?: boolean }) {
  const w = trainWidth(look)
  const n = look.coaches ?? 0
  return (
    <svg width={(w / H) * height} height={height * 1.1} viewBox={`-2 -14 ${w + 4} ${H + 10}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <ellipse cx={w / 2} cy={96} rx={w / 2} ry={4} fill="rgba(0,0,0,.18)" />
      {look.kind === 'loco' ? (
        <>
          <Loco look={look} moving={moving} pantoUp={pantoUp} lightsOn={lightsOn} />
          {Array.from({ length: n }, (_, i) => (
            <Coach key={i} x={LOCO_W + GAP + i * (COACH_W + GAP)} look={look} moving={moving} />
          ))}
        </>
      ) : (
        <>
          <EmuCar x={0} look={look} moving={moving} head lightsOn={lightsOn} pantoUp={pantoUp} />
          {Array.from({ length: n }, (_, i) => (
            <EmuCar key={i} x={EMU_HEAD_W + GAP + i * (EMU_CAR_W + GAP)} look={look} moving={moving} head={false} lightsOn={false} pantoUp={pantoUp} />
          ))}
        </>
      )}
    </svg>
  )
}
