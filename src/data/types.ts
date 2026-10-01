export type ZoneId = 'spawn' | 'skills' | 'career' | 'projects' | 'campus' | 'contact'

/** Year-month string, e.g. "2017-05". */
export type YearMonth = `${number}-${number}`

export interface Profile {
  name: string
  initials: string
  title: string
  tagline: string
  location: string
  email: string
  links: { portfolio: string; linkedin: string; github: string }
  resumePdf: string
  careerStart: YearMonth
  summary: string[]
}

export interface SkillGroup {
  id: string
  label: string
  color: string
  items: string[]
}

export interface Role {
  company: string
  title: string
  start: YearMonth
  end: YearMonth | null
  location: string
  color: string
  highlights: string[]
}

export interface Education {
  institution: string
  degree: string
  college: string
  date: string
  status: 'completed' | 'in-progress'
  location: string
}

export interface Certification {
  name: string
  issuer: string
  issued: string
  validUntil: string
  url: string
  /** Short title and subtitle for the 3D signboard on the campus. */
  sign: [string, string]
}

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  stack: string[]
  roles: string[]
  color: string
}
