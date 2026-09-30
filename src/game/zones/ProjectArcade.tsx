import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { CuboidCollider } from '@react-three/rapier'
import { MathUtils, type Group, type MeshStandardMaterial } from 'three'
import { projects } from '../../data/cv'
import { arcadeSlot } from '../../data/zones'
import type { Project } from '../../data/types'
import { useGame, usePanelZone } from '../../store/useGame'
import { FONT_BOLD, FONT_MEDIUM } from '../refs'
import { ItemSensor } from './Zone'

function Cabinet({
  project,
  index,
  active,
  animate,
}: {
  project: Project
  index: number
  active: boolean
  animate: boolean
}) {
  const { position, rotationY } = arcadeSlot(index)
  const body = useRef<Group>(null)
  const screen = useRef<MeshStandardMaterial>(null)
  const pad = useRef<MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (body.current) {
      const hop = active && animate ? Math.abs(Math.sin(t * 4)) * 0.12 : 0
      body.current.position.y = MathUtils.damp(body.current.position.y, hop, 10, delta)
    }
    if (screen.current) {
      const flicker = animate ? 0.15 * Math.sin(t * 9 + index) : 0
      screen.current.emissiveIntensity = MathUtils.damp(
        screen.current.emissiveIntensity,
        active ? 2.6 : 0.55 + flicker,
        6,
        delta,
      )
    }
    if (pad.current) {
      pad.current.emissiveIntensity = active ? 2.5 : 0.8 + (animate ? 0.4 * Math.sin(t * 2 + index) : 0)
    }
  })

  return (
    <group position={position} rotation-y={rotationY}>
      <group ref={body}>
        {/* Cabinet body */}
        <mesh castShadow position={[0, 1.5, 0]}>
          <boxGeometry args={[2, 3, 1.3]} />
          <meshStandardMaterial color="#1b1530" flatShading />
        </mesh>
        {[-1.02, 1.02].map((x) => (
          <mesh key={x} position={[x, 1.5, 0]}>
            <boxGeometry args={[0.06, 3.02, 1.32]} />
            <meshStandardMaterial color={project.color} flatShading />
          </mesh>
        ))}
        {/* Marquee */}
        <mesh position={[0, 3.25, 0.05]}>
          <boxGeometry args={[2.1, 0.55, 1.35]} />
          <meshStandardMaterial color={project.color} emissive={project.color} emissiveIntensity={1.4} />
        </mesh>
        <Text
          font={FONT_BOLD}
          fontSize={0.3}
          position={[0, 3.25, 0.74]}
          color="#0f1626"
          anchorX="center"
          anchorY="middle"
        >
          {`PROJECT ${String(index + 1).padStart(2, '0')}`}
        </Text>
        {/* Screen */}
        <group position={[0, 2.05, 0.66]} rotation-x={-0.12}>
          <mesh>
            <planeGeometry args={[1.64, 1.14]} />
            <meshStandardMaterial ref={screen} color="#050814" emissive={project.color} emissiveIntensity={0.6} />
          </mesh>
          <Text
            font={FONT_BOLD}
            fontSize={0.19}
            position={[0, 0.16, 0.01]}
            maxWidth={1.45}
            textAlign="center"
            color="#ffffff"
            outlineWidth={0.01}
            outlineColor="#050814"
            anchorX="center"
            anchorY="middle"
          >
            {project.name.toUpperCase()}
          </Text>
          <Text
            font={FONT_MEDIUM}
            fontSize={0.1}
            position={[0, -0.3, 0.01]}
            maxWidth={1.45}
            textAlign="center"
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {active ? 'NOW PLAYING' : project.tagline.toUpperCase()}
          </Text>
        </group>
        {/* Control deck */}
        <mesh castShadow position={[0, 1.3, 0.85]} rotation-x={0.25}>
          <boxGeometry args={[2, 0.2, 0.7]} />
          <meshStandardMaterial color="#2a2244" flatShading />
        </mesh>
        <mesh position={[-0.45, 1.5, 0.9]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color="#ff3b3b" />
        </mesh>
        {[0.25, 0.55].map((x) => (
          <mesh key={x} position={[x, 1.44, 0.88]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 10]} />
            <meshStandardMaterial color={project.color} emissive={project.color} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
      <CuboidCollider args={[1, 1.5, 0.65]} position={[0, 1.5, 0]} />

      {/* Glowing pad in front: park on it to load this project */}
      <mesh position={[0, 0.1, 2.7]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.8, 1.15, 24]} />
        <meshStandardMaterial ref={pad} color={project.color} emissive={project.color} emissiveIntensity={0.8} />
      </mesh>
      <ItemSensor
        args={[1.2, 1.5, 1.2]}
        position={[0, 1, 2.7]}
        onEnter={() => useGame.getState().selectProject(index)}
      />
    </group>
  )
}

/** Nine arcade machines on an arc — one per project. */
export function ProjectArcade({ animate }: { animate: boolean }) {
  const panelZone = usePanelZone()
  const projectIndex = useGame((s) => s.projectIndex)

  return (
    <group>
      <mesh receiveShadow position={[0, 0.07, -38]}>
        <cylinderGeometry args={[15.5, 15.5, 0.12, 36]} />
        <meshStandardMaterial color="#2b2342" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.14, -38]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[15.1, 15.5, 48]} />
        <meshStandardMaterial color="#ff6b9a" emissive="#ff6b9a" emissiveIntensity={1.6} />
      </mesh>
      {projects.map((project, i) => (
        <Cabinet
          key={project.id}
          project={project}
          index={i}
          active={panelZone === 'projects' && projectIndex === i}
          animate={animate}
        />
      ))}
    </group>
  )
}
