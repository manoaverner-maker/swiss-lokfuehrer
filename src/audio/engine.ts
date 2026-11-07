// Small sound engine. Every sound is synthesized with the Web Audio API – no audio files, works offline.
import { useSettings } from '../store/settings'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let sfxBus: GainNode | null = null
let musicBus: GainNode | null = null

function applySettings() {
  if (!master || !sfxBus || !ctx) return
  const s = useSettings.getState()
  master.gain.setTargetAtTime(s.soundOn ? s.volume : 0, ctx.currentTime, 0.02)
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.connect(ctx.destination)
    sfxBus = ctx.createGain()
    sfxBus.connect(master)
    musicBus = ctx.createGain()
    musicBus.gain.value = 0.18
    musicBus.connect(master)
    applySettings()
    useSettings.subscribe((s, prev) => {
      applySettings()
      if (s.musicOn !== prev.musicOn) {
        if (s.musicOn) startMusic()
        else stopMusic()
      }
    })
  } catch {
    ctx = null
  }
  return ctx
}

export const isAudioRunning = () => ctx?.state === 'running'

/** Call on the first user gesture (iOS only allows audio after a tap). */
export function unlockAudio() {
  const c = getCtx()
  if (c && c.state === 'suspended') void c.resume()
  if (useSettings.getState().musicOn) startMusic()
}

type ToneOpts = { type?: OscillatorType; freq: number; to?: number; start?: number; dur: number; gain?: number; attack?: number }

function tone(o: ToneOpts, dest?: AudioNode) {
  const c = getCtx()
  if (!c || !sfxBus) return
  const t0 = c.currentTime + (o.start ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur)
  const peak = o.gain ?? 0.3
  const a = o.attack ?? 0.01
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + a)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
  osc.connect(g)
  g.connect(dest ?? sfxBus)
  osc.start(t0)
  osc.stop(t0 + o.dur + 0.05)
}

function noise(start: number, dur: number, gain: number, freq: number) {
  const c = getCtx()
  if (!c || !sfxBus) return
  const len = Math.max(1, Math.floor(c.sampleRate * dur))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  const g = c.createGain()
  g.gain.value = gain
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxBus)
  src.start(c.currentTime + start)
}

/** Horn built from detuned saw waves through a low-pass filter. */
function hornNotes(notes: [number, number, number][], cutoff = 2200, gain = 0.07) {
  const c = getCtx()
  if (!c || !sfxBus) return
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = cutoff
  lp.connect(sfxBus)
  for (const [f, start, dur] of notes) {
    for (const detune of [0, 3, -4]) tone({ type: 'sawtooth', freq: f + detune, start, dur, gain, attack: 0.04 }, lp)
    tone({ type: 'square', freq: f * 1.5, start, dur, gain: gain * 0.3, attack: 0.04 }, lp)
  }
}

/** Two-tone horn, in the style of a Swiss electric locomotive (high – low). */
const horn = () =>
  hornNotes([
    [466, 0, 0.42],
    [370, 0.45, 0.6],
  ])

/** Brighter two-tone horn for the mountain railways. */
const hornHigh = () =>
  hornNotes(
    [
      [587, 0, 0.3],
      [494, 0.33, 0.45],
    ],
    2800,
  )

/** Old locomotive: one deep, long tone. */
const hornOld = () => hornNotes([[294, 0, 1.0]], 1500, 0.08)

/** Little bell of a mountain railcar. */
const bell = () => {
  for (let i = 0; i < 3; i++) {
    tone({ freq: 1320, start: i * 0.32, dur: 0.6, gain: 0.18 })
    tone({ freq: 3170, start: i * 0.32, dur: 0.3, gain: 0.05 })
  }
}

/** Electric motor spinning up, with rail joints "tak-tak". */
function motorStart() {
  const c = getCtx()
  if (!c || !sfxBus) return
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(70, t0)
  osc.frequency.exponentialRampToValueAtTime(420, t0 + 2.6)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3)
  osc.connect(lp)
  lp.connect(g)
  g.connect(sfxBus)
  osc.start(t0)
  osc.stop(t0 + 3.1)
  ;[0.9, 1.05, 1.7, 1.83, 2.4, 2.5].forEach((s) => noise(s, 0.05, 0.5, 900))
}

