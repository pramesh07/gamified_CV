import { Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import fontBoldUrl from '../assets/fonts/space-grotesk-700.woff'
import fontMediumUrl from '../assets/fonts/space-grotesk-500.woff'

/** Live vehicle state shared with the camera, sun and sensors without re-rendering React. */
export const car = {
  body: null as RapierRigidBody | null,
  position: new Vector3(0, 1, 12),
  yaw: 0,
  speed: 0,
}

/** World point the camera is looking at; the sun's shadow frustum follows it. */
export const focus = new Vector3()

export const isCar = (body?: RapierRigidBody) => !!body && !!car.body && body.handle === car.body.handle

// troika-three-text loads fonts from a worker, so it needs absolute URLs.
export const FONT_BOLD = new URL(fontBoldUrl, document.baseURI).href
export const FONT_MEDIUM = new URL(fontMediumUrl, document.baseURI).href
