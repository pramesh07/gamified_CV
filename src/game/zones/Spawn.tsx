import { Text } from '@react-three/drei'
import { CuboidCollider, CylinderCollider } from '@react-three/rapier'
import { profile, YEARS_OF_EXPERIENCE } from '../../data/cv'
import { ZONES, ZONE_ORDER } from '../../data/zones'
import { FONT_BOLD, FONT_MEDIUM } from '../refs'

const ARCH_Z = -6
const ARCH_HALF_WIDTH = 7.8
const PILLAR_HEIGHT = 7

/** Starting plaza: a welcome arch with the name on it and a signpost pointing to every zone. */
export function Spawn() {
  const signpost: [number, number] = [6.5, 3.5]

  return (
    <group>
      {/* Plaza */}
      <mesh receiveShadow position={[0, 0.06, 2]}>
        <cylinderGeometry args={[9, 9, 0.12, 24]} />
        <meshStandardMaterial color="#d8d2c4" flatShading roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.07, 2]}>
        <cylinderGeometry args={[4.5, 4.5, 0.13, 24]} />
        <meshStandardMaterial color="#c9c1b0" flatShading roughness={1} />
      </mesh>

      {/* Start line painted where the car spawns */}
      <mesh position={[0, 0.14, 10]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Text
        font={FONT_BOLD}
        position={[0, 0.15, 15.5]}
        rotation-x={-Math.PI / 2}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        START
      </Text>

      {/* Welcome arch */}
      {[-ARCH_HALF_WIDTH, ARCH_HALF_WIDTH].map((x) => (
        <group key={x}>
          <mesh castShadow receiveShadow position={[x, PILLAR_HEIGHT / 2, ARCH_Z]}>
            <boxGeometry args={[1.3, PILLAR_HEIGHT, 1.3]} />
            <meshStandardMaterial color="#f4efe6" flatShading />
          </mesh>
          <mesh castShadow position={[x, 0.3, ARCH_Z]}>
            <boxGeometry args={[1.8, 0.6, 1.8]} />
            <meshStandardMaterial color="#c9c1b0" flatShading />
          </mesh>
          <CuboidCollider args={[0.9, PILLAR_HEIGHT / 2, 0.9]} position={[x, PILLAR_HEIGHT / 2, ARCH_Z]} />
        </group>
      ))}
      <mesh castShadow position={[0, PILLAR_HEIGHT + 1.2, ARCH_Z]}>
        <boxGeometry args={[ARCH_HALF_WIDTH * 2 + 2.4, 2.8, 1.5]} />
        <meshStandardMaterial color="#0f1626" flatShading />
      </mesh>
      <mesh position={[0, PILLAR_HEIGHT - 0.12, ARCH_Z]}>
        <boxGeometry args={[ARCH_HALF_WIDTH * 2 + 2.4, 0.16, 1.52]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={2.2} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, PILLAR_HEIGHT + 1.2, ARCH_Z + side * 0.77]} rotation-y={side > 0 ? 0 : Math.PI}>
          <Text
            font={FONT_BOLD}
            fontSize={1.12}
            position={[0, 0.35, 0]}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {profile.name.toUpperCase()}
          </Text>
          <Text
            font={FONT_MEDIUM}
            fontSize={0.46}
            position={[0, -0.65, 0]}
            color="#ffd166"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.12}
          >
            {`LV.${YEARS_OF_EXPERIENCE} · ${profile.title.toUpperCase()}`}
          </Text>
        </group>
      ))}

      {/* Signpost with an arrow toward each zone */}
      <group position={[signpost[0], 0, signpost[1]]}>
        <mesh castShadow position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 4.8, 6]} />
          <meshStandardMaterial color="#6d4a33" flatShading />
        </mesh>
        <CylinderCollider args={[2.4, 0.25]} position={[0, 2.4, 0]} />
        {ZONE_ORDER.filter((id) => id !== 'spawn').map((id, i) => {
          const zone = ZONES[id]
          const dx = zone.center[0] - signpost[0]
          const dz = zone.center[2] - signpost[1]
          const angle = Math.atan2(-dz, dx)
          return (
            <group key={id} position={[0, 4.3 - i * 0.62, 0]} rotation-y={angle}>
              <mesh castShadow position={[1.55, 0, 0]}>
                <boxGeometry args={[2.7, 0.46, 0.1]} />
                <meshStandardMaterial color={zone.color} flatShading />
              </mesh>
              <mesh position={[3.05, 0, 0]} rotation-z={-Math.PI / 2}>
                <cylinderGeometry args={[0, 0.3, 0.4, 3]} />
                <meshStandardMaterial color={zone.color} flatShading />
              </mesh>
              {[1, -1].map((side) => (
                <Text
                  key={side}
                  font={FONT_BOLD}
                  fontSize={0.24}
                  position={[1.55, 0, side * 0.06]}
                  rotation-y={side > 0 ? 0 : Math.PI}
                  color="#0f1626"
                  anchorX="center"
                  anchorY="middle"
                >
                  {zone.label.toUpperCase()}
                </Text>
              ))}
            </group>
          )
        })}
      </group>
    </group>
  )
}
