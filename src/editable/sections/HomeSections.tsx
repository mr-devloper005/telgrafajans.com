import Link from 'next/link'
import { ArrowUpRight, BookOpen, MapPin, Sparkles } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { globalContent } from '@/editable/content/global.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { taskDisplayLabel } from '@/editable/theme/task-themes'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* ============================== HERO ============================== */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const feature = pool[0]
  const featureImage = feature ? getEditablePostImage(feature) : ''
  const heroTitle = pagesContent.home.hero.title
  const primaryLabel = taskDisplayLabel(primaryTask, 'plural')

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className="mx-auto w-full max-w-[var(--editable-container-wide)] px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <EditableReveal index={0}>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] border border-[var(--editable-border-strong)] bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
              <Sparkles className="h-3.5 w-3.5" /> {pagesContent.home.hero.badge}
            </span>
            <h1 className="editable-display mt-8 text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.03em] text-[var(--slot4-page-text)] sm:text-[4.25rem] lg:text-[5.75rem]">
              {heroTitle[0]} <span className="editable-display italic text-[var(--slot4-page-text)]/85">{heroTitle[1]}</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">
              {pagesContent.home.hero.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={pagesContent.home.hero.primaryCta.href} className={dc.button.primary}>
                {pagesContent.home.hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href={pagesContent.home.hero.secondaryCta.href} className={dc.button.secondary}>
                {pagesContent.home.hero.secondaryCta.label}
              </Link>
            </div>

            <form action="/search" className="mt-10 flex max-w-xl items-stretch border-b border-[var(--editable-border-strong)] pb-2 transition focus-within:border-[var(--slot4-page-text)]">
              <input
                name="q"
                type="search"
                placeholder={pagesContent.home.hero.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
              <button type="submit" className="ml-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-page-text)]">
                Search →
              </button>
            </form>
          </EditableReveal>

          {feature ? (
            <EditableReveal index={1}>
              <Link href={postHref(primaryTask, feature, primaryRoute)} className="group block overflow-hidden rounded-[var(--editable-radius-card)] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={featureImage} alt={feature.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--slot4-page-text)]">
                    {pagesContent.home.hero.featureCardBadge}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(1,65,64,0),rgba(1,65,64,0.85))] p-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-accent-fill)]">On the cover · {primaryLabel}</p>
                    <h3 className="editable-display mt-3 line-clamp-3 text-2xl font-medium leading-snug tracking-[-0.015em] text-white sm:text-3xl">
                      {feature.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </EditableReveal>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ============================== STORY RAIL ============================== */
export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 8)
  if (!pool.length) return null
  return (
    <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]">
      <div className={`${dc.shell.sectionWide} py-20 sm:py-24`}>
        <EditableReveal index={0}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className={dc.type.eyebrow}>{globalContent.commonLabels.latest}</p>
              <h2 className={`${dc.type.sectionTitle} mt-3`}>On the shelves this week.</h2>
            </div>
            <Link href={primaryRoute} className={dc.button.secondary}>
              See all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className={`mt-12 ${dc.layout.rail}`}>
          {pool.map((post, index) => (
            <EditableReveal key={post.id || post.slug} index={index} className={dc.layout.minRailCard}>
              <Link href={postHref(primaryTask, post, primaryRoute)} className={`group block overflow-hidden ${dc.surface.card}`}>
                <div className={`${dc.media.frameFull} ${dc.media.ratioEditorial}`}>
                  <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="p-6">
                  <p className={dc.type.eyebrow}>№ {String(index + 1).padStart(2, '0')} · {categoryOf(post) || 'Featured'}</p>
                  <h3 className="editable-display mt-3 line-clamp-3 text-2xl font-medium leading-snug tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 120)}</p>
                </div>
              </Link>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================== MAGAZINE SPLIT (Intro + benefits + stats) ============================== */
export function EditableMagazineSplit({ posts, timeSections }: HomeSectionProps) {
  const intro = pagesContent.home.intro
  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const totalCount = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).length
  const listingCount = Math.max(1, Math.floor(totalCount * 0.4))
  const pdfCount = Math.max(1, Math.floor(totalCount * 0.35))
  const stats = [
    { value: totalCount.toString().padStart(2, '0'), label: 'entries in the guide' },
    { value: listingCount.toString().padStart(2, '0'), label: 'places on the map' },
    { value: pdfCount.toString().padStart(2, '0'), label: 'items in the reading room' },
    { value: enabledTasks.length.toString().padStart(2, '0'), label: 'shelves to wander' },
  ]

  return (
    <>
      {/* Intro editorial split */}
      <section className="bg-[var(--slot4-page-bg)]">
        <div className={`${dc.shell.sectionWide} py-24 sm:py-32`}>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <EditableReveal index={0}>
              <p className={dc.type.eyebrow}>{intro.badge}</p>
              <h2 className={`${dc.type.sectionTitle} mt-4 max-w-lg`}>
                Two things, kept in <span className="editable-display italic">one place.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={intro.primaryLink.href} className={dc.button.primary}>
                  {intro.primaryLink.label} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href={intro.secondaryLink.href} className={dc.button.secondary}>
                  {intro.secondaryLink.label}
                </Link>
              </div>
            </EditableReveal>

            <div className="grid gap-6">
              {intro.paragraphs.map((paragraph, index) => (
                <EditableReveal key={paragraph} index={index + 1}>
                  <p className="text-lg leading-[1.7] text-[var(--slot4-muted-text)] sm:text-xl">
                    {paragraph}
                  </p>
                </EditableReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefit / how-it-works grid */}
      <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-warm)]">
        <div className={`${dc.shell.sectionWide} py-24 sm:py-32`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{intro.sideBadge}</p>
            <h2 className={`${dc.type.sectionTitle} mt-4 max-w-2xl`}>
              What you will find <span className="editable-display italic">on the shelves.</span>
            </h2>
          </EditableReveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {intro.sidePoints.map((point, index) => (
              <EditableReveal key={point} index={index}>
                <div className={`${dc.surface.card} flex h-full flex-col p-7`}>
                  <span className="editable-display text-4xl font-medium leading-none text-[var(--slot4-page-text)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-6 text-[15px] leading-7 text-[var(--slot4-page-text)]">{point}</p>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Accent stats band */}
      <section className="bg-[var(--slot4-accent-fill)] text-[var(--slot4-page-text)]">
        <div className={`${dc.shell.sectionWide} py-20 sm:py-24`}>
          <EditableReveal index={0}>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]">Kept by hand</p>
            <h2 className="editable-display mt-4 max-w-3xl text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.75rem]">
              A short guide, added to slowly.
            </h2>
          </EditableReveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <EditableReveal key={stat.label} index={index}>
                <div className="border-t border-[var(--slot4-page-text)]/25 pt-6">
                  <p className="editable-display text-[3.5rem] font-medium leading-none tracking-[-0.03em] sm:text-[4.5rem]">{stat.value}</p>
                  <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)]/75">{stat.label}</p>
                </div>
              </EditableReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ============================== TIME COLLECTIONS (Recent activity grid) ============================== */
export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])
  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  const sectionCopy: Record<string, { eyebrow: string; title: string; italic?: string }> = {
    spotlight: { eyebrow: 'This week', title: 'Fresh from the shelves', italic: 'this week.' },
    browse: { eyebrow: 'Trending', title: 'Popular in the reading room', italic: 'this month.' },
    index: { eyebrow: 'Evergreen', title: 'Quiet corners of', italic: 'the archive.' },
  }

  return (
    <>
      {visible.map((section, sIndex) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More from the guide' }
        return (
          <section key={section.key} className={sIndex % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]'}>
            <div className={`${dc.shell.sectionWide} py-24 sm:py-28`}>
              <EditableReveal index={0}>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
                    <h2 className={`${dc.type.sectionTitle} mt-3 max-w-xl`}>
                      {copy.title} {copy.italic ? <span className="editable-display italic">{copy.italic}</span> : null}
                    </h2>
                  </div>
                  <Link href={section.href || primaryRoute} className={dc.button.secondary}>
                    See all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </EditableReveal>

              <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {section.posts.slice(0, 6).map((post, index) => (
                  <EditableReveal key={post.id || post.slug} index={index}>
                    <Link href={postHref(primaryTask, post, primaryRoute)} className={`group block h-full overflow-hidden ${dc.surface.card}`}>
                      <div className={`${dc.media.frameFull} ${dc.media.ratioLandscape}`}>
                        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                      </div>
                      <div className="p-7">
                        <p className={dc.type.eyebrow}>{categoryOf(post) || 'Featured'}</p>
                        <h3 className="editable-display mt-3 line-clamp-2 text-2xl font-medium leading-[1.2] tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h3>
                        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[var(--slot4-muted-text)]">{getExcerpt(post, 140)}</p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
                          Continue <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ============================== CTA BAND (dark teal card + pull quote) ============================== */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="bg-[var(--slot4-page-bg)]">
      <div className={`${dc.shell.sectionWide} pb-24 pt-12 sm:pb-32`}>
        <EditableReveal index={0}>
          <div className="rounded-[var(--editable-radius-card)] bg-[var(--slot4-dark-bg)] px-8 py-14 text-[var(--slot4-dark-text)] sm:px-14 sm:py-20 lg:px-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent-fill)]">
                  <BookOpen className="mr-1 inline-block h-3.5 w-3.5 -translate-y-0.5" /> {cta.badge}
                </p>
                <h2 className="editable-display mt-6 max-w-2xl text-[2.5rem] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4rem]">
                  {cta.title.split('worth')[0]}
                  <span className="editable-display italic text-[var(--slot4-accent-fill)]">worth{cta.title.split('worth')[1] || ''}</span>
                </h2>
              </div>
              <div>
                <p className="text-lg leading-[1.7] text-white/75">{cta.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={cta.primaryCta.href} className={dc.button.accent}>
                    {cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={cta.secondaryCta.href} className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                    {cta.secondaryCta.label}
                  </Link>
                </div>
                <p className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50">
                  <MapPin className="h-3.5 w-3.5" /> Read every note by hand · usually within a few days
                </p>
              </div>
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
