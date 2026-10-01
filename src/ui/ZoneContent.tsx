import { useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { certifications, education, profile, projects, roles, skillGroups, YEARS_OF_EXPERIENCE } from '../data/cv'
import { formatRange } from '../data/format'
import { useGame } from '../store/useGame'

const tint = (color: string) => ({ '--tint': color }) as CSSProperties

function Chips({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul className="chips" style={color ? tint(color) : undefined}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function SpawnContent() {
  const skillCount = skillGroups.reduce((n, g) => n + g.items.length, 0)
  const stats = [
    { value: `${YEARS_OF_EXPERIENCE}+`, label: 'years' },
    { value: roles.length, label: 'companies' },
    { value: projects.length, label: 'projects' },
    { value: skillCount, label: 'skills' },
  ]
  return (
    <>
      <p className="lede">
        {profile.tagline} based in {profile.location}.
      </p>
      <dl className="stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      {profile.summary.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
      {certifications.map((c) => (
        <p key={c.name} className="muted">
          <strong>Certification:</strong> {c.name}
        </p>
      ))}
      <p className="note">Follow the dirt paths, or use Travel, to reach every zone.</p>
    </>
  )
}

export function SkillsContent() {
  const mode = useGame((s) => s.mode)
  return (
    <>
      {skillGroups.map((group) => (
        <section key={group.id} className="group">
          <h3 style={tint(group.color)}>{group.label}</h3>
          <Chips items={group.items} color={group.color} />
        </section>
      ))}
      {mode === 'drive' && (
        <button className="btn btn--ghost" onClick={() => useGame.getState().restack()}>
          Restack the crates
        </button>
      )}
    </>
  )
}

export function CareerContent() {
  const careerIndex = useGame((s) => s.careerIndex)
  const role = roles[careerIndex]
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Roles">
        {roles.map((r, i) => (
          <button
            key={r.company}
            role="tab"
            aria-selected={i === careerIndex}
            style={tint(r.color)}
            onClick={() => useGame.getState().selectCareer(i)}
          >
            <span className="tabs__year">{r.start.slice(0, 4)}</span>
            {r.company}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          key={role.company}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <h3 className="role__title">{role.title}</h3>
          <p className="meta" style={tint(role.color)}>
            <strong>{role.company}</strong> · {formatRange(role.start, role.end)} · {role.location}
          </p>
          <ul className="bullets">
            {role.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </motion.article>
      </AnimatePresence>
    </>
  )
}

export function ProjectsContent() {
  const projectIndex = useGame((s) => s.projectIndex)
  const project = projects[projectIndex]
  const select = (i: number) => useGame.getState().selectProject((i + projects.length) % projects.length)

  return (
    <>
      <div className="cabinets" role="tablist" aria-label="Projects">
        {projects.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={i === projectIndex}
            aria-label={p.name}
            title={p.name}
            style={tint(p.color)}
            onClick={() => select(i)}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          key={project.id}
          role="tabpanel"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.18 }}
        >
          <h3 className="role__title">{project.name}</h3>
          <p className="meta" style={tint(project.color)}>
            {project.tagline}
          </p>
          <p>{project.description}</p>
          <Chips items={project.stack} color={project.color} />
          <h4>What I did</h4>
          <ul className="bullets">
            {project.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </motion.article>
      </AnimatePresence>
      <div className="pager">
        <button className="btn btn--ghost" onClick={() => select(projectIndex - 1)}>
          ← Prev
        </button>
        <span>
          {projectIndex + 1} / {projects.length}
        </span>
        <button className="btn btn--ghost" onClick={() => select(projectIndex + 1)}>
          Next →
        </button>
      </div>
    </>
  )
}

export function CampusContent() {
  return (
    <>
      <section className="group">
        <h3 style={tint('#b57bff')}>Education</h3>
        {education.map((e) => (
          <article key={e.institution} className="card">
            <span className={`badge badge--${e.status}`}>{e.status === 'completed' ? 'Completed' : 'In progress'}</span>
            <h3 className="role__title">{e.degree}</h3>
            <p className="meta">
              <strong>{e.institution}</strong> · {e.college}
            </p>
            <p className="muted">
              {e.date} · {e.location}
            </p>
          </article>
        ))}
      </section>
      <section className="group">
        <h3 style={tint('#f7b731')}>Certifications</h3>
        {certifications.map((c) => (
          <article key={c.name} className="card">
            <span className="badge badge--completed">Certified</span>
            <h3 className="role__title">{c.name}</h3>
            <p className="meta">
              <strong>{c.issuer}</strong> · Issued {c.issued}
            </p>
            <p className="muted">
              Valid until {c.validUntil} ·{' '}
              <a href={c.url} target="_blank" rel="noreferrer">
                Verify on Credly
              </a>
            </p>
          </article>
        ))}
      </section>
    </>
  )
}

export function ContactContent() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  const links = [
    { label: 'Portfolio', href: profile.links.portfolio },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'GitHub', href: profile.links.github },
  ].filter((l) => l.href)

  return (
    <>
      <p className="lede">Thanks for driving by. The mailbox is always open.</p>
      <div className="contact-email">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button className="btn btn--ghost" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div className="contact-links">
        {links.map((l) => (
          <a key={l.label} className="btn btn--ghost" href={l.href} target="_blank" rel="noreferrer">
            {l.label} ↗
          </a>
        ))}
        <a className="btn btn--primary" href={profile.resumePdf} download>
          Download CV (PDF)
        </a>
      </div>
    </>
  )
}
