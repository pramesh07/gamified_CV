import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCoarsePointer } from '../hooks/useCapability'
import { useGame } from '../store/useGame'

/** Shows the driving controls the first time driving starts, then fades out. */
export function ControlsHint() {
  const driving = useGame((s) => s.phase === 'playing' && s.mode === 'drive')
  const coarse = useCoarsePointer()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!driving || expired) return
    const timer = window.setTimeout(() => setExpired(true), 9000)
    return () => window.clearTimeout(timer)
  }, [driving, expired])

  return (
    <AnimatePresence>
      {driving && !expired && (
        <motion.div
          className="hint"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.6 }}
        >
          {coarse ? (
            <span>Drag the joystick to drive</span>
          ) : (
            <>
              <span>
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd> or arrows to drive
              </span>
              <span>
                <kbd>Space</kbd> brake
              </span>
              <span>
                <kbd>R</kbd> reset
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
