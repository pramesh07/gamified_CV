import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { profile, projects, roles, YEARS_OF_EXPERIENCE } from '../data/cv'
import { useGame } from '../store/useGame'

/** Title screen: shown while the island builds, then offers "drive" or "guided tour". */
export function LoadingScreen() {
  const phase = useGame((s) => s.phase)
  const start = useGame((s) => s.start)

  // A shared #tour link skips the title screen and starts the tour right away.
  useEffect(() => {
    if (phase === 'ready' && window.location.hash === '#tour') start('tour')
  }, [phase, start])

  return (
    <AnimatePresence>
      {phase !== 'playing' && (
        <motion.div
          className={`title-screen title-screen--${phase}`}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <motion.div
            className="title-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
          >
            <p className="kicker">Interactive 3D CV</p>
            <h1>{profile.name}</h1>
            <p className="title-card__role">
              {profile.title} · {profile.tagline}
            </p>
            <ul className="title-card__stats">
              <li>
                <strong>LV.{YEARS_OF_EXPERIENCE}</strong> years
              </li>
              <li>
                <strong>{roles.length}</strong> companies
              </li>
              <li>
                <strong>{projects.length}</strong> projects
              </li>
            </ul>

            {phase === 'loading' ? (
              <div className="loader" role="status">
                <div className="loader__bar" />
                <span>Building the island…</span>
              </div>
            ) : (
              <motion.div className="title-card__actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button className="btn btn--primary btn--lg" onClick={() => start('drive')} autoFocus>
                  Drive the island
                </button>
                <button className="btn btn--ghost btn--lg" onClick={() => start('tour')}>
                  Guided tour · 1 min
                </button>
              </motion.div>
            )}

            <p className="title-card__hint">
              Drive a little car around an island where every zone is a chapter of my CV.
              <br />
              In a hurry? The guided tour flies you through everything.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
