import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { CylinderCollider } from '@react-three/rapier'
import { ISLAND_RADIUS, PATHS, ZONES, ZONE_ORDER } from '../../data/zones'
import { distanceToSegment, mulberry32 } from '../util'

interface Tree {
  x: number
  z: number
  scale: number
  color: string
  tall: boolean
}

const FOLIAGE = ['#3f9a4f', '#4fae5a', '#2f8446', '#5bbd63']

function isClear(x: number, z: number) {
  if (Math.hypot(x, z) < 13) return false // spawn plaza
  for (const id of ZONE_ORDER) {
    const zone = ZONES[id]
    const [cx, , cz] = zone.center
    const [hx, , hz] = zone.halfExtents
    if (Math.abs(x - cx) < hx + 2 && Math.abs(z - cz) < hz + 2) return false
  }
  for (const path of PATHS) {
    for (let i = 0; i < path.length - 1; i++) {
      if (distanceToSegment([x, z], path[i], path[i + 1]) < 4) return false
    }
  }
  return true
}

function scatterTrees(): Tree[] {
  const rand = mulberry32(42)
  const trees: Tree[] = []
  const push = (x: number, z: number) =>
    trees.push({
      x,
      z,
      scale: 0.8 + rand() * 0.7,
      color: FOLIAGE[Math.floor(rand() * FOLIAGE.length)],
      tall: rand() > 0.45,
    })

  // Loose scatter across the island.
  for (let i = 0; i < 260 && trees.length < 70; i++) {
    const angle = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * (ISLAND_RADIUS - 8)
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    if (isClear(x, z) && trees.every((t) => Math.hypot(t.x - x, t.z - z) > 3.2)) push(x, z)
  }

  // A dense ring of pines around the Skill Forest.
  const [sx, , sz] = ZONES.skills.center
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2 + rand() * 0.15
    const r = 15.5 + rand() * 3
    const x = sx + Math.cos(angle) * r
    const z = sz + Math.sin(angle) * r
    // Leave the east side open — that's where the path comes in.
    if (Math.cos(angle) > 0.7) continue
    if (Math.hypot(x, z) < ISLAND_RADIUS - 6) push(x, z)
  }
  return trees
}

/** Instanced low-poly pines with trunk colliders so the car can bump into them. */
export function Trees() {
  const trees = useMemo(() => scatterTrees(), [])

  return (
    <group>
      <Instances castShadow receiveShadow limit={trees.length}>
        <cylinderGeometry args={[0.22, 0.32, 1.6, 6]} />
        <meshStandardMaterial color="#8a5a3b" flatShading />
        {trees.map((t, i) => (
          <Instance key={i} position={[t.x, 0.8 * t.scale, t.z]} scale={t.scale} />
        ))}
      </Instances>

      <Instances castShadow limit={trees.length * 2}>
        <coneGeometry args={[1.4, 2.4, 7]} />
        <meshStandardMaterial flatShading roughness={0.9} />
        {trees.map((t, i) => (
          <Instance key={`a${i}`} position={[t.x, (1.6 + 1.1) * t.scale, t.z]} scale={t.scale} color={t.color} />
        ))}
        {trees
          .filter((t) => t.tall)
          .map((t, i) => (
            <Instance
              key={`b${i}`}
              position={[t.x, (1.6 + 2.4) * t.scale, t.z]}
              scale={t.scale * 0.72}
              color={t.color}
            />
          ))}
      </Instances>

      {trees.map((t, i) => (
        <CylinderCollider key={i} args={[1.2 * t.scale, 0.35 * t.scale]} position={[t.x, 1.2 * t.scale, t.z]} />
      ))}
    </group>
  )
}
