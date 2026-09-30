import { projects, roles } from './cv'
import type { ZoneId } from './types'

export type Vec3 = [number, number, number]

export interface ZoneDef {
  id: ZoneId
  number: string
  label: string
  hint: string
  color: string
  /** Centre of the zone's sensor volume (it must contain `spawn` so fast travel lands inside). */
  center: Vec3
  /** Half-extents of the zone's sensor box. */
  halfExtents: Vec3
  /** Where fast travel / "take the wheel" drops the car (yaw 0 faces −z). */
  spawn: { position: Vec3; yaw: number }
  labelPosition: Vec3
}

/** Yaw that points the car's nose (−z at yaw 0) along the (dx, dz) direction. */
const yawToward = (dx: number, dz: number) => Math.atan2(-dx, -dz)

export const ISLAND_RADIUS = 60
export const WATER_LEVEL = -0.8

export const ZONES: Record<ZoneId, ZoneDef> = {
  spawn: {
    id: 'spawn',
    number: '01',
    label: 'Start',
    hint: 'Who I am',
    color: '#ffd166',
    center: [0, 1.5, 4],
    halfExtents: [10, 3, 10],
    spawn: { position: [0, 1, 12], yaw: 0 },
    labelPosition: [0, 11, -6],
  },
  skills: {
    id: 'skills',
    number: '02',
    label: 'Skill Forest',
    hint: 'Knock the crates over',
    color: '#39c38a',
    center: [-32, 1.5, -5],
    halfExtents: [16, 3, 13],
    spawn: { position: [-17, 1, -4], yaw: yawToward(-1, 0) },
    labelPosition: [-33, 10, -5],
  },
  career: {
    id: 'career',
    number: '03',
    label: 'Career Road',
    hint: '2017 to today',
    color: '#5b8cff',
    center: [32, 1.5, -7.5],
    halfExtents: [7, 3, 25.5],
    spawn: { position: [32, 1, 17], yaw: 0 },
    labelPosition: [32, 12, -8],
  },
  projects: {
    id: 'projects',
    number: '04',
    label: 'Project Arcade',
    hint: '9 machines, 9 projects',
    color: '#ff6b9a',
    center: [0, 1.5, -36],
    halfExtents: [13, 3, 13],
    spawn: { position: [0, 1, -24], yaw: 0 },
    labelPosition: [0, 10, -44],
  },
  campus: {
    id: 'campus',
    number: '05',
    label: 'Campus',
    hint: 'Education',
    color: '#b57bff',
    center: [-25, 1.5, 28],
    halfExtents: [13, 3, 11],
    spawn: { position: [-14, 1, 18], yaw: yawToward(-1, 1) },
    labelPosition: [-26, 12, 31],
  },
  contact: {
    id: 'contact',
    number: '06',
    label: 'Mailbox',
    hint: 'Say hello',
    color: '#ff8a4c',
    center: [24, 1.5, 28.5],
    halfExtents: [11, 3, 9.5],
    spawn: { position: [14, 1, 20], yaw: yawToward(1, 1) },
    labelPosition: [26, 9, 32],
  },
}

export const ZONE_ORDER: ZoneId[] = ['spawn', 'skills', 'career', 'projects', 'campus', 'contact']

/* ---------- Career Road layout ---------- */

export const CAREER_ROAD = { x: 32, zStart: 17, zEnd: -30, width: 6 }

/** One gate per role, oldest first, each taller than the last. */
export const CAREER_GATES = roles.map((_, i) => ({
  z: 6 - i * 14,
  height: 4.5 + i * 1.6,
}))

/* ---------- Project Arcade layout ---------- */

const ARCADE_CENTER = { x: 0, z: -30 }
const ARCADE_RADIUS = 13
const ARCADE_SPREAD = (120 * Math.PI) / 180

/** Cabinets sit on an arc north of the arcade centre, all facing it. */
export function arcadeSlot(index: number, radius = ARCADE_RADIUS) {
  const t = projects.length === 1 ? 0.5 : index / (projects.length - 1)
  const angle = -ARCADE_SPREAD / 2 + t * ARCADE_SPREAD
  const x = ARCADE_CENTER.x + Math.sin(angle) * radius
  const z = ARCADE_CENTER.z - Math.cos(angle) * radius
  return { position: [x, 0, z] as Vec3, rotationY: -angle }
}

/* ---------- Guided tour ---------- */

export interface TourStop {
  zone: ZoneId
  /** Role index for career stops. */
  item?: number
  title: string
  camera: { position: Vec3; target: Vec3 }
}

export const TOUR_STOPS: TourStop[] = [
  { zone: 'spawn', title: 'Welcome', camera: { position: [10, 6, 17], target: [0, 4, -6] } },
  { zone: 'skills', title: 'Skill Forest', camera: { position: [-13, 8, 4], target: [-33, 1.5, -6] } },
  ...roles.map<TourStop>((role, i) => {
    const gate = CAREER_GATES[i]
    return {
      zone: 'career',
      item: i,
      title: role.company,
      camera: {
        position: [CAREER_ROAD.x - 9, 4 + gate.height * 0.3, gate.z + 11],
        target: [CAREER_ROAD.x, gate.height * 0.6, gate.z],
      },
    }
  }),
  { zone: 'projects', title: 'Project Arcade', camera: { position: [0, 5, -24], target: [0, 2, -40] } },
  { zone: 'campus', title: 'Campus', camera: { position: [-11, 7, 14], target: [-26, 3, 31] } },
  { zone: 'contact', title: 'Mailbox', camera: { position: [15, 5, 18], target: [26, 2.5, 32] } },
]

/** Tour camera for the arcade follows the selected cabinet. */
export function arcadeCamera(projectIndex: number) {
  const cabinet = arcadeSlot(projectIndex)
  const eye = arcadeSlot(projectIndex, ARCADE_RADIUS - 8.5)
  return {
    position: [eye.position[0], 3.6, eye.position[2]] as Vec3,
    target: [cabinet.position[0], 1.9, cabinet.position[2]] as Vec3,
  }
}

/** Dirt paths from the spawn plaza out to each zone. */
export const PATHS: [number, number][][] = [
  [
    [0, 2],
    [0, -12],
    [0, -24],
  ],
  [
    [3, 3],
    [14, 8],
    [26, 14],
    [32, 17],
  ],
  [
    [-3, 1],
    [-10, -2],
    [-18, -4],
  ],
  [
    [-3, 6],
    [-8, 12],
    [-14, 18],
  ],
  [
    [3, 7],
    [8, 14],
    [14, 20],
  ],
]
