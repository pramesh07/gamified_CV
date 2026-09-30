import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { KeyboardControls, PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import type { DirectionalLight, Object3D } from 'three'
import { ZONES, ZONE_ORDER } from '../data/zones'
import { useReducedMotion } from '../hooks/useCapability'
import { useGame } from '../store/useGame'
import { CameraRig } from './CameraRig'
import { keymap } from './controls/keymap'
import { PostFX } from './PostFX'
import { focus } from './refs'
import { Vehicle } from './Vehicle'
import { Clouds } from './world/Clouds'
import { Island } from './world/Island'
import { Paths } from './world/Paths'
import { Trees } from './world/Trees'
import { Water } from './world/Water'
import { CareerRoad } from './zones/CareerRoad'
import { Campus } from './zones/Campus'
import { Mailbox } from './zones/Mailbox'
import { ProjectArcade } from './zones/ProjectArcade'
import { SkillForest } from './zones/SkillForest'
import { Spawn } from './zones/Spawn'
import { ZoneLabel, ZoneSensor } from './zones/Zone'

const SKY = '#a9dcff'

/** Sun that follows whatever the camera is looking at, so the shadow map stays sharp. */
function Sun() {
  const light = useRef<DirectionalLight>(null)
  const target = useRef<Object3D>(null)
  const quality = useGame((s) => s.quality)

  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current
  }, [])

  useFrame(() => {
    light.current?.position.set(focus.x + 24, focus.y + 38, focus.z + 16)
    target.current?.position.copy(focus)
  })

  return (
    <>
      <hemisphereLight args={['#e3f3ff', '#6c9a4f', 1.15]} />
      <directionalLight
        ref={light}
        castShadow={quality === 'high'}
        intensity={2.3}
        color="#fff1d6"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <object3D ref={target} />
    </>
  )
}

/** Drops to low quality (no post-FX or shadows, 1x DPR) if the frame rate can't keep up. */
function QualityManager() {
  const quality = useGame((s) => s.quality)
  const playing = useGame((s) => s.phase === 'playing')
  const setDpr = useThree((s) => s.setDpr)

  useEffect(() => {
    setDpr(quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1)
  }, [quality, setDpr])

  if (!playing || quality === 'low') return null
  return <PerformanceMonitor flipflops={2} onDecline={() => useGame.getState().setQuality('low')} />
}

function SceneReady() {
  useEffect(() => useGame.getState().setReady(), [])
  return null
}

function World({ animate }: { animate: boolean }) {
  return (
    <>
      <Island />
      <Paths />
      <Trees />
      <Spawn />
      <SkillForest />
      <CareerRoad />
      <ProjectArcade animate={animate} />
      <Campus animate={animate} />
      <Mailbox animate={animate} />
      {ZONE_ORDER.map((id) => (
        <ZoneSensor key={id} zone={ZONES[id]} />
      ))}
      <Vehicle />
    </>
  )
}

export function GameCanvas() {
  const reducedMotion = useReducedMotion()
  const quality = useGame((s) => s.quality)
  const animate = !reducedMotion

  return (
    <KeyboardControls map={keymap}>
      <Canvas
        className="game-canvas"
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ fov: 50, near: 0.5, far: 400, position: [70, 40, 70] }}
        gl={{ powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 95, 230]} />
        <Sun />
        <Water animate={animate} />
        <Clouds animate={animate} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -24, 0]}>
            <World animate={animate} />
          </Physics>
          {ZONE_ORDER.map((id) => (
            <ZoneLabel key={id} zone={ZONES[id]} animate={animate} />
          ))}
          <SceneReady />
        </Suspense>
        <CameraRig reducedMotion={reducedMotion} />
        <QualityManager />
        {quality === 'high' && animate && <PostFX />}
      </Canvas>
    </KeyboardControls>
  )
}
