import { certifications, education, profile, projects, roles, skillGroups } from '../data/cv'
import { formatRange } from '../data/format'

/** Last resort for browsers without WebGL2: the same CV data as plain, readable HTML. */
export function NoWebGLFallback() {
  const links = [
    { label: 'Portfolio', href: profile.links.portfolio },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'GitHub', href: profile.links.github },
  ].filter((l) => l.href)

  return (
    <main className="fallback">
      <p className="fallback__notice">
        This CV is an interactive 3D world, but your browser can't run WebGL. Here's the plain version.
      </p>
      <header>
        <h1>{profile.name}</h1>
        <p>
          {profile.title} · {profile.location}
        </p>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          {links.map((l) => (
            <span key={l.label}>
              {' · '}
              <a href={l.href}>{l.label}</a>
            </span>
          ))}
          {' · '}
          <a href={profile.resumePdf} download>
            Download PDF
          </a>
        </p>
      </header>

      <section>
        <h2>Summary</h2>
        {profile.summary.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </section>

      <section>
        <h2>Experience</h2>
        {[...roles].reverse().map((r) => (
          <article key={r.company}>
            <h3>
              {r.title} · {r.company}
            </h3>
            <p className="fallback__meta">
              {formatRange(r.start, r.end)} · {r.location}
            </p>
            <ul>
              {r.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((p) => (
          <article key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="fallback__meta">{p.stack.join(' · ')}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {skillGroups.map((g) => (
          <p key={g.id}>
            <strong>{g.label}:</strong> {g.items.join(', ')}
          </p>
        ))}
      </section>

      <section>
        <h2>Education &amp; certifications</h2>
        {education.map((e) => (
          <p key={e.institution}>
            <strong>{e.degree}</strong>, {e.institution} ({e.college}) · {e.date}
          </p>
        ))}
        {certifications.map((c) => (
          <p key={c.name}>
            <strong>{c.name}</strong>, {c.issuer} · {c.issued} ·{' '}
            <a href={c.url} target="_blank" rel="noreferrer">
              Verify
            </a>
          </p>
        ))}
      </section>
    </main>
  )
}
