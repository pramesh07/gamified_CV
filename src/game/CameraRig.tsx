import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import { arcadeCamera, TOUR_STOPS } from '../data/zones'
import { useGame } from '../store/useGame'
import { car, focus, panelRect } from './refs'

const INTRO_SECONDS = 2.4

/**
 * One camera, three behaviours:
 * - before start: slow orbit around the island (backdrop for the title screen)
 * - drive: chase cam behind the car
 * - tour: glides between fixed viewpoints for each stop
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const eye = useRef(new Vector3())
  const look = useRef(new Vector3())
  const startedAt = useRef<number | null>(null)
  const lastView = useRef('')
  const viewOffset = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const { phase, mode, tourIndex, projectIndex, panelOpen, activeZone } = useGame.getState()
    const camera = state.camera as PerspectiveCamera
    const time = state.clock.elapsedTime
    let smooth: number

    if (phase !== 'playing') {
      const angle = time * 0.06
      eye.current.set(Math.sin(angle) * 78, 40, Math.cos(angle) * 78)
      look.current.set(0, 0, -4)
      camera.position.copy(eye.current)
      focus.copy(look.current)
      camera.lookAt(focus)
      return
    }

    startedAt.current ??= time
    const intro = time - startedAt.current < INTRO_SECONDS

    if (mode === 'tour') {
      const stop = TOUR_STOPS[tourIndex]
      const view = stop.zone === 'projects' ? arcadeCamera(projectIndex) : stop.camera
      eye.current.set(...view.position)
      look.current.set(...view.target)
      const key = stop.zone === 'projects' ? `p${projectIndex}` : `s${tourIndex}`
      smooth = intro ? 1.1 : 0.7
      if (reducedMotion && lastView.current !== key) smooth = 0
      lastView.current = key
    } else {
      lastView.current = ''
      const fx = -Math.sin(car.yaw)
      const fz = -Math.cos(car.yaw)
      const distance = 10 + Math.abs(car.speed) * 0.18
      eye.current.set(car.position.x - fx * distance, car.position.y + 5.5, car.position.z - fz * distance)
      look.current.set(car.position.x + fx * 3, car.position.y + 1, car.position.z + fz * 3)
      smooth = intro ? 1.1 : 0.3
    }

    if (reducedMotion && intro) smooth = 0

    if (smooth === 0) {
      camera.position.copy(eye.current)
      focus.copy(look.current)
    } else {
      easing.damp3(camera.position, eye.current, smooth, delta)
      easing.damp3(focus, look.current, smooth * 0.8, delta)
    }
    camera.lookAt(focus)

    // Keep the subject centred in the part of the screen the zone panel doesn't cover:
    // the panel docks on the right on wide screens and across the top on phones.
    const { width, height } = state.size
    const panelVisible = panelOpen && (mode === 'tour' || activeZone !== null)
    let targetX = 0
    let targetY = 0
    if (panelVisible && panelRect.bottom > 0) {
      const dockedRight = panelRect.left > width * 0.3
      // A collapsed header barely covers anything, so only a tall panel pushes the view aside.
      if (dockedRight && panelRect.bottom - panelRect.top > height * 0.5) targetX = (width - panelRect.left) / 2
      if (!dockedRight) targetY = -Math.min(Math.max(0, panelRect.bottom - height * 0.3) / 2, height * 0.2)
    }
    viewOffset.current.x = MathUtils.damp(viewOffset.current.x, targetX, 4, delta)
    viewOffset.current.y = MathUtils.damp(viewOffset.current.y, targetY, 4, delta)
    const { x, y } = viewOffset.current
    if (Math.abs(x) + Math.abs(y) > 0.5) camera.setViewOffset(width, height, x, y, width, height)
    else if (camera.view?.enabled) camera.clearViewOffset()
  })

  return null
}
