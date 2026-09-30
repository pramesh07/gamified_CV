import { useSyncExternalStore } from 'react'

/** True when the browser can create a WebGL2 context. `?no3d` forces the fallback for testing. */
export function supportsWebGL2() {
  if (new URLSearchParams(window.location.search).has('no3d')) return false
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