export const sfx = {
  tap: () => tone({ freq: 660, to: 990, dur: 0.12, gain: 0.18 }),
  pop: () => tone({ type: 'triangle', freq: 400, to: 1200, dur: 0.15, gain: 0.25 }),
  back: () => tone({ type: 'triangle', freq: 700, to: 350, dur: 0.15, gain: 0.2 }),
  error: () => {
    tone({ type: 'triangle', freq: 300, dur: 0.18, gain: 0.2 })
    tone({ type: 'triangle', freq: 250, start: 0.15, dur: 0.25, gain: 0.2 })
  },
  horn,
  hornHigh,
  hornOld,
  bell,
  motorStart,
  /** Station chime, three notes (own melody). */
  gong: () => {
    const notes = [659, 523, 784]
    notes.forEach((f, i) => {
      tone({ freq: f, start: i * 0.38, dur: 1.4, gain: 0.22 })
      tone({ freq: f * 2.01, start: i * 0.38, dur: 0.7, gain: 0.05 })
    })
  },
  doorBeep: () => {
    for (let i = 0; i < 4; i++) tone({ type: 'square', freq: 1760, start: i * 0.22, dur: 0.12, gain: 0.06 })
  },
  reward: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', freq: f, start: i * 0.09, dur: 0.35, gain: 0.2 }))
    tone({ freq: 1568, start: 0.38, dur: 0.6, gain: 0.08 })
  },
  takTak: () => {
    ;[0, 0.12, 0.62, 0.74].forEach((s) => noise(s, 0.06, 0.6, 900))
  },
  whoosh: () => noise(0, 0.5, 0.4, 500),
}

// --- Background music: a quiet, self-made loop ---
let musicTimer: number | null = null

function scheduleBar(barStart: number, bar: number) {
  const c = getCtx()
  if (!c || !musicBus) return
  const beat = 0.5
  const melody = [
    [523, 587, 659, 784, 659, 587, 523, 440],
    [587, 659, 784, 880, 784, 659, 587, 659],
    [523, 659, 784, 659, 587, 523, 440, 392],
    [440, 523, 587, 659, 587, 523, 494, 523],
  ][bar % 4]
  const bass = [131, 147, 131, 110][bar % 4]
  melody.forEach((f, i) => {
    if (i % 2 === 1 && (bar + i) % 3 === 0) return // a few rests
    const t = barStart + i * beat
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = f
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9)
    osc.connect(g)
    g.connect(musicBus!)
    osc.start(t)
    osc.stop(t + beat)
  })
  const b = c.createOscillator()
  const bg = c.createGain()
  b.type = 'sine'
  b.frequency.value = bass
  bg.gain.setValueAtTime(0.0001, barStart)
  bg.gain.exponentialRampToValueAtTime(0.35, barStart + 0.05)
  bg.gain.exponentialRampToValueAtTime(0.0001, barStart + beat * 8)
  b.connect(bg)
  bg.connect(musicBus)
  b.start(barStart)
  b.stop(barStart + beat * 8)
}

function startMusic() {
  const c = getCtx()
  if (!c || musicTimer !== null) return
  let bar = 0
  let next = c.currentTime + 0.1
  const tick = () => {
    while (next < c.currentTime + 1) {
      scheduleBar(next, bar++)
      next += 4
    }
  }
  tick()
  musicTimer = window.setInterval(tick, 500)
}

function stopMusic() {
  if (musicTimer !== null) window.clearInterval(musicTimer)
  musicTimer = null
}

/** Plays the typical sound of a train (value of `sound` in the train data). */
export function playTrainSound(sound: string | undefined) {
  switch (sound) {
    case 'horn-high':
      return hornHigh()
    case 'horn-old':
      return hornOld()
    case 'bell':
      return bell()
    default:
      return horn()
  }
}
