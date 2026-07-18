import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Download, Globe, MapPin, Phone, Search, StoreIcon, UserRound, BookOpen, Bookmark } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle, taskDisplayLabel } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-10 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 md:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase = 'group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-0.5'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const displayLabel = taskDisplayLabel(task, 'plural')
  const categoryLabel = category === 'all' ? 'Every category' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  const [beforeCol, afterCol] = voice.headline.split('.') as [string, string | undefined]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* Editorial archive header */}
        <header className="border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <EditableReveal index={0}>
              <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em]">
                <span className="text-[var(--tk-text)]">{theme.kicker}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)]" />
                <span className="text-[var(--tk-muted)]">{displayLabel}</span>
              </div>
              <h1 className="editable-display mt-8 max-w-4xl text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4rem] lg:text-[5.25rem]">
                {beforeCol}
                {afterCol !== undefined ? <span className="editable-display italic">.{afterCol}</span> : ''}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--tk-muted)]">{voice.description}</p>
              {voice.chips?.length ? (
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span key={chip} className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </EditableReveal>

            <EditableReveal index={1}>
              <div className="mt-14 flex flex-col gap-4 border-t border-[var(--tk-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--tk-muted)]">
                  <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> {posts.length === 1 ? 'entry' : 'entries'} · {categoryLabel}
                </p>
                <form action={basePath} className="flex items-center gap-2.5">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-11 appearance-none rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-text)]"
                      aria-label={voice.filterLabel}
                    >
                      <option value="all">Every category</option>
                      {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className="inline-flex h-11 items-center rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-5 text-sm font-medium uppercase tracking-[0.16em] text-[var(--tk-bg)] transition hover:opacity-90">
                    Apply
                  </button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        {/* Reading-Library archive header ad */}
        {task === 'pdf' ? (
          <div className="border-b border-[var(--tk-line)]">
            <div className="mx-auto w-full max-w-[var(--editable-container-wide)] px-4 py-6 sm:px-6 lg:px-8">
              <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel className="mx-auto w-full" />
            </div>
          </div>
        ) : null}

        <section className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          {posts.length ? (
            <>
              <div className={taskGrid[task]}>
                {posts.map((post, index) => (
                  <EditableReveal key={post.id || post.slug} index={index % 6}>
                    <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                  </EditableReveal>
                ))}
              </div>
              {/* Places (listing) archive in-feed ad — after the first 6 cards */}
              {task === 'listing' && posts.length > 6 ? (
                <div className="mt-16">
                  <Ads slot="in-feed" size={pickRandom(getSlotSizes('in-feed'))} showLabel className="mx-auto w-full max-w-3xl" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-[var(--tk-radius)] border border-dashed border-[var(--tk-line)] bg-[var(--tk-raised)] px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-6 text-3xl font-medium tracking-[-0.02em]">Nothing on this shelf yet.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--tk-muted)]">Try another category, or come back after new {displayLabel.toLowerCase()} are added.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-20 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-text)]">← Previous</Link> : null}
              <span className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-5 py-2.5 font-medium transition hover:border-[var(--tk-text)]">Next →</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <PlaceArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <ReadingRoomArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-text)]">
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Field Note')
  return (
    <Link href={href} className={cardBase}>
      <div className="aspect-[4/5] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-7">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
          <span className="text-[var(--tk-text)]">№ {String(index + 1).padStart(2, '0')}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)]" />
          <span>{category}</span>
        </div>
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-medium leading-[1.15] tracking-[-0.015em]">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read the note" />
      </div>
    </Link>
  )
}

function PlaceArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  const category = getCategory(post, 'Neighborhood')
  return (
    <Link href={href} className={`${cardBase} grid grid-cols-[180px_minmax(0,1fr)] items-stretch gap-0 md:grid-cols-[220px_minmax(0,1fr)]`}>
      <div className="aspect-square overflow-hidden bg-[var(--tk-raised)]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /> : (
          <div className="flex h-full w-full items-center justify-center"><StoreIcon className="h-9 w-9 text-[var(--tk-muted)]" /></div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-3 p-6 sm:p-7">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{category}</p>
          <h2 className="editable-display mt-3 line-clamp-2 text-2xl font-medium leading-[1.15] tracking-[-0.015em]">{post.title}</h2>
          <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {cleanDomain(website)}</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-medium tracking-[-0.02em]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-[var(--editable-radius-tag)] bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium leading-snug tracking-[-0.015em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-text)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-6 block break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-0.5">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent_45%,rgba(1,65,64,0.85))] p-6">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-snug tracking-[-0.015em] text-white">{post.title}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-accent-fill)]">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-7`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
        <Bookmark className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Saved · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-display mt-1.5 text-xl font-medium leading-snug tracking-[-0.015em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-text)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function ReadingRoomArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Reference')
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
          <BookOpen className="h-6 w-6" />
        </div>
        <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{category}</span>
      </div>
      <h2 className="editable-display mt-7 text-2xl font-medium leading-[1.15] tracking-[-0.015em]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tk-text)]">
        Open the guide <Download className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium tracking-[-0.015em]">{post.title}</h2>
      {role ? <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">{role}</p> : null}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
