import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { CuboidCollider } from '@react-three/rapier'
import type { Group } from 'three'
import { certifications, education } from '../../data/cv'
import { ZONES } from '../../data/zones'
import { FONT_BOLD, FONT_MEDIUM } from '../refs'
import { faceToward } from '../util'
import { Sign } from './Zone'

const [bsc, mba] = education
const ENTRY: [number, number] = [ZONES.campus.spawn.position[0], ZONES.campus.spawn.position[2]]

function Facade({ lines, width, y, z }: { lines: [string, string]; width: number; y: number; z: number }) {
  return (
    <group position={[0, y, z]}>
      <mesh>
        <boxGeometry args={[width, 1.1, 0.1]} />
        <meshStandardMaterial color="#0f1626" />
      </mesh>
      <Text
        font={FONT_BOLD}
        fontSize={0.34}
        position={[0, 0.18, 0.06]}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {lines[0]}
      </Text>
      <Text
        font={FONT_MEDIUM}
        fontSize={0.22}
        position={[0, -0.24, 0.06]}
        color="#ffd166"
        anchorX="center"
        anchorY="middle"
      >
        {lines[1]}
      </Text>
    </group>
  )
}

/** Completed degree: a classic columned hall with a floating graduation cap. */
function University({ animate }: { animate: boolean }) {
  const at: [number, number] = [-33, 29]
  return (
    <group position={[at[0], 0, at[1]]} rotation-y={faceToward(at, ENTRY)}>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[9.5, 0.6, 7]} />
        <meshStandardMaterial color="#d8d2c4" flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.6, -0.6]}>
        <boxGeometry args={[8, 4, 5]} />
        <meshStandardMaterial color="#f1e3c6" flatShading />
      </mesh>
      {/* Pediment roof */}
      <mesh castShadow position={[0, 5.4, -0.2]} rotation-y={Math.PI / 4} scale={[1, 1, 1]}>
        <coneGeometry args={[6.4, 1.8, 4]} />
        <meshStandardMaterial color="#b5483a" flatShading />
      </mesh>
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} castShadow position={[x, 2.5, 2.4]}>
          <cylinderGeometry args={[0.28, 0.32, 3.8, 8]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      ))}
      <Facade lines={[bsc.institution.toUpperCase(), `BSc CSIT · ${bsc.date}`]} width={6.2} y={4.1} z={2.9} />
      <Float enabled={animate} speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
        <group position={[0, 8, 0.5]}>
          <mesh castShadow rotation-y={Math.PI / 4}>
            <boxGeometry args={[2.2, 0.12, 2.2]} />
            <meshStandardMaterial color="#1b1530" />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.6, 12]} />
            <meshStandardMaterial color="#1b1530" />
          </mesh>
          <mesh position={[0.9, -0.4, 0.9]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={1.5} />
          </mesh>
        </group>
      </Float>
      <CuboidCollider args={[4.75, 2.5, 3.5]} position={[0, 2.5, 0]} />
    </group>
  )
}

/** Degree in progress: half-built hall, scaffolding and a turning crane. */
function ConstructionSite({ animate }: { animate: boolean }) {
  const at: [number, number] = [-20, 36]
  const jib = useRef<Group>(null)

  useFrame((state) => {
    if (jib.current && animate) jib.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 1.2
  })

  return (
    <group position={[at[0], 0, at[1]]} rotation-y={faceToward(at, ENTRY)}>
      <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
        <boxGeometry args={[6.5, 2.6, 5]} />
        <meshStandardMaterial color="#c8ced8" flatShading />
      </mesh>
      {/* Scaffolding */}
      {[-3.4, -1.1, 1.1, 3.4].map((x) =>
        [-2.7, 2.7].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 2.6, z]}>
            <cylinderGeometry args={[0.06, 0.06, 5.2, 5]} />
            <meshStandardMaterial color="#f7b731" />
          </mesh>
        )),
      )}
      {[2.2, 4.2].map((y) => (
        <mesh key={y} position={[0, y, 2.7]}>
          <boxGeometry args={[7, 0.1, 0.5]} />
          <meshStandardMaterial color="#8a5a3b" />
        </mesh>
      ))}
      {/* Crane */}
      <group position={[-4.6, 0, -1.5]}>
        <mesh castShadow position={[0, 5.5, 0]}>
          <boxGeometry args={[0.5, 11, 0.5]} />
          <meshStandardMaterial color="#f7b731" flatShading />
        </mesh>
        <group ref={jib} position={[0, 11, 0]}>
          <mesh castShadow position={[2.6, 0, 0]}>
            <boxGeometry args={[8, 0.4, 0.4]} />
            <meshStandardMaterial color="#f7b731" flatShading />
          </mesh>
          <mesh position={[-2, -0.1, 0]}>
            <boxGeometry args={[1.2, 0.8, 0.8]} />
            <meshStandardMaterial color="#3a3f4b" />
          </mesh>
          <mesh position={[5.5, -1.8, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 3.6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[5.5, -3.8, 0]}>
            <boxGeometry args={[0.9, 0.5, 0.9]} />
            <meshStandardMaterial color="#b57bff" />
          </mesh>
        </group>
        <CuboidCollider args={[0.25, 5.5, 0.25]} position={[0, 5.5, 0]} />
      </group>
      <Facade lines={[mba.institution.toUpperCase(), `MBA · ${mba.date.toUpperCase()}`]} width={6.2} y={3.3} z={2.6} />
      {/* Progress bar */}
      <group position={[0, 5.4, 2.6]}>
        <mesh>
          <boxGeometry args={[5, 0.5, 0.1]} />
          <meshStandardMaterial color="#0f1626" />
        </mesh>
        <mesh position={[-0.9, 0, 0.06]}>
          <boxGeometry args={[3, 0.32, 0.04]} />
          <meshStandardMaterial color="#b57bff" emissive="#b57bff" emissiveIntensity={2} />
        </mesh>
        <Text
          font={FONT_BOLD}
          fontSize={0.24}
          position={[0, 0.5, 0.06]}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          LOADING MBA…
        </Text>
      </group>
      <CuboidCollider args={[3.25, 1.3, 2.5]} position={[0, 1.3, 0]} />
    </group>
  )
}

const CERT_SPOT: [number, number] = [-29, 21]

/** Signboard on the plaza for each certification, facing the campus entrance. */
function CertificationSign() {
  return certifications.map((c, i) => (
    <Sign
      key={c.name}
      position={[CERT_SPOT[0] - i * 5, 0, CERT_SPOT[1]]}
      rotationY={faceToward(CERT_SPOT, ENTRY)}
      width={5.2}
      color="#f7b731"
      title={c.sign[0].toUpperCase()}
      subtitle={`${c.sign[1]} · ${c.issued}`}
    />
  ))
}

export function Campus({ animate }: { animate: boolean }) {
  return (
    <group>
      <mesh receiveShadow position={[-26, 0.065, 31]}>
        <cylinderGeometry args={[12, 12, 0.12, 28]} />
        <meshStandardMaterial color="#cfc8b8" flatShading roughness={1} />
      </mesh>
      <University animate={animate} />
      <ConstructionSite animate={animate} />
      <CertificationSign />
    </group>
  )
}
