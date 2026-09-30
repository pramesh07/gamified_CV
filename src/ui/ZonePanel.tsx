import type { CSSProperties, ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ZONES } from '../data/zones'
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
  campus: { title: 'Education', body: CampusContent },
  contact: { title: 'Get in touch', body: ContactContent },
}

/** HTML panel with the CV content for whichever zone is active; slides in over the 3D scene. */
export function ZonePanel() {
  const zoneId = usePanelZone()
  const open = useGame((s) => s.panelOpen)
  const playing = useGame((s) => s.phase === 'playing')
  const setPanelOpen = useGame((s) => s.setPanelOpen)

  if (!playing) return null
  const zone = zoneId ? ZONES[zoneId] : null
  const content = zoneId ? CONTENT[zoneId] : null

  return (
    <>
      <AnimatePresence mode="wait">
        {zone && content && open && (
          <motion.aside
            key={zone.id}
            className="panel"
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
              <h2 id="panel-title">{content.title}</h2>
              <button className="panel__close" aria-label="Close panel (Esc)" onClick={() => setPanelOpen(false)}>
                ×
              </button>
            </header>
            <div className="panel__body">
              <content.body />
            </div>
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
