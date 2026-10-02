import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useKeyboardControls } from '@react-three/drei'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { ExtrudeGeometry, MathUtils, MeshStandardMaterial, Shape, type Group } from 'three'
import { WATER_LEVEL, ZONES } from '../data/zones'
import type { ZoneId } from '../data/types'
import { joystick } from '../store/input'
import { sfx, updateEngine } from '../audio/sound'
import { useGame } from '../store/useGame'
import type { Controls } from './controls/keymap'
import { car, FONT_BOLD } from './refs'

const MAX_FORWARD = 17
const MAX_REVERSE = 7
const ACCELERATION = 20
const BRAKING = 42
const DRAG = 9
const TURN_RATE = 2.3
const WHEEL_RADIUS = 0.42

const BODY_COLOR = '#ff8a4c'
const TRIM_COLOR = '#1c2a3a'
const STRIPE_COLOR = '#fff4e6'
const BODY_WIDTH = 1.7
const BODY_BEVEL = 0.05
const WHEEL_ARCH = 0.47

type Point = [z: number, y: number]

// Side profile of the body, front (-z) to rear (+z): nose, hood, windshield, roof, rear glass, trunk.
const NOSE: [Point, Point] = [
  [-1.56, 0.28],
  [-1.44, 0.54],
]
const WINDSHIELD: [Point, Point] = [
  [-0.52, 0.62],
  [-0.12, 1.0],
]
const REAR_GLASS: [Point, Point] = [
  [0.72, 1.0],
  [1.22, 0.66],
]
const TOP_LINE: Point[] = [...NOSE, ...WINDSHIELD, ...REAR_GLASS, [1.52, 0.6], [1.56, 0.24]]

/**
 * Extrudes a side profile (z, y) across the car's width, centred on x = 0.
 * `bevel` grows the outline (rounded edges); `edge` is how far that rounding eats into the width.
 */
function extrudeProfile(points: Point[], width: number, { bevel = 0, edge = 0, arches = false } = {}) {
  const shape = new Shape()
  shape.moveTo(...points[0])
  points.slice(1).forEach(([z, y]) => shape.lineTo(z, y))
  if (arches) {
    // Cut a wheel arch over each axle, walking the underside from rear to front.
    for (const axle of [WHEELS[2][2], WHEELS[0][2]]) {
      shape.lineTo(axle + WHEEL_ARCH, -0.02)
      shape.absarc(axle, WHEELS[0][1], WHEEL_ARCH, 0, Math.PI, false)
      shape.lineTo(axle - WHEEL_ARCH, -0.02)
    }
  }
  shape.closePath()
  const depth = width - edge * 2
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: edge,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.rotateY(-Math.PI / 2)
  return geometry
}

/** Where to put a flat panel lying on one slope of the profile, nudged out past the bevel. */
function onSlope([z1, y1]: Point, [z2, y2]: Point, offset: number) {
  // A box laid along the slope: local z follows the slope, local y points out of the paint.
  const dz = z2 - z1
  const dy = y2 - y1
  const length = Math.hypot(dz, dy)
  return {
    position: [0, (y1 + y2) / 2 + (dz / length) * offset, (z1 + z2) / 2 - (dy / length) * offset] as const,
    rotationX: Math.atan2(-dy, dz),
    length,
  }
}
const WHEELS: [number, number, number][] = [
  [-0.86, 0.02, -0.95],
  [0.86, 0.02, -0.95],
  [-0.86, 0.02, 0.95],
  [0.86, 0.02, 0.95],
]

const BODY = extrudeProfile([[-1.5, -0.02], ...TOP_LINE, [1.5, -0.02]], BODY_WIDTH, {
  bevel: BODY_BEVEL,
  edge: 0.06,
  arches: true,
})

