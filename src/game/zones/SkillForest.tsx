import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { skillGroups } from '../../data/cv'
import { useGame } from '../../store/useGame'
import { FONT_BOLD } from '../refs'
import { Sign } from './Zone'

const SIZE = 1.3
const GAP = 0.04

/** Where each category's pyramid of crates stands (x, z of the base row centre). */
const STACK_SPOTS: Record<string, [number, number]> = {
  languages: [-27, -15],
  frameworks: [-27, -5],
  aws: [-27, 4.5],
  databases: [-38, -11],
  tools: [-38, 0],
}

interface Crate {
  label: string
  color: string
  position: [number, number, number]
}

/** Lays items out as a pyramid: rows shrink by one crate each level, centred along z. */
function pyramid(items: string[], color: string, [x, z]: [number, number]): Crate[] {
  let base = 1
  while ((base * (base + 1)) / 2 < items.length) base++
  const crates: Crate[] = []
  let row = 0
  let index = 0
  while (index < items.length) {
    const count = Math.min(base - row, items.length - index)
    for (let j = 0; j < count; j++) {
      crates.push({
        label: items[index++],
        color,
        position: [x, SIZE / 2 + row * (SIZE + GAP) + 0.02, z + (j - (count - 1) / 2) * (SIZE + GAP)],
      })
    }
    row++
  }
  return crates
}

function CrateMesh({ crate }: { crate: Crate }) {
  const fontSize = Math.min(0.3, 1.18 / (crate.label.length * 0.6))
  return (
    <>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial color={crate.color} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, SIZE / 2 + 0.005, 0]}>
        <boxGeometry args={[SIZE * 0.8, 0.02, SIZE * 0.8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {[1, -1].map((side) => (
        <Text
          key={side}
          font={FONT_BOLD}
          fontSize={fontSize}
          position={[side * (SIZE / 2 + 0.01), 0, 0]}
          rotation-y={(side * Math.PI) / 2}
          color="#ffffff"
          outlineWidth={0.012}
          outlineColor="#0f1626"
          anchorX="center"
          anchorY="middle"
        >
          {crate.label}
        </Text>
      ))}
    </>
  )
}

/** Every skill is a physics crate stacked by category — drive through to scatter them. */
export function SkillForest() {
  const crates = useMemo(
    () => skillGroups.flatMap((group) => pyramid(group.items, group.color, STACK_SPOTS[group.id])),
    [],
  )
  const bodies = useRef<(RapierRigidBody | null)[]>([])
  const restackNonce = useGame((s) => s.restackNonce)
  const checkTimer = useRef(0)

  const resetCrate = useCallback(
    (i: number) => {
      const body = bodies.current[i]
      if (!body) return
      const [x, y, z] = crates[i].position
      body.setTranslation({ x, y, z }, true)
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    },
    [crates],
  )

  useEffect(() => {
    if (restackNonce > 0) crates.forEach((_, i) => resetCrate(i))
  }, [restackNonce, crates, resetCrate])

  // Crates knocked into the sea float back to their stack.
  useFrame((_, delta) => {
    checkTimer.current += delta
    if (checkTimer.current < 0.5) return
    checkTimer.current = 0
    bodies.current.forEach((body, i) => {
      if (body && body.translation().y < -3) resetCrate(i)
    })
  })

  return (
    <group>
      {crates.map((crate, i) => (
        <RigidBody
          key={crate.label}
          ref={(el) => {
            bodies.current[i] = el
          }}
          colliders={false}
          position={crate.position}
          linearDamping={0.4}
          angularDamping={0.4}
        >
          <CuboidCollider args={[SIZE / 2, SIZE / 2, SIZE / 2]} density={0.35} friction={0.7} />
          <CrateMesh crate={crate} />
        </RigidBody>
      ))}

      {skillGroups.map((group) => {
        const [x, z] = STACK_SPOTS[group.id]
        return (
          <Sign
            key={group.id}
            position={[x + 3, 0, z]}
            rotationY={Math.PI / 2}
            width={4.4}
            color={group.color}
            title={group.label.toUpperCase()}
            subtitle={`${group.items.length} skills`}
          />
        )
      })}
    </group>
  )
}
