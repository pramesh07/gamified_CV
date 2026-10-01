import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { profile, YEARS_OF_EXPERIENCE } from '../data/cv'
import { progressToNextYear } from '../data/format'
import { TOUR_STOPS, ZONES, ZONE_ORDER } from '../data/zones'
import type { ZoneId } from '../data/types'
import { useSound } from '../audio/sound'
import { useGame } from '../store/useGame'

function TravelMenu() {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const discovered = useGame((s) => s.discovered)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const go = (zone: ZoneId) => {
    const s = useGame.getState()
    if (s.mode === 'tour') s.goToStop(TOUR_STOPS.findIndex((stop) => stop.zone === zone))
    else s.travelTo(zone)
    setOpen(false)
  }

  return (
    <div className="travel" ref={menu}>
      <button className="hud-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden>◎</span> Travel
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="travel__menu"
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {ZONE_ORDER.map((id) => {
              const zone = ZONES[id]
              const seen = discovered.includes(id)
              return (
                <li key={id} role="none">
                  <button role="menuitem" onClick={() => go(id)} style={{ '--zone': zone.color } as CSSProperties}>
                    <span className="travel__num">{zone.number}</span>
                    <span className="travel__label">{zone.label}</span>
                    <span className="travel__seen" aria-label={seen ? 'discovered' : 'not yet discovered'}>
                      {seen ? '✓' : '·'}
                    </span>
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function MuteButton() {
  const muted = useSound((s) => s.muted)
  const toggleMuted = useSound((s) => s.toggleMuted)
  return (
    <button
      className="hud-btn hud-btn--icon"
      aria-label={muted ? 'Unmute sound (M)' : 'Mute sound (M)'}
      title={muted ? 'Unmute (M)' : 'Mute (M)'}
      onClick={toggleMuted}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" strokeLinejoin="round" />
        {muted ? (
          <path d="M17 9l5 6M22 9l-5 6" strokeLinecap="round" />
        ) : (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
        )}
      </svg>
    </button>
  )
}

export function HUD() {
  const phase = useGame((s) => s.phase)
  const mode = useGame((s) => s.mode)
  const discovered = useGame((s) => s.discovered.length)
  const xp = progressToNextYear(profile.careerStart)

  if (phase !== 'playing') return null

  return (
    <>
      <motion.header
        className="hud-player"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="avatar" aria-hidden>
          {profile.initials}
        </div>
        <div className="hud-player__info">
          <div className="hud-player__name">{profile.name}</div>
          <div className="hud-player__level">
            <span className="lv">LV.{YEARS_OF_EXPERIENCE}</span> {profile.title}
          </div>
          <div className="xp" role="img" aria-label={`${Math.round(xp * 100)}% to level ${YEARS_OF_EXPERIENCE + 1}`}>
            <motion.div
              className="xp__fill"
              initial={{ width: 0 }}
              animate={{ width: `${xp * 100}%` }}
              transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="hud-player__zones" aria-label={`${discovered} of ${ZONE_ORDER.length} zones discovered`}>
          <span>{discovered}</span>/{ZONE_ORDER.length}
          <small>zones</small>
        </div>
      </motion.header>

      <motion.nav
        className="hud-actions"
        aria-label="Game"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MuteButton />
        <TravelMenu />
        <button
          className="hud-btn hud-btn--accent"
          onClick={() => {
            const s = useGame.getState()
            if (mode === 'tour') s.takeWheel()
            else s.startTour()
          }}
        >
          {mode === 'tour' ? 'Drive' : 'Guided tour'}
        </button>
        <a className="hud-btn" href={profile.resumePdf} download>
          CV <span className="hide-sm">(PDF)</span>
        </a>
      </motion.nav>
    </>
  )
}
