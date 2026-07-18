import type { CSSProperties } from 'react'

/*
  Design contract — culture-exchange.webflow.io editorial system.

  Palette: cream page (#FFFFF8), deep teal ink (#014140), butter accent (#FFE96F).
  Typography: Playfair Display serif for display + h1-h4, Inter Tight sans for body/labels.
  Radii: buttons 8px, cards 12px, tags 32px (pill), inputs 0px (square).
  Motion: cubic-bezier(.22,1,.36,1). Cards lift 2px on hover; no drop shadow.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#FFFFF8',
  '--slot4-page-text': '#014140',
  '--slot4-panel-bg': '#F6F1E1',
  '--slot4-surface-bg': '#FFFFF8',
  '--slot4-muted-text': '#014140A3',
  '--slot4-soft-muted-text': '#0141407A',
  '--slot4-accent': '#014140',
  '--slot4-accent-fill': '#FFE96F',
  '--slot4-accent-soft': '#FFF6C7',
  '--slot4-accent-2': '#F2C94C',
  '--slot4-evergreen': '#CCF7E3',
  '--slot4-lavender': '#EABFFF',
  '--slot4-on-accent': '#014140',
  '--slot4-dark-bg': '#014140',
  '--slot4-dark-text': '#FFFFF8',
  '--slot4-media-bg': '#EDE7D3',
  '--slot4-cream': '#FFFFF8',
  '--slot4-warm': '#F6F1E1',
  '--slot4-gray': '#EEE9D6',
  '--slot4-body-gradient': 'none',
  '--editable-page-bg': '#FFFFF8',
  '--editable-page-text': '#014140',
  '--editable-container': '1280px',
  '--editable-container-wide': '1440px',
  '--editable-container-reader': '760px',
  '--editable-border': '#01414014',
  '--editable-border-strong': '#01414029',
  '--editable-nav-bg': '#FFFFF8',
  '--editable-nav-text': '#014140',
  '--editable-nav-active': '#014140',
  '--editable-nav-active-text': '#FFFFF8',
  '--editable-cta-bg': '#014140',
  '--editable-cta-text': '#FFFFF8',
  '--editable-search-bg': '#FFFFF8',
  '--editable-footer-bg': '#014140',
  '--editable-footer-text': '#FFFFF8',
  '--editable-radius-button': '8px',
  '--editable-radius-card': '12px',
  '--editable-radius-tag': '999px',
  '--editable-radius-input': '0px',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-page-text)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-fill)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border-strong)]',
  hairline: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/15',
  shadow: '',
  shadowStrong: '',
  overlay: 'bg-[linear-gradient(180deg,rgba(1,65,64,0.02),rgba(1,65,64,0.72))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8',
    sectionWide: 'mx-auto w-full max-w-[var(--editable-container-wide)] px-4 sm:px-6 lg:px-8',
    reader: 'mx-auto w-full max-w-[var(--editable-container-reader)] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-16 sm:py-20 lg:py-28',
    sectionYSmall: 'py-10 sm:py-14',
    sectionYLarge: 'py-24 sm:py-32 lg:py-40',
  },
  layout: {
    safeGrid: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    eyebrow: 'text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]',
    eyebrowAccent: 'text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]',
    heroTitle: 'editable-display text-[3.25rem] leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem] lg:text-[6rem]',
    displayHuge: 'editable-display text-[3.75rem] leading-[1] tracking-[-0.03em] sm:text-[5.5rem] lg:text-[8rem]',
    sectionTitle: 'editable-display text-[2.125rem] leading-[1.1] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]',
    cardTitle: 'editable-display text-[1.5rem] leading-[1.2] tracking-[-0.015em] sm:text-[1.75rem]',
    lead: 'text-lg leading-[1.65] sm:text-xl',
    body: 'text-base leading-[1.7]',
    small: 'text-sm leading-[1.6]',
    emphasis: 'editable-display italic',
  },
  surface: {
    card: `overflow-hidden border ${editablePalette.hairline} ${editablePalette.surfaceBg} rounded-[var(--editable-radius-card)]`,
    soft: `border ${editablePalette.hairline} ${editablePalette.panelBg} rounded-[var(--editable-radius-card)]`,
    dark: `${editablePalette.darkBg} ${editablePalette.darkText} rounded-[var(--editable-radius-card)]`,
    hairline: `border ${editablePalette.hairline}`,
  },
  button: {
    primary: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent)] px-6 py-3 text-sm font-medium tracking-[0.01em] text-[var(--slot4-dark-text)] transition duration-300 hover:bg-[var(--slot4-page-text)]/90 active:scale-[0.98]`,
    accent: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent-fill)] px-6 py-3 text-sm font-medium tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:brightness-95 active:scale-[0.98]`,
    secondary: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] bg-transparent px-6 py-3 text-sm font-medium tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-dark-text)] active:scale-[0.98]`,
    ghost: `inline-flex items-center justify-center gap-2 rounded-[var(--editable-radius-button)] px-4 py-2 text-sm font-medium tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-page-text)]/10`,
  },
  badge: {
    pill: 'inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] border border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)]',
    accentPill: 'inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)]',
    softPill: 'inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)]',
  },
  media: {
    frame: `relative overflow-hidden rounded-[var(--editable-radius-card)] ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
    ratioLandscape: 'aspect-[16/10]',
    ratioSquare: 'aspect-square',
    ratioEditorial: 'aspect-[3/4]',
    ratioCinema: 'aspect-[21/9]',
  },
  motion: {
    lift: 'transition-transform duration-500 hover:-translate-y-0.5',
    fade: 'transition duration-500 hover:opacity-80',
    zoom: '[&_img]:transition-transform [&_img]:duration-700 hover:[&_img]:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'All colors and fonts come from CSS variables set in editableRootStyle — never hardcode hex values inside JSX.',
  'Buttons use rounded-[var(--editable-radius-button)] (8px). Chips use rounded-[var(--editable-radius-tag)] (pill).',
  'Headlines use the .editable-display serif class. Body uses the default Inter Tight sans.',
  'Wrap section headers and grid items in <EditableReveal /> with staggered index props for premium scroll reveals.',
  'Preserve all dynamic post fetching; never replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const
