import { create } from 'zustand'
import { useGame } from '../store/useGame'

/**
 * All sound is synthesised with the Web Audio API — no audio files to download.
 * The context can only start after a user gesture, so nothing plays until the first click or key press.
 */

const STORAGE_KEY = 'cv-island:muted'
const MASTER_VOLUME = 0.8

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

interface SoundState {
  muted: boolean
  toggleMuted: () => void
}

export const useSound = create<SoundState>()((set, get) => ({
  muted: readMuted(),
  toggleMuted: () => {
    const muted = !get().muted
    set({ muted })
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
    } catch {
      // Storage blocked (private window); the setting just won't persist.
    }
  },
}))

let ctx: AudioContext | null = null
let master: GainNode
let sfxBus: GainNode
let noise: AudioBuffer
let engine: { osc: OscillatorNode; gain: GainNode } | null = null

function createNoise(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** One soft, low-passed triangle wave: a faint hum that only shows up while the car moves. */
function createEngine(context: AudioContext) {
  const osc = context.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = 55
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 400
  const gain = context.createGain()
  gain.gain.value = 0
  osc.connect(filter).connect(gain).connect(master)
  osc.start()
  return { osc, gain }
}

/** Filtered noise whose volume swells and recedes slowly, like waves on the shore. */
function createWaves(context: AudioContext) {
  const src = context.createBufferSource()
  src.buffer = noise
  src.loop = true
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  const gain = context.createGain()
  gain.gain.value = 0.035
  const swell = context.createOscillator()
  swell.frequency.value = 0.12
  const depth = context.createGain()
  depth.gain.value = 0.025
  swell.connect(depth).connect(gain.gain)
  src.connect(filter).connect(gain).connect(master)
  src.start()
  swell.start()
}

function ensureContext() {
  if (ctx) {
    if (ctx.state === 'suspended' && !document.hidden) void ctx.resume()
    return
  }
  const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  ctx = new Ctor()
  noise = createNoise(ctx)
  master = ctx.createGain()
  master.gain.value = useSound.getState().muted ? 0 : MASTER_VOLUME
  master.connect(ctx.destination)
  sfxBus = ctx.createGain()
  sfxBus.gain.value = 0.9
  sfxBus.connect(master)
  createWaves(ctx)
  engine = createEngine(ctx)
}

/** Short pitched note with a quick attack and exponential decay. */
function tone(type: OscillatorType, freq: number, delay: number, duration: number, volume: number, endFreq?: number) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(sfxBus)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

/** Noise through a filter whose cutoff follows `sweep` (frequencies spread evenly over the duration). */
function noiseBurst(type: BiquadFilterType, sweep: number[], duration: number, volume: number, delay = 0) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.Q.value = type === 'bandpass' ? 1.4 : 0.7
  sweep.forEach((f, i) => {
    const at = t + (duration * i) / Math.max(sweep.length - 1, 1)
    if (i === 0) filter.frequency.setValueAtTime(f, at)
    else filter.frequency.exponentialRampToValueAtTime(f, at)
  })
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + duration * 0.25)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(filter).connect(gain).connect(sfxBus)
  src.start(t, Math.random() * 1.5)
  src.stop(t + duration + 0.05)
}

export const sfx = {
  /** Soft tick for HUD buttons and links. */
  click: () => tone('sine', 1400, 0, 0.05, 0.05, 900),
  /** Rising arpeggio when the game starts. */
  start: () => [392, 523.25, 659.25, 783.99].forEach((f, i) => tone('triangle', f, i * 0.07, 0.35, 0.12)),
  /** Sparkly chime for discovering a zone. */
  discover: () =>
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone('sine', f, i * 0.08, 0.6, 0.12)
      tone('triangle', f * 2, i * 0.08, 0.3, 0.03)
    }),
  /** Two-note blip for selecting a career gate or arcade pad. */
  select: () => {
    tone('square', 660, 0, 0.08, 0.04)
    tone('square', 990, 0.07, 0.12, 0.04)
  },
  /** Air whoosh for tour stops and fast travel. */
  whoosh: () => noiseBurst('bandpass', [300, 1800, 350], 0.6, 0.22),
  /** Falling in the sea. */
  splash: () => {
    noiseBurst('lowpass', [4000, 1200, 200], 0.9, 0.35)
    tone('sine', 220, 0, 0.4, 0.15, 60)
  },
  /** A few hollow thumps as the crates tumble back into place. */
  crates: () => {
    for (let i = 0; i < 5; i++) tone('sine', 140 + Math.random() * 60, i * 0.09 + Math.random() * 0.04, 0.18, 0.12, 60)
  },
}

const ENGINE_VOLUME = 0.035

/** Called every frame by the vehicle. `load` is speed as a fraction of top speed (negative in reverse). */
export function updateEngine(load: number, active: boolean) {
  if (!ctx || !engine) return
  const l = Math.min(Math.abs(load), 1)
  const t = ctx.currentTime
  engine.osc.frequency.setTargetAtTime(55 + l * 65, t, 0.1)
  engine.gain.gain.setTargetAtTime(active ? Math.sqrt(l) * ENGINE_VOLUME : 0, t, 0.15)
}

let initialised = false

/** Wires audio to user gestures, the game store and tab visibility. Safe to call more than once. */
export function initAudio() {
  if (initialised) return
  initialised = true

  window.addEventListener('pointerdown', ensureContext, { capture: true })
  window.addEventListener('keydown', ensureContext, { capture: true })
  window.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement | null)?.closest('button, a')) sfx.click()
    },
    { capture: true },
  )

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else void ctx.resume()
  })

  useSound.subscribe((s) => {
    if (ctx) master.gain.setTargetAtTime(s.muted ? 0 : MASTER_VOLUME, ctx.currentTime, 0.05)
  })

  useGame.subscribe((s, p) => {
    if (s.phase === 'playing' && p.phase !== 'playing') {
      sfx.start()
      return
    }
    if (s.phase !== 'playing') return

    const touring = s.mode === 'tour'
    if (s.tourIndex !== p.tourIndex || (touring && p.mode !== 'tour')) sfx.whoosh()
    else if (s.travel !== p.travel) sfx.whoosh()
    else if (s.careerIndex !== p.careerIndex || s.projectIndex !== p.projectIndex) sfx.select()

    // The first zone is "discovered" as the game starts; the start jingle already covers it.
    if (!touring && p.discovered.length > 0 && s.discovered.length > p.discovered.length) sfx.discover()
    if (s.restackNonce !== p.restackNonce) sfx.crates()
  })
}
