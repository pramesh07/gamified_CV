import type { YearMonth } from './types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parse(ym: YearMonth) {
  const [year, month] = ym.split('-').map(Number)
  return { year, month }
}

/** Whole years elapsed since a year-month, e.g. "2017-05" → 9 in Sep 2026. */
export function yearsSince(start: YearMonth, now = new Date()) {
  const { year, month } = parse(start)
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
  return Math.floor(months / 12)
}

/** Fraction (0–1) of the way to the next work anniversary — drives the HUD XP bar. */
export function progressToNextYear(start: YearMonth, now = new Date()) {
  const { month } = parse(start)
  const monthsInto = (now.getMonth() + 1 - month + 12) % 12
  return (monthsInto + now.getDate() / 31) / 12
}

export function formatYearMonth(ym: YearMonth) {
  const { year, month } = parse(ym)
  return `${MONTHS[month - 1]} ${year}`
}

export function formatRange(start: YearMonth, end: YearMonth | null) {
  return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`
}
