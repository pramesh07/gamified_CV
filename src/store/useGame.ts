import { create } from 'zustand'
import { TOUR_STOPS, ZONES } from '../data/zones'
import type { ZoneId } from '../data/types'

type Phase = 'loading' | 'ready' | 'playing'
type Mode = 'drive' | 'tour'
type Quality = 'high' | 'low'

interface Toast {
  id: number
  text: string
}

interface GameState {
  phase: Phase
  mode: Mode
  quality: Quality
  tourIndex: number
  /** Zone the car is currently inside (drive mode). */
  activeZone: ZoneId | null
  careerIndex: number
  projectIndex: number
  discovered: ZoneId[]
  panelOpen: boolean
  /** On phones the panel starts as a slim header; the player expands it to read. */
  panelExpanded: boolean
  toast: Toast | null
  /** Bumped to ask the car to teleport; read by the Vehicle. */
  travel: { zone: ZoneId; nonce: number } | null
  /** Bumped to rebuild the skill crate stacks. */
  restackNonce: number

  setReady: () => void
  start: (mode: Mode) => void
  startTour: () => void
  takeWheel: () => void
  goToStop: (index: number) => void
  nextStop: () => void
  prevStop: () => void
  enterZone: (zone: ZoneId) => void
  exitZone: (zone: ZoneId) => void
  selectCareer: (index: number) => void
  selectProject: (index: number) => void
  travelTo: (zone: ZoneId) => void
  setPanelOpen: (open: boolean) => void
  setPanelExpanded: (expanded: boolean) => void
  showToast: (text: string) => void
  restack: () => void
  setQuality: (quality: Quality) => void
}

function syncHash(mode: Mode) {
  const url = mode === 'tour' ? '#tour' : window.location.pathname + window.location.search
  window.history.replaceState(null, '', url)
}

const withDiscovered = (list: ZoneId[], zone: ZoneId) => (list.includes(zone) ? list : [...list, zone])

let toastId = 0

export const useGame = create<GameState>()((set, get) => ({
  phase: 'loading',
  mode: 'drive',
  quality: 'high',
  tourIndex: 0,
  activeZone: null,
  careerIndex: 0,
  projectIndex: 0,
  discovered: [],
  panelOpen: false,
  panelExpanded: false,
  toast: null,
  travel: null,
  restackNonce: 0,

  setReady: () => {
    if (get().phase === 'loading') set({ phase: 'ready' })
  },

  start: (mode) => {
    set({ phase: 'playing' })
    if (mode === 'tour') get().startTour()
    else {
      // The car is parked on the start line, inside the spawn zone, when the game begins.
      set((s) => ({
        mode: 'drive',
        activeZone: 'spawn',
        panelOpen: true,
        panelExpanded: false,
        discovered: withDiscovered(s.discovered, 'spawn'),
      }))
      syncHash('drive')
    }
  },

  startTour: () => {
    // Resume the tour at the zone the car is in, so switching modes feels continuous.
    const { activeZone } = get()
    const index = activeZone ? TOUR_STOPS.findIndex((s) => s.zone === activeZone) : 0
    set({ mode: 'tour', activeZone: null })
    syncHash('tour')
    get().goToStop(Math.max(0, index))
  },

  takeWheel: () => {
    const stop = TOUR_STOPS[get().tourIndex]
    // Set the zone directly: if the car is already parked inside it, no sensor event will fire.
    set({ mode: 'drive', activeZone: stop.zone, panelOpen: false, panelExpanded: false })
    syncHash('drive')
    get().travelTo(stop.zone)
  },

  goToStop: (index) => {
    const i = (index + TOUR_STOPS.length) % TOUR_STOPS.length
    const stop = TOUR_STOPS[i]
    set((s) => ({
      tourIndex: i,
      panelOpen: true,
      discovered: withDiscovered(s.discovered, stop.zone),
      ...(stop.item !== undefined && stop.zone === 'career' ? { careerIndex: stop.item } : {}),
    }))
  },
  nextStop: () => get().goToStop(get().tourIndex + 1),
  prevStop: () => get().goToStop(get().tourIndex - 1),

  enterZone: (zone) => {
    const { phase, mode, discovered } = get()
    if (phase !== 'playing' || mode !== 'drive') return
    set((s) => ({
      activeZone: zone,
      panelOpen: true,
      panelExpanded: false,
      discovered: withDiscovered(s.discovered, zone),
    }))
    if (!discovered.includes(zone)) get().showToast(`Zone discovered: ${ZONES[zone].label}`)
  },

  exitZone: (zone) => {
    if (get().activeZone === zone) set({ activeZone: null })
  },

  selectCareer: (index) => {
    set({ careerIndex: index, panelOpen: true })
    if (get().mode === 'tour') {
      const stop = TOUR_STOPS.findIndex((s) => s.zone === 'career' && s.item === index)
      if (stop >= 0) set({ tourIndex: stop })
    }
  },

  selectProject: (index) => set({ projectIndex: index, panelOpen: true }),

  travelTo: (zone) => {
    const nonce = (get().travel?.nonce ?? 0) + 1
    set({ travel: { zone, nonce } })
  },

  setPanelOpen: (open) => set({ panelOpen: open }),

  setPanelExpanded: (expanded) => set({ panelExpanded: expanded }),

  showToast: (text) => set({ toast: { id: ++toastId, text } }),

  restack: () => set((s) => ({ restackNonce: s.restackNonce + 1 })),

  setQuality: (quality) => set({ quality }),
}))

/** Which zone's panel is showing right now, in either mode. */
export function usePanelZone(): ZoneId | null {
  return useGame((s) => (s.mode === 'tour' ? TOUR_STOPS[s.tourIndex].zone : s.activeZone))
}
