import { AnimatePresence, motion } from 'motion/react'
import { TOUR_STOPS, ZONES } from '../data/zones'
import { useReducedMotion } from '../hooks/useCapability'
import { useGame } from '../store/useGame'

/** Prev / Next bar for the guided tour, with a dot per stop. */
export function TourControls() {
  const visible = useGame((s) => s.phase === 'playing' && s.mode === 'tour')
  const tourIndex = useGame((s) => s.tourIndex)
  const reducedMotion = useReducedMotion()
  const stop = TOUR_STOPS[tourIndex]
  const { prevStop, nextStop, goToStop, takeWheel } = useGame.getState()

  return (
    <>
      {/* With reduced motion the camera cuts between stops; a quick fade softens the cut. */}
      {visible && reducedMotion && (
        <motion.div
          key={tourIndex}
          className="tour-fade"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="tour"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
          >
            <button className="tour__arrow" onClick={prevStop} aria-label="Previous stop (←)">
              ←
            </button>
            <div className="tour__center">
              <div className="tour__title" aria-live="polite">
                <span>
                  {tourIndex + 1}/{TOUR_STOPS.length}
                </span>{' '}
                {stop.title}
              </div>
              <div className="tour__dots">
                {TOUR_STOPS.map((s, i) => (
                  <button
                    key={i}
                    aria-label={`Go to stop ${i + 1}: ${s.title}`}
                    aria-current={i === tourIndex}
                    style={{ background: i === tourIndex ? ZONES[s.zone].color : undefined }}
                    onClick={() => goToStop(i)}
                  />
                ))}
              </div>
            </div>
            <button className="tour__arrow" onClick={nextStop} aria-label="Next stop (→)">
              →
            </button>
            <button className="hud-btn hud-btn--accent tour__wheel" onClick={takeWheel}>
              Take the wheel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
