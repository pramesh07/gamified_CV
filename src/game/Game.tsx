import { useEffect } from 'react'
import { initAudio, useSound } from '../audio/sound'
import { useGame } from '../store/useGame'
import { ControlsHint } from '../ui/ControlsHint'
import { HUD } from '../ui/HUD'
import { Toast } from '../ui/Toast'
import { TouchJoystick } from '../ui/TouchJoystick'
import { TourControls } from '../ui/TourControls'
import { ZonePanel } from '../ui/ZonePanel'
import { GameCanvas } from './GameCanvas'

const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

/** Global keys: Esc closes the panel, M mutes, ←/→ step the tour, and driving keys never scroll the page. */
function useGlobalKeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useGame.getState()
      if (s.phase !== 'playing') return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return

      if (e.key === 'Escape') s.setPanelOpen(false)
      if ((e.key === 'm' || e.key === 'M') && !e.repeat) useSound.getState().toggleMuted()
      if (NAV_KEYS.includes(e.key)) e.preventDefault()
      // Space is the brake while driving; don't let it also press a focused HUD button.
      if (e.key === ' ' && (s.mode === 'drive' || !target.closest('button, a'))) e.preventDefault()

      if (s.mode === 'tour' && !e.repeat) {
        if (e.key === 'ArrowRight') s.nextStop()
        if (e.key === 'ArrowLeft') s.prevStop()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

/** Everything that needs three.js lives behind this lazy-loaded entry. */
export default function Game() {
  useGlobalKeys()
  useEffect(initAudio, [])
  return (
    <>
      <GameCanvas />
      <HUD />
      <ZonePanel />
      <TourControls />
      <TouchJoystick />
      <ControlsHint />
      <Toast />
    </>
  )
}