// Twin stripes over the hood, roof and trunk, skipping the glass. Each piece is a band hanging
// under a stretch of the top line, grown just proud of the paint so only its top shows.
const STRIPE_RUNS: Point[][] = [
  [NOSE[1], WINDSHIELD[0]],
  [WINDSHIELD[1], REAR_GLASS[0]],
  [REAR_GLASS[1], [1.52, 0.6]],
]
const STRIPES = STRIPE_RUNS.map((top) =>
  extrudeProfile([...top, ...[...top].reverse().map(([z, y]): Point => [z, y - 0.12])], 0.15, {
    bevel: BODY_BEVEL + 0.008,
    edge: 0.004,
  }),
)

// Side windows go straight through the body and show on both flanks, split by a B-pillar.
const SIDE_GLASS = [
  extrudeProfile(
    [
      [-0.4, 0.68],
      [-0.12, 0.94],
      [0.26, 0.94],
      [0.26, 0.68],
    ],
    BODY_WIDTH + 0.02,
  ),
  extrudeProfile(
    [
      [0.36, 0.68],
      [0.36, 0.94],
      [0.74, 0.94],
      [1.1, 0.68],
    ],
    BODY_WIDTH + 0.02,
  ),
]
const SLOPED_GLASS = [onSlope(...WINDSHIELD, 0.07), onSlope(...REAR_GLASS, 0.07)]
// A cylinder's axis is its local y, which onSlope turns to face straight out of the nose.
const HEADLIGHT_TILT = onSlope(...NOSE, 0).rotationX

// One material for both tail lights so braking lights them together.
const TAIL_LIGHTS = new MeshStandardMaterial({ color: '#ff3b3b', emissive: '#ff2a2a', emissiveIntensity: 1.2 })

const moveTowards = (value: number, target: number, step: number) =>
  Math.abs(target - value) <= step ? target : value + Math.sign(target - value) * step

