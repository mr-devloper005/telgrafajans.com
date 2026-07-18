import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surfaces — one shared editorial visual language (culture-exchange reference).
  Cream + deep teal + butter accent. Playfair Display serif for display, Inter Tight sans elsewhere.
  Only kicker/note strings vary per task; every task shares the same palette.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const REF_SERIF = "'Playfair Display', 'Times New Roman', Georgia, serif"
const REF_SANS = "'Inter Tight', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: REF_SERIF,
  fontBody: REF_SANS,
  bg: '#FFFFF8',
  surface: '#FFFFF8',
  raised: '#F6F1E1',
  text: '#014140',
  muted: '#014140A3',
  line: '#01414029',
  accent: '#014140',
  accentSoft: '#FFF6C7',
  onAccent: '#FFFFF8',
  glow: 'rgba(255,233,111,0.32)',
  radius: '12px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

// User-visible display labels — Places (listing) and Reading Room (pdf).
// Kicker copy avoids "Business", "Listing", "PDF", "Document".
export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Field Notes', note: 'Long-form reads, guides and community stories worth your time.' },
  listing: { ...base, kicker: 'Places', note: 'Independent shops, studios and spaces mapped for the neighborhood.' },
  classified: { ...base, kicker: 'Board', note: 'Fresh opportunities and short-turn offers, ready to act on.' },
  image: { ...base, kicker: 'Gallery', note: 'A visual feed of standout images and portfolio moments.' },
  sbm: { ...base, kicker: 'Shelf', note: 'Curated resources, links and references worth saving.' },
  pdf: { ...base, kicker: 'Reading Room', note: 'Downloadable guides, reports and reference material.' },
  profile: { ...base, kicker: 'People', note: 'Discover the makers, hosts and creators behind the community.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

// Public display-label override for every user-facing surface (footer, cards, back-links).
// The underlying SITE_CONFIG.tasks[].label is preserved; this is the editable rename.
export const taskDisplayLabels: Record<TaskKey, { singular: string; plural: string }> = {
  article: { singular: 'Field Note', plural: 'Field Notes' },
  listing: { singular: 'Place', plural: 'Places' },
  classified: { singular: 'Board Post', plural: 'Board' },
  image: { singular: 'Image', plural: 'Gallery' },
  sbm: { singular: 'Bookmark', plural: 'Shelf' },
  pdf: { singular: 'Reading Room Guide', plural: 'Reading Room' },
  profile: { singular: 'Profile', plural: 'People' },
}

export function taskDisplayLabel(task: TaskKey, form: 'singular' | 'plural' = 'plural') {
  return taskDisplayLabels[task]?.[form] || task
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': '#FFE96F',
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
