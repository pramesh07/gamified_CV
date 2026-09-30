import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial } from 'three'
import { WATER_LEVEL } from '../../data/zones'

// There is only one sea, so its time uniform can live at module scope.
const uniforms = { uTime: { value: 0 } }

/** Low-poly sea: a flat-shaded plane whose vertices bob with a couple of sine waves. */
export function Water({ animate }: { animate: boolean }) {
  const material = useMemo(() => {
    const material = new MeshStandardMaterial({
      color: '#2d9bd2',
      flatShading: true,
      roughness: 0.3,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    })
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.z += sin(position.x * 0.16 + uTime * 1.1) * 0.22
                       + cos(position.y * 0.21 + uTime * 0.8) * 0.18;`,
      )
    }
    return material
  }, [])

  useFrame((_, delta) => {
    if (animate) uniforms.uTime.value += delta
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={WATER_LEVEL} material={material} receiveShadow>
      <planeGeometry args={[520, 520, 96, 96]} />
    </mesh>
  )
}
