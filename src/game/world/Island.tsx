import { useMemo } from 'react'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { Instance, Instances } from '@react-three/drei'
import { ISLAND_RADIUS } from '../../data/zones'
import { mulberry32 } from '../util'

const SAND = '#f2d59b'
const GRASS = '#7cc46a'

/** Rocks ring the beach: decoration plus a few natural bumpers. */
function useRocks() {
  return useMemo(() => {
    const rand = mulberry32(7)
    return Array.from({ length: 34 }, (_, i) => {
      const angle = (i / 34) * Math.PI * 2 + rand() * 0.12
      const r = ISLAND_RADIUS - 1.5 - rand() * 3
      const size = 0.6 + rand() * 1.4
      return {
        position: [Math.cos(angle) * r, size * 0.35, Math.sin(angle) * r] as [number, number, number],
        rotation: [rand() * 3, rand() * 3, rand() * 3] as [number, number, number],
        size,
        color: rand() > 0.5 ? '#a7a39a' : '#8f8b84',
      }
    })
  }, [])
}

export function Island() {
  const rocks = useRocks()

  return (
    <group>
      {/* Sand body: its convex hull is the drivable ground, sloping gently into the sea. */}
      <RigidBody type="fixed" colliders="hull" friction={0.8}>
        <mesh receiveShadow position={[0, -4, 0]}>
          <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS + 12, 8, 56, 1]} />
          <meshStandardMaterial color={SAND} flatShading roughness={1} />
        </mesh>
      </RigidBody>

      {/* Grass cap, visual only (the hull above is the floor). */}
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS - 5, ISLAND_RADIUS - 4.4, 0.4, 56, 1]} />
        <meshStandardMaterial color={GRASS} flatShading roughness={1} />
      </mesh>

      <Instances castShadow receiveShadow limit={rocks.length}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={1} />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.size} color={rock.color} />
        ))}
      </Instances>
      {rocks.map((rock, i) => (
        <CylinderCollider key={i} args={[rock.size * 0.6, rock.size * 0.75]} position={rock.position} />
      ))}
    </group>
  )
}
