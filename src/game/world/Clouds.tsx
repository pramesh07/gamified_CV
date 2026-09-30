import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { mulberry32 } from '../util'

const SPAN = 240

/** Chunky low-poly clouds drifting across the sky. */
export function Clouds({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null)
  const clouds = useMemo(() => {
    const rand = mulberry32(3)
    return Array.from({ length: 10 }, () => ({
      x: (rand() - 0.5) * SPAN,
      y: 28 + rand() * 14,
      z: (rand() - 0.5) * SPAN * 0.8,
      speed: 0.6 + rand() * 0.8,
      puffs: Array.from({ length: 3 + Math.floor(rand() * 3) }, (_, i) => ({
        offset: [i * 2.6 - 3, rand() * 1.2, (rand() - 0.5) * 2] as [number, number, number],
        size: 2 + rand() * 1.8,
      })),
    }))
  }, [])

  useFrame((_, delta) => {
    if (!animate || !group.current) return
    group.current.children.forEach((child, i) => {
      child.position.x += clouds[i].speed * delta
      if (child.position.x > SPAN / 2) child.position.x = -SPAN / 2
    })
  })

  return (
    <group ref={group}>
      {clouds.map((cloud, i) => (
        <group key={i} position={[cloud.x, cloud.y, cloud.z]}>
          {cloud.puffs.map((puff, j) => (
            <mesh key={j} position={puff.offset} scale={puff.size}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffffff" flatShading roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
