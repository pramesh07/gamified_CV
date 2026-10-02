import type { CSSProperties, ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ZONES } from '../data/zones'
import { panelRect } from '../game/refs'
import { useCompactLayout } from '../hooks/useCapability'
import type { ZoneId } from '../data/types'
import { useGame, usePanelZone } from '../store/useGame'
import {
  CampusContent,
  CareerContent,
  ContactContent,
  ProjectsContent,
  SkillsContent,
  SpawnContent,
} from './ZoneContent'

const CONTENT: Record<ZoneId, { title: string; body: ComponentType }> = {
  spawn: { title: 'Pramesh Karmacharya', body: SpawnContent },
  skills: { title: 'Technical skills', body: SkillsContent },
  career: { title: 'Professional experience', body: CareerContent },
  projects: { title: 'Major projects', body: ProjectsContent },
  campus: { title: 'Education & certifications', body: CampusContent },
  contact: { title: 'Get in touch', body: ContactContent },
}

/** Publishes where the panel sits on screen so the camera can frame the scene beside it. */
function trackRect(node: HTMLElement | null) {
  if (!node) return
  // offset* ignores the slide-in transform, so the rect is where the panel settles.
  const measure = () =>
    Object.assign(panelRect, {
      left: node.offsetLeft,
      top: node.offsetTop,
      right: node.offsetLeft + node.offsetWidth,
      bottom: node.offsetTop + node.offsetHeight,
    })
  const observer = new ResizeObserver(measure)
  observer.observe(node)
  window.addEventListener('resize', measure)
  return () => {
    observer.disconnect()
    window.removeEventListener('resize', measure)
    Object.assign(panelRect, { left: 0, top: 0, right: 0, bottom: 0 })
  }
}

/** HTML panel with the CV content for whichever zone is active; slides in over the 3D scene. */
export function ZonePanel() {
  const zoneId = usePanelZone()
  const open = useGame((s) => s.panelOpen)
  const playing = useGame((s) => s.phase === 'playing')
  const expanded = useGame((s) => s.panelExpanded)
  const setPanelOpen = useGame((s) => s.setPanelOpen)
  const setPanelExpanded = useGame((s) => s.setPanelExpanded)
  // Phones get a slim header that expands on tap, so the panel doesn't hide the road.
  const compact = useCompactLayout()
  const showBody = !compact || expanded

  if (!playing) return null
  const zone = zoneId ? ZONES[zoneId] : null
  const content = zoneId ? CONTENT[zoneId] : null

  return (
    <>
      <AnimatePresence mode="wait">
        {zone && content && open && (
          <motion.aside
            key={zone.id}
            ref={trackRect}
            className={showBody ? 'panel' : 'panel panel--collapsed'}
            style={{ '--zone': zone.color } as CSSProperties}
            aria-labelledby="panel-title"
            aria-live="polite"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className="panel__header">
              <p className="kicker">
                Zone {zone.number} · {zone.label}
              </p>
              <h2 id="panel-title">
                {compact ? (
                  <button
                    className="panel__toggle"
                    aria-expanded={expanded}
                    aria-controls="panel-body"
                    onClick={() => setPanelExpanded(!expanded)}
                  >
                    {content.title}
                    <span className="panel__chevron" aria-hidden>
                      ▾
                    </span>
                  </button>
                ) : (
                  content.title
                )}
              </h2>
              <button className="panel__close" aria-label="Close panel (Esc)" onClick={() => setPanelOpen(false)}>
                ×
              </button>
            </header>
            {showBody && (
              <div className="panel__body" id="panel-body">
                <content.body />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {zone && !open && (
        <button
          className="panel-reopen"
          style={{ '--zone': zone.color } as CSSProperties}
          onClick={() => setPanelOpen(true)}
        >
          Open {zone.label}
        </button>
      )}
    </>
  )
}
