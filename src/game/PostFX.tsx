import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/** Bloom makes emissive screens, pads and trims glow; tone mapping moves here from the renderer. */
export function PostFX() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={1} luminanceSmoothing={0.2} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.5} />
    </EffectComposer>
  )
}
