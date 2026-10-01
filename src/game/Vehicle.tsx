import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useKeyboardControls } from '@react-three/drei'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { MathUtils, type Group, type MeshStandardMaterial } from 'three'
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
const WHEELS: [number, number, number][] = [
  [-0.86, 0.02, -0.95],
  [0.86, 0.02, -0.95],
  [-0.86, 0.02, 0.95],
  [0.86, 0.02, 0.95],
]

const moveTowards = (value: number, target: number, step: number) =>
  Math.abs(target - value) <= step ? target : value + Math.sign(target - value) * step

export function Vehicle() {
  const body = useRef<RapierRigidBody>(null)
  const chassis = useRef<Group>(null)
  const wheels = useRef<(Group | null)[]>([])
  const tailLights = useRef<MeshStandardMaterial>(null)
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

  useFrame((_, rawDelta) => {
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
    if (tailLights.current) {
      tailLights.current.emissiveIntensity = braking || throttle < 0 ? 4 : 1.2
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
        {/* Body */}
        <mesh castShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[1.7, 0.55, 2.9]} />
          <meshStandardMaterial color={BODY_COLOR} flatShading roughness={0.5} />
        </mesh>
        {/* Cabin glass + roof */}
        <mesh castShadow position={[0, 0.6, 0.2]}>
          <boxGeometry args={[1.42, 0.46, 1.45]} />
          <meshStandardMaterial color="#1c2a3a" roughness={0.15} metalness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.86, 0.2]}>
          <boxGeometry args={[1.5, 0.08, 1.55]} />
          <meshStandardMaterial color={BODY_COLOR} flatShading />
        </mesh>
        {/* Racing stripe */}
        <mesh position={[0, 0.405, -0.7]}>
          <boxGeometry args={[0.36, 0.02, 1.4]} />
          <meshStandardMaterial color="#fff4e6" />
        </mesh>
        {/* Headlights */}
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.18, -1.46]}>
            <boxGeometry args={[0.36, 0.16, 0.04]} />
            <meshStandardMaterial color="#fff6d5" emissive="#fff1c1" emissiveIntensity={3} />
          </mesh>
        ))}
        {/* Tail lights */}
        <mesh position={[0, 0.2, 1.46]}>
          <boxGeometry args={[1.3, 0.12, 0.04]} />
          <meshStandardMaterial ref={tailLights} color="#ff3b3b" emissive="#ff2a2a" emissiveIntensity={1.2} />
        </mesh>
        {/* Plate */}
        <Text
          font={FONT_BOLD}
          position={[0, -0.02, 1.47]}
          fontSize={0.16}
          color="#1c2a3a"
          anchorX="center"
          anchorY="middle"
        >
          PK · 2017
        </Text>
        {/* Spoiler */}
        <mesh castShadow position={[0, 0.62, 1.3]}>
          <boxGeometry args={[1.6, 0.06, 0.34]} />
          <meshStandardMaterial color="#1c2a3a" />
        </mesh>
        {/* Antenna flag */}
        <mesh position={[0.55, 1.2, 0.8]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.72, 1.45, 0.8]}>
          <boxGeometry args={[0.32, 0.2, 0.02]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {WHEELS.map((p, i) => (
        <group
          key={i}
          position={p}
          ref={(el) => {
            wheels.current[i] = el
          }}
        >
          <mesh castShadow rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.34, 10]} />
            <meshStandardMaterial color="#1d1d22" flatShading />
          </mesh>
          <mesh rotation-z={Math.PI / 2} position-x={p[0] > 0 ? 0.18 : -0.18}>
            <cylinderGeometry args={[0.18, 0.18, 0.02, 8]} />
            <meshStandardMaterial color="#d8dde6" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  )
}
