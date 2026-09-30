import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { MathUtils, type Group } from 'three'
import { profile } from '../../data/cv'
import { ZONES } from '../../data/zones'
import { usePanelZone } from '../../store/useGame'
import { FONT_BOLD, FONT_MEDIUM } from '../refs'
import { faceToward } from '../util'

const AT: [number, number] = [27, 33]
const ENTRY: [number, number] = [ZONES.contact.spawn.position[0], ZONES.contact.spawn.position[2]]

/** A giant mailbox whose flag pops up when you arrive, plus parcels to knock around. */
export function Mailbox({ animate }: { animate: boolean }) {
  const flag = useRef<Group>(null)
  const active = usePanelZone() === 'contact'

  useFrame((_, delta) => {
    if (flag.current) {
      flag.current.rotation.x = MathUtils.damp(flag.current.rotation.x, active ? 0 : -Math.PI / 2, 5, delta)
    }
  })

  return (
    <group>
      <mesh receiveShadow position={[AT[0] - 1, 0.065, AT[1] - 2]}>
        <cylinderGeometry args={[8, 8, 0.12, 24]} />
        <meshStandardMaterial color="#e8dcc8" flatShading roughness={1} />
      </mesh>

      <group position={[AT[0], 0, AT[1]]} rotation-y={faceToward(AT, ENTRY)}>
        {/* Post */}
        <mesh castShadow position={[0, 1.3, 0]}>
          <boxGeometry args={[0.6, 2.6, 0.6]} />
          <meshStandardMaterial color="#6d4a33" flatShading />
        </mesh>
        {/* Box with a rounded top, lying front-to-back */}
        <mesh castShadow position={[0, 3.3, 0]}>
          <boxGeometry args={[2.4, 1.6, 3.6]} />
          <meshStandardMaterial color="#e63946" flatShading />
        </mesh>
        <mesh castShadow position={[0, 4.1, 0]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.2, 1.2, 3.6, 12, 1, false, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#e63946" flatShading side={2} />
        </mesh>
        {/* Door */}
        <mesh position={[0, 3.6, 1.81]}>
          <boxGeometry args={[2.2, 2.2, 0.06]} />
          <meshStandardMaterial color="#c92f3b" flatShading />
        </mesh>
        <Text
          font={FONT_BOLD}
          fontSize={0.32}
          position={[0, 3.5, 1.86]}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          MAIL
        </Text>
        {/* Flag */}
        <group ref={flag} position={[1.25, 3.2, 0.6]} rotation-x={-Math.PI / 2}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.1, 1.8, 0.1]} />
            <meshStandardMaterial color="#ffd166" />
          </mesh>
          <mesh position={[0, 1.6, -0.4]}>
            <boxGeometry args={[0.08, 0.6, 0.8]} />
            <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={1.2} />
          </mesh>
        </group>
        <CuboidCollider args={[1.2, 2.4, 1.8]} position={[0, 2.4, 0]} />

        {/* Email sign beside the mailbox */}
        <group position={[-4, 0, 1.5]} rotation-y={0.35}>
          <mesh castShadow position={[0, 0.9, 0]}>
            <boxGeometry args={[5.4, 1.1, 0.15]} />
            <meshStandardMaterial color="#0f1626" />
          </mesh>
          <Text
            font={FONT_MEDIUM}
            fontSize={0.42}
            position={[0, 0.9, 0.09]}
            color="#ff8a4c"
            anchorX="center"
            anchorY="middle"
          >
            {profile.email}
          </Text>
        </group>
      </group>

      <Float enabled={animate} speed={2.4} rotationIntensity={0} floatIntensity={1.4}>
        <Text
          font={FONT_BOLD}
          fontSize={3}
          position={[AT[0], 7.2, AT[1]]}
          rotation-y={faceToward(AT, ENTRY)}
          color="#ff8a4c"
          outlineWidth={0.08}
          outlineColor="#0f1626"
          anchorX="center"
          anchorY="middle"
        >
          @
        </Text>
      </Float>

      {/* Parcels */}
      {[
        [22, 0.5, 30],
        [22.9, 0.5, 30.4],
        [22.4, 1.4, 30.2],
        [30.5, 0.5, 29],
        [31.2, 0.5, 28.2],
      ].map((p, i) => (
        <RigidBody key={i} position={p as [number, number, number]} colliders="cuboid" linearDamping={0.3}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color="#c89f6d" flatShading />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}
