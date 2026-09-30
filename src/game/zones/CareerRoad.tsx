import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { CuboidCollider } from '@react-three/rapier'
import { MathUtils, type Group, type MeshStandardMaterial } from 'three'
import { roles, YEARS_OF_EXPERIENCE } from '../../data/cv'
import { formatRange } from '../../data/format'
import { CAREER_GATES, CAREER_ROAD } from '../../data/zones'
import type { Role } from '../../data/types'
import { usePanelZone, useGame } from '../../store/useGame'
import { FONT_BOLD, FONT_MEDIUM } from '../refs'
import { ribbonGeometry } from '../util'
import { ItemSensor, Sign } from './Zone'

const PILLAR_OFFSET = CAREER_ROAD.width / 2 + 0.9

function Gate({ role, index, active }: { role: Role; index: number; active: boolean }) {
  const { z, height } = CAREER_GATES[index]
  const banner = useRef<Group>(null)
  const glow = useRef<MeshStandardMaterial>(null)

  // The role banner unrolls from inside the crossbeam and the trim lights up while this gate is active.
  useFrame((_, delta) => {
    if (banner.current) {
      const target = active ? height - 1.25 : height + 0.5
      banner.current.position.y = MathUtils.damp(banner.current.position.y, target, 4, delta)
    }
    if (glow.current) {
      glow.current.emissiveIntensity = MathUtils.damp(glow.current.emissiveIntensity, active ? 3 : 0.4, 4, delta)
    }
  })

  const year = role.start.slice(0, 4)

  return (
    <group position={[CAREER_ROAD.x, 0, z]}>
      {[-PILLAR_OFFSET, PILLAR_OFFSET].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, height / 2, 0]}>
            <boxGeometry args={[0.9, height, 0.9]} />
            <meshStandardMaterial color="#e9edf5" flatShading />
          </mesh>
          <CuboidCollider args={[0.45, height / 2, 0.45]} position={[x, height / 2, 0]} />
        </group>
      ))}
      {/* Crossbeam with the company name */}
      <mesh castShadow position={[0, height + 0.5, 0]}>
        <boxGeometry args={[PILLAR_OFFSET * 2 + 1.4, 1.2, 1]} />
        <meshStandardMaterial color="#0f1626" flatShading />
      </mesh>
      <mesh position={[0, height - 0.12, 0]}>
        <boxGeometry args={[PILLAR_OFFSET * 2 + 1.4, 0.12, 1.02]} />
        <meshStandardMaterial ref={glow} color={role.color} emissive={role.color} emissiveIntensity={0.4} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, height + 0.5, side * 0.51]} rotation-y={side > 0 ? 0 : Math.PI}>
          <Text font={FONT_BOLD} fontSize={0.62} color="#ffffff" anchorX="center" anchorY="middle">
            {role.company.toUpperCase()}
          </Text>
        </group>
      ))}
      {/* Year standing on top of the gate */}
      <Text
        font={FONT_BOLD}
        fontSize={1.6}
        position={[0, height + 2.1, 0]}
        color={role.color}
        outlineWidth={0.04}
        outlineColor="#0f1626"
        anchorX="center"
        anchorY="middle"
      >
        {year}
      </Text>

      {/* Banner with the role title, hidden in the crossbeam until the gate is active */}
      <group ref={banner} position={[0, height + 0.5, 0]}>
        <mesh>
          <boxGeometry args={[PILLAR_OFFSET * 2 - 1.2, 1.1, 0.08]} />
          <meshStandardMaterial color={role.color} transparent opacity={0.92} />
        </mesh>
        {[1, -1].map((side) => (
          <group key={side} position={[0, 0, side * 0.05]} rotation-y={side > 0 ? 0 : Math.PI}>
            <Text
              font={FONT_BOLD}
              fontSize={0.36}
              position={[0, 0.2, 0]}
              color="#0f1626"
              anchorX="center"
              anchorY="middle"
            >
              {role.title.toUpperCase()}
            </Text>
            <Text
              font={FONT_MEDIUM}
              fontSize={0.24}
              position={[0, -0.25, 0]}
              color="#0f1626"
              anchorX="center"
              anchorY="middle"
            >
              {formatRange(role.start, role.end)}
            </Text>
          </group>
        ))}
      </group>

      <ItemSensor
        args={[CAREER_ROAD.width / 2, 2, 4.5]}
        position={[0, 1.5, 0]}
        onEnter={() => useGame.getState().selectCareer(index)}
      />
    </group>
  )
}

/** A straight road north with one gate per job, each gate taller than the last. */
export function CareerRoad() {
  const panelZone = usePanelZone()
  const careerIndex = useGame((s) => s.careerIndex)

  const road = useMemo(
    () =>
      ribbonGeometry(
        [
          [CAREER_ROAD.x, CAREER_ROAD.zStart],
          [CAREER_ROAD.x, (CAREER_ROAD.zStart + CAREER_ROAD.zEnd) / 2],
          [CAREER_ROAD.x, CAREER_ROAD.zEnd],
        ],
        CAREER_ROAD.width,
        0.09,
        4,
      ),
    [],
  )
  const dashes = useMemo(() => {
    const list: number[] = []
    for (let z = CAREER_ROAD.zStart - 1; z > CAREER_ROAD.zEnd + 1; z -= 3) list.push(z)
    return list
  }, [])

  return (
    <group>
      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial color="#3a3f4b" roughness={0.95} polygonOffset polygonOffsetFactor={-3} />
      </mesh>
      {dashes.map((z) => (
        <mesh key={z} position={[CAREER_ROAD.x, 0.11, z]}>
          <boxGeometry args={[0.18, 0.02, 1.4]} />
          <meshStandardMaterial color="#ffd166" />
        </mesh>
      ))}

      {roles.map((role, i) => (
        <Gate key={role.company} role={role} index={i} active={panelZone === 'career' && careerIndex === i} />
      ))}

      <Sign
        position={[CAREER_ROAD.x, 0, CAREER_ROAD.zEnd - 0.5]}
        width={4.4}
        color="#ffd166"
        title={`LV.${YEARS_OF_EXPERIENCE + 1} LOADING…`}
        subtitle="The road continues"
      />
    </group>
  )
}
