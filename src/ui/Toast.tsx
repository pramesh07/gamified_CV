import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGame } from '../store/useGame'

export function Toast() {
  const toast = useGame((s) => s.toast)
  const [dismissedId, setDismissedId] = useState<number | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setDismissedId(toast.id), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && dismissedId !== toast.id && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