export function Vehicle() {
  const body = useRef<RapierRigidBody>(null)
  const chassis = useRef<Group>(null)
  const wheels = useRef<(Group | null)[]>([])
  const flag = useRef<Group>(null)
  const wheelSpin = useRef(0)
  const steerAngle = useRef(0)
  const resetHeld = useRef(false)
  const [, getKeys] = useKeyboardControls<Controls>()

  const place = useCallback((zone: ZoneId) => {
    const b = body.current
    if (!b) return
    const { position, yaw } = ZONES[zone].spawn
    b.setTranslation({ x: position[0], y: position[1], z: position[2] }, true)
    b.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }, true)
    b.setLinvel({ x: 0, y: 0, z: 0 }, true)
    b.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }, [])

  useEffect(() => {
    car.body = body.current
    return () => {
      car.body = null
    }
  }, [])

  // Fast travel / "take the wheel" requests come through the store.
  useEffect(
    () =>
      useGame.subscribe((state, prev) => {
        if (state.travel && state.travel !== prev.travel) place(state.travel.zone)
      }),
    [place],
  )

  useFrame((state, rawDelta) => {
    const b = body.current
    if (!b) return
    const delta = Math.min(rawDelta, 1 / 30)
    const { mode, phase, activeZone, showToast } = useGame.getState()
    const t = b.translation()

    if (t.y < WATER_LEVEL - 0.7) {
      place('spawn')
      sfx.splash()
      showToast('Splash! Back to the start line.')
      return
    }

    const keys = getKeys()
    const canDrive = phase === 'playing' && mode === 'drive'
    let throttle = 0
    let steer = 0
    let braking = !canDrive
    if (canDrive) {
      throttle = MathUtils.clamp((keys.forward ? 1 : 0) - (keys.back ? 1 : 0) + joystick.y, -1, 1)
      steer = MathUtils.clamp((keys.left ? 1 : 0) - (keys.right ? 1 : 0) - joystick.x, -1, 1)
      braking = keys.brake
      if (keys.reset && !resetHeld.current) place(activeZone ?? 'spawn')
      resetHeld.current = keys.reset
    }

    // Rotation is locked to the y axis, so yaw can be read straight from the quaternion.
    const q = b.rotation()
    const yaw = 2 * Math.atan2(q.y, q.w)
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const velocity = b.linvel()
    let speed = velocity.x * fx + velocity.z * fz
    const grounded = t.y < 1.2 && Math.abs(velocity.y) < 4

    if (grounded) {
      const target = braking ? 0 : throttle > 0 ? throttle * MAX_FORWARD : throttle * MAX_REVERSE
      const reversing = target !== 0 && Math.sign(target) !== Math.sign(speed) && Math.abs(speed) > 0.5
      const rate = braking || reversing ? BRAKING : throttle === 0 ? DRAG : ACCELERATION
      speed = moveTowards(speed, target, rate * delta)
      const grip = MathUtils.clamp(Math.abs(speed) / 5, 0, 1) * Math.sign(speed || 1)
      b.setLinvel({ x: fx * speed, y: velocity.y, z: fz * speed }, true)
      b.setAngvel({ x: 0, y: steer * TURN_RATE * grip, z: 0 }, true)
    }

    car.position.set(t.x, t.y, t.z)
    car.yaw = yaw
    car.speed = speed
    updateEngine(speed / MAX_FORWARD, canDrive)

    // Cosmetics: wheel spin, front-wheel steering, body roll, brake lights.
    wheelSpin.current -= (speed * delta) / WHEEL_RADIUS
    steerAngle.current = MathUtils.damp(steerAngle.current, steer * 0.45, 12, delta)
    wheels.current.forEach((wheel, i) => {
      if (!wheel) return
      wheel.rotation.set(wheelSpin.current, i < 2 ? steerAngle.current : 0, 0, 'YXZ')
    })
    if (chassis.current) {
      const roll = -steer * MathUtils.clamp(Math.abs(speed) / MAX_FORWARD, 0, 1) * 0.08
      chassis.current.rotation.z = MathUtils.damp(chassis.current.rotation.z, roll, 8, delta)
      const pitch = (throttle * 0.03 - (braking ? 0.04 : 0)) * (grounded ? 1 : 0)
      chassis.current.rotation.x = MathUtils.damp(chassis.current.rotation.x, pitch, 6, delta)
    }
    TAIL_LIGHTS.emissiveIntensity = braking || throttle < 0 ? 4 : 1.2
    if (flag.current) {
      // Flutters faster and streams further back the quicker the car goes.
      const pace = MathUtils.clamp(Math.abs(speed) / MAX_FORWARD, 0, 1)
      const time = state.clock.elapsedTime
      flag.current.rotation.y = Math.sin(time * (4 + pace * 10)) * (0.15 + pace * 0.3) + pace * 0.5
    }
  })

  const { position, yaw } = ZONES.spawn.spawn

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      rotation={[0, yaw, 0]}
      enabledRotations={[false, true, false]}
      linearDamping={0.2}
      angularDamping={4}
      ccd
      canSleep={false}
    >
      <CuboidCollider args={[0.85, 0.4, 1.45]} friction={0.3} density={2} />

      <group ref={chassis}>
        {/* Body shell, with wheel arches cut into the profile */}
        <mesh castShadow receiveShadow geometry={BODY}>
          <meshStandardMaterial color={BODY_COLOR} flatShading roughness={0.45} />
        </mesh>
        {/* Racing stripes over hood, roof and trunk */}
        {[-0.15, 0.15].flatMap((x) =>
          STRIPES.map((geometry, i) => (
            <mesh key={`${x}-${i}`} geometry={geometry} position-x={x}>
              <meshStandardMaterial color={STRIPE_COLOR} flatShading roughness={0.5} />
            </mesh>
          )),
        )}
        {/* Glass: side windows, windshield, rear window */}
        {SIDE_GLASS.map((geometry, i) => (
          <mesh key={i} geometry={geometry}>
            <meshStandardMaterial color="#22344a" roughness={0.15} metalness={0.3} />
          </mesh>
        ))}
        {SLOPED_GLASS.map(({ position, rotationX, length }, i) => (
          <mesh key={i} position={position} rotation-x={rotationX}>
            <boxGeometry args={[1.38, 0.015, length * 0.84]} />
            <meshStandardMaterial color="#22344a" roughness={0.15} metalness={0.3} />
          </mesh>
        ))}
        {/* Side skirts between the arches */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[BODY_WIDTH + 0.04, 0.12, 0.9]} />
          <meshStandardMaterial color={TRIM_COLOR} flatShading />
        </mesh>
        {/* Bumpers */}
        {[-1.56, 1.56].map((z) => (
          <mesh key={z} castShadow position={[0, 0.08, z]}>
            <boxGeometry args={[1.62, 0.16, 0.16]} />
            <meshStandardMaterial color={TRIM_COLOR} flatShading roughness={0.7} />
          </mesh>
        ))}
        {/* Grille */}
        <mesh position={[0, 0.3, -1.6]}>
          <boxGeometry args={[0.62, 0.12, 0.04]} />
          <meshStandardMaterial color={TRIM_COLOR} />
        </mesh>
        {/* Headlights */}
        {[-0.54, 0.54].map((x) => (
          <mesh key={x} position={[x, 0.4, -1.55]} rotation-x={HEADLIGHT_TILT}>
            <cylinderGeometry args={[0.13, 0.13, 0.06, 14]} />
            <meshStandardMaterial color="#fff6d5" emissive="#fff1c1" emissiveIntensity={3} />
          </mesh>
        ))}
        {/* Tail lights */}
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.44, 1.6]} material={TAIL_LIGHTS}>
            <boxGeometry args={[0.38, 0.13, 0.04]} />
          </mesh>
        ))}
        {/* Plate */}
        <mesh position={[0, 0.28, 1.61]}>
          <boxGeometry args={[0.58, 0.17, 0.03]} />
          <meshStandardMaterial color={STRIPE_COLOR} />
        </mesh>
        <Text
          font={FONT_BOLD}
          position={[0, 0.28, 1.63]}
          fontSize={0.11}
          color={TRIM_COLOR}
          anchorX="center"
          anchorY="middle"
        >
          PK · 2017
        </Text>
        {/* Exhausts */}
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, -0.02, 1.62]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.06, 0.06, 0.14, 10]} />
            <meshStandardMaterial color="#9aa3b2" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
        {/* Spoiler on two struts */}
        <mesh castShadow position={[0, 0.8, 1.4]}>
          <boxGeometry args={[1.5, 0.04, 0.24]} />
          <meshStandardMaterial color={TRIM_COLOR} flatShading />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.72, 1.4]}>
            <boxGeometry args={[0.05, 0.14, 0.08]} />
            <meshStandardMaterial color={TRIM_COLOR} />
          </mesh>
        ))}
        {/* Wing mirrors */}
        {[-1, 1].map((side) => (
          <mesh key={side} castShadow position={[side * 0.9, 0.72, -0.42]}>
            <boxGeometry args={[0.16, 0.11, 0.08]} />
            <meshStandardMaterial color={BODY_COLOR} flatShading />
          </mesh>
        ))}
        {/* Antenna flag */}
        <mesh position={[0.55, 1.4, 0.62]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <group ref={flag} position={[0.55, 1.65, 0.62]}>
          <mesh position-x={0.17}>
            <boxGeometry args={[0.32, 0.2, 0.02]} />
            <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {WHEELS.map((p, i) => (
        <group
          key={i}
          position={p}
          ref={(el) => {
            wheels.current[i] = el
          }}
        >
          {/* Tyre, dark rim, three crossed spokes and a body-coloured hub cap */}
          <mesh castShadow rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.34, 16]} />
            <meshStandardMaterial color="#1d1d22" flatShading roughness={0.9} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.25, 0.25, 0.36, 12]} />
            <meshStandardMaterial color="#3a3f4b" flatShading />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} rotation-x={(k * Math.PI) / 3}>
              <boxGeometry args={[0.37, 0.44, 0.06]} />
              <meshStandardMaterial color="#d8dde6" metalness={0.4} roughness={0.35} />
            </mesh>
          ))}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.39, 8]} />
            <meshStandardMaterial color={BODY_COLOR} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  )
}
