import { useEffect, useRef, type PointerEvent } from 'react'
import { useCoarsePointer } from '../hooks/useCapability'
import { joystick } from '../store/input'
import { useGame } from '../store/useGame'

const RADIUS = 48

/** Dependency-free virtual joystick for touch screens: up/down = throttle, left/right = steer. */
export function TouchJoystick() {
  const coarse = useCoarsePointer()
  const visible = useGame((s) => s.phase === 'playing' && s.mode === 'drive')
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const shown = coarse && visible

  // Never leave the car driving on its own when the joystick disappears mid-drag.
  useEffect(() => {
    if (shown) return
    joystick.x = 0
    joystick.y = 0
  }, [shown])

  if (!shown) return null

  // The knob is moved directly on the DOM node: no React re-render per pointer move.
  const moveKnob = (dx: number, dy: number) => {
    joystick.x = dx / RADIUS
    joystick.y = -dy / RADIUS
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const update = (e: PointerEvent) => {
    const rect = base.current!.getBoundingClientRect()
    let dx = e.clientX - (rect.left + rect.width / 2)
    let dy = e.clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(dx, dy)
    if (length > RADIUS) {
      dx = (dx / length) * RADIUS
      dy = (dy / length) * RADIUS
    }
    moveKnob(dx, dy)
  }

  const release = () => moveKnob(0, 0)

  return (
    <div
      ref={base}
      className="joystick"
      aria-label="Drive joystick"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        // Driving off folds the zone panel back down so the road stays visible.
        useGame.getState().setPanelExpanded(false)
        update(e)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e)
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div ref={knob} className="joystick__knob" />
    </div>
  )
}
