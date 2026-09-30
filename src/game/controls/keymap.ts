import type { KeyboardControlsEntry } from '@react-three/drei'

export type Controls = 'forward' | 'back' | 'left' | 'right' | 'brake' | 'reset'

export const keymap: KeyboardControlsEntry<Controls>[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'brake', keys: ['Space'] },
  { name: 'reset', keys: ['KeyR'] },
]
