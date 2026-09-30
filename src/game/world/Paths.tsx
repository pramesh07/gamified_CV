import { useMemo } from 'react'
import { PATHS } from '../../data/zones'
import { ribbonGeometry } from '../util'

/** Dirt paths from the plaza to every zone, so visitors always know where to drive. */
export function Paths() {
  const geometries = useMemo(() => PATHS.map((points) => ribbonGeometry(points, 3.4, 0.08)), [])
  return (
    <group>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} receiveShadow>
          <meshStandardMaterial color="#d9b77e" roughness={1} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
    </group>
  )
}
