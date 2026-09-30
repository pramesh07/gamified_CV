import { lazy, Suspense, useState } from 'react'
import { NoWebGLFallback } from './fallback/NoWebGLFallback'
import { supportsWebGL2 } from './hooks/useCapability'
import { LoadingScreen } from './ui/LoadingScreen'

// three.js, Rapier and the whole world load in a separate chunk behind the title screen.
const Game = lazy(() => import('./game/Game'))

export default function App() {
  const [webgl] = useState(supportsWebGL2)
  if (!webgl) return <NoWebGLFallback />

  return (
    <>
      <Suspense fallback={null}>
        <Game />
      </Suspense>
      <LoadingScreen />
    </>
  )
}
