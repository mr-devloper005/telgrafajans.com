import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { toPlainText } from '@/editable/cards/PostCards'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { taskDisplayLabel } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => toPlainText(
  (typeof post.summary === 'string' && post.summary) ||
  compactRaw(getContent(post).description) ||
  compactRaw(getContent(post).excerpt) ||
  compactRaw(getContent(post).body) ||
  '',
)

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const displayLabel = task ? taskDisplayLabel(task, 'plural') : 'Entry'

  return (
    <Link href={href} className={`group block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute left-4 top-4 rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">{displayLabel}</span>
        </div>
      ) : (
        <div className="p-5">
          <span className="rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">{displayLabel}</span>
        </div>
      )}
      <div className="p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]">№ {String(index + 1).padStart(2, '0')}</p>
        <h2 className="editable-display mt-3 line-clamp-3 text-2xl font-medium leading-snug tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h2>
        {summary ? <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.sectionWide} pt-16 sm:pt-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.search.hero.badge}</p>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-3xl`}>
              Look through the <span className="editable-display italic">whole shelf.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
          </EditableReveal>

          <EditableReveal index={1}>
            <form action="/search" className="mt-12 grid gap-4 rounded-[var(--editable-radius-card)] border border-[var(--editable-border-strong)] bg-[var(--slot4-warm)] p-5 sm:p-6 md:grid-cols-[1fr_220px_180px_auto]">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 border-b border-[var(--editable-border-strong)] pb-2 focus-within:border-[var(--slot4-page-text)]">
                <Search className="h-5 w-5 text-[var(--slot4-muted-text)]" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[var(--slot4-muted-text)]" />
              </label>
              <input name="category" defaultValue={category} placeholder="Category" className="border-b border-[var(--editable-border-strong)] bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-page-text)]" />
              <select name="task" defaultValue={task} className="rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] px-3 py-2 text-sm outline-none">
                <option value="">All shelves</option>
                {enabledTasks.map((item) => (
                  <option key={item.key} value={item.key}>{taskDisplayLabel(item.key, 'plural')}</option>
                ))}
              </select>
              <button type="submit" className={dc.button.primary}>Search</button>
            </form>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.sectionWide} pb-24 pt-16`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={dc.type.eyebrow}>{results.length} results</p>
              <h2 className={`${dc.type.sectionTitle} mt-2`}>
                {query ? <>Results for <span className="editable-display italic">“{query}”</span></> : pagesContent.search.resultsTitle}
              </h2>
            </div>
            <Link href="/" className={dc.button.secondary}>Back to the cover <ArrowUpRight className="h-4 w-4" /></Link>
          </div>

          {results.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index % 6}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[var(--editable-radius-card)] border border-dashed border-[var(--editable-border-strong)] bg-[var(--slot4-warm)] p-16 text-center">
              <p className="editable-display text-3xl font-medium tracking-[-0.02em]">Nothing matched.</p>
              <p className="mt-3 text-sm leading-6 text-[var(--slot4-muted-text)]">Try a different word, a broader category, or another shelf.</p>
            </div>
          )}

          <div className="mt-20">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
