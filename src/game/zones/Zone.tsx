import { useState, type ReactNode } from 'react'
import { Billboard, Float, RoundedBox, Text, useCursor } from '@react-three/drei'
import { CuboidCollider } from '@react-three/rapier'
import type { IntersectionEnterPayload } from '@react-three/rapier'
import { TOUR_STOPS, type ZoneDef } from '../../data/zones'
import { useGame } from '../../store/useGame'
import { FONT_BOLD, FONT_MEDIUM, isCar } from '../refs'

/** Invisible trigger volume: tells the store when the car enters or leaves a zone. */
export function ZoneSensor({ zone }: { zone: ZoneDef }) {
  return (
    <CuboidCollider
      sensor
      args={zone.halfExtents}
      position={zone.center}
      onIntersectionEnter={({ other }) => isCar(other.rigidBody) && useGame.getState().enterZone(zone.id)}
      onIntersectionExit={({ other }) => isCar(other.rigidBody) && useGame.getState().exitZone(zone.id)}
    />
  )
}

/** Smaller trigger for a single item inside a zone (a career gate, an arcade pad). */
export function ItemSensor({
  args,
  position,
  onEnter,
}: {
  args: [number, number, number]
  position: [number, number, number]
  onEnter: () => void
}) {
  const handle = ({ other }: IntersectionEnterPayload) => {
    if (isCar(other.rigidBody) && useGame.getState().mode === 'drive') onEnter()
  }
  return <CuboidCollider sensor args={args} position={position} onIntersectionEnter={handle} />
}

/** Floating signboard above each zone. Clicking it fast-travels (drive) or jumps to that stop (tour). */
export function ZoneLabel({ zone, animate }: { zone: ZoneDef; animate: boolean }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const width = Math.max(zone.label.length * 0.62, (zone.number.length + zone.hint.length + 3) * 0.26) + 1.6

  const go = () => {
    const s = useGame.getState()
    if (s.phase !== 'playing') return
    if (s.mode === 'tour') s.goToStop(TOUR_STOPS.findIndex((stop) => stop.zone === zone.id))
    else s.travelTo(zone.id)
  }

  return (
    <Float enabled={animate} speed={1.6} floatIntensity={0.8} rotationIntensity={0}>
      <Billboard position={zone.labelPosition}>
        <RoundedBox
          args={[width, 2.3, 0.2]}
          radius={0.3}
          onClick={(e) => {
            e.stopPropagation()
            go()
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial color={hovered ? '#1d2742' : '#0f1626'} transparent opacity={0.85} />
        </RoundedBox>
        <mesh position={[0, -1.15, 0.11]}>
          <planeGeometry args={[width - 0.6, 0.1]} />
          <meshBasicMaterial color={zone.color} toneMapped={false} />
        </mesh>
        <Text
          font={FONT_BOLD}
          fontSize={0.9}
          position={[0, 0.3, 0.12]}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {zone.label}
        </Text>
        <Text
          font={FONT_MEDIUM}
          fontSize={0.4}
          position={[0, -0.55, 0.12]}
          color={zone.color}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {`${zone.number} · ${zone.hint.toUpperCase()}`}
        </Text>
      </Billboard>
    </Float>
  )
}

/** Simple post + board sign used around the island. */
export function Sign({
  position,
  rotationY = 0,
  width = 4,
  color,
  title,
  subtitle,
  children,
}: {
  position: [number, number, number]
  rotationY?: number
  width?: number
  color: string
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.18, 1.8, 0.18]} />
        <meshStandardMaterial color="#6d4a33" flatShading />
      </mesh>
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[width, subtitle ? 1.2 : 0.8, 0.14]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <Text
        font={FONT_BOLD}
        fontSize={Math.min(0.36, (width - 0.4) / (title.length * 0.64))}
        position={[0, subtitle ? 2.2 : 2, 0.08]}
        color="#0f1626"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.3}
        textAlign="center"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          font={FONT_MEDIUM}
          fontSize={0.24}
          position={[0, 1.78, 0.08]}
          color="#0f1626"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.3}
          textAlign="center"
        >
          {subtitle}
        </Text>
      )}
      {children}
    </group>
  )
}
