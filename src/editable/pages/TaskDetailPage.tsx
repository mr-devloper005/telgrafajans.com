import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowUpRight, Bookmark, Camera, CheckCircle2, Clock, Download,
  ExternalLink, FileText, Globe2, Layers, Mail, MapPin, Phone, ShieldCheck,
  StoreIcon, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle, taskDisplayLabel } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  const finalPost = task === 'pdf' ? await withResolvedPdfMeta(post) : post
  return <TaskDetailView task={task} post={finalPost} related={related} comments={comments} />
}

// Fetch the PDF once (cached for 24h per URL) so the sidebar shows the file's
// real size + page count instead of a placeholder. Missing fields on the post
// are filled from the file itself; already-set fields are preserved.
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function withResolvedPdfMeta(post: SitePost): Promise<SitePost> {
  const content = (post.content && typeof post.content === 'object') ? { ...(post.content as Record<string, unknown>) } : {}
  const existingSize = typeof content.fileSize === 'string' && (content.fileSize as string).trim()
  const existingPages = typeof content.pages === 'string' && (content.pages as string).trim()
  if (existingSize && existingPages) return post

  const fileUrlRaw =
    (typeof content.fileUrl === 'string' && content.fileUrl) ||
    (typeof content.pdfUrl === 'string' && content.pdfUrl) ||
    (typeof content.documentUrl === 'string' && content.documentUrl) ||
    (typeof content.url === 'string' && content.url) || ''
  const fileUrl = fileUrlRaw.trim()
  if (!fileUrl || !/^https?:\/\//i.test(fileUrl)) return post

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!response.ok) return post
    const buffer = new Uint8Array(await response.arrayBuffer())
    if (!existingSize) {
      const formatted = formatBytes(buffer.byteLength)
      if (formatted) content.fileSize = formatted
    }
    if (!existingPages) {
      // Count `/Type /Page` (not `/Pages`) objects — a common heuristic that
      // works for the majority of well-formed PDFs.
      const text = new TextDecoder('latin1').decode(buffer)
      const matches = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g)
      if (matches && matches.length > 0) content.pages = String(matches.length)
    }
    return { ...post, content }
  } catch {
    return post
  }
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ============================== Shared building blocks ============================== */
function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  const label = taskDisplayLabel(task, 'plural')
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-3.5 w-3.5" /> Back to {label}
    </Link>
  )
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--tk-muted)]">{children}</p>
  )
}

function Divider() {
  return <div className="my-12 h-px w-full bg-[var(--tk-line)]" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[17px] leading-[1.85]'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

/* ============================== Article ============================== */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <BackLink task="article" />
        <Kicker>{categoryOf(post, 'Field Note')}</Kicker>
        <h1 className="editable-display mt-6 text-balance text-[2.75rem] font-medium leading-[1.06] tracking-[-0.03em] sm:text-[3.75rem] lg:text-[4.25rem]">{post.title}</h1>
        {leadText(post) ? <p className="editable-display mt-8 border-l-2 border-[var(--slot4-accent-fill)] pl-6 text-[1.35rem] italic leading-[1.4] tracking-[-0.005em] text-[var(--tk-text)]">{leadText(post)}</p> : null}
        {images[0] ? (
          <img src={images[0]} alt="" className="mt-12 aspect-[16/10] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
        ) : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ============================== Listing (Places) — premium directory record ============================== */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const heroImage = images[0]
  const gallery = images.slice(1)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'openingHours', 'opening_hours'])
  const category = categoryOf(post, 'Neighborhood')
  const mapSrc = mapSrcFor(post)
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []

  return (
    <section className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <BackLink task="listing" />

      <EditableReveal index={0}>
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <div>
            <Kicker>Places · {category}</Kicker>
            <h1 className="editable-display mt-6 text-balance text-[3rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4rem] lg:text-[5.25rem]">{post.title}</h1>
            {leadText(post) ? <p className="mt-8 max-w-xl text-lg leading-[1.7] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {heroImage ? (
            <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              <div className="relative aspect-[16/10] w-full">
                <img src={heroImage} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              <StoreIcon className="h-20 w-20 text-[var(--tk-muted)]" />
            </div>
          )}
        </div>
      </EditableReveal>

      {/* Quick facts strip */}
      <EditableReveal index={1}>
        <div className="mt-14 grid gap-0 border-y border-[var(--tk-line)] py-6 sm:grid-cols-4 sm:divide-x sm:divide-[var(--tk-line)]">
          <QuickFact icon={MapPin} label="Location" value={address || 'By appointment'} />
          <QuickFact icon={Phone} label="Phone" value={phone || 'Say hello inside'} />
          <QuickFact icon={Clock} label="Hours" value={hours || 'Ask about hours'} />
          <QuickFact icon={ShieldCheck} label="Verified" value="Kept by hand" />
        </div>
      </EditableReveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <EditableReveal index={0}>
            <h2 className="editable-display text-[2.25rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.75rem]">
              About the <span className="editable-display italic">place.</span>
            </h2>
            <BodyContent post={post} />
          </EditableReveal>

          {gallery.length ? (
            <EditableReveal index={1}>
              <Divider />
              <h3 className="editable-display text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em]">Gallery</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {gallery.slice(0, 6).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
                ))}
              </div>
            </EditableReveal>
          ) : null}

          {mapSrc ? (
            <EditableReveal index={2}>
              <Divider />
              <h3 className="editable-display text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em]">On the map</h3>
              <div className="mt-6 overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                <iframe src={mapSrc} title={address || post.title} loading="lazy" className="h-[420px] w-full border-0" />
              </div>
            </EditableReveal>
          ) : null}
        </article>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Get in touch</p>
            <div className="mt-5 grid gap-3">
              {address ? <ContactRow icon={MapPin} label={address} href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} external /> : null}
              {phone ? <ContactRow icon={Phone} label={phone} href={`tel:${phone}`} /> : null}
              {email ? <ContactRow icon={Mail} label={email} href={`mailto:${email}`} /> : null}
              {website ? <ContactRow icon={Globe2} label={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
              {hours ? <ContactRow icon={Clock} label={hours} /> : null}
            </div>
            {website ? (
              <a href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)] transition hover:opacity-90">
                Visit their site <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Why it is on the shelf</p>
            <div className="mt-5 grid gap-3.5 text-sm text-[var(--tk-text)]">
              <TrustRow>Independent · not chain-owned</TrustRow>
              <TrustRow>Visited by a contributor before listing</TrustRow>
              <TrustRow>Details reviewed and kept by hand</TrustRow>
            </div>
          </div>

          <div>
            <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel className="w-full" />
          </div>

          <RelatedPanel task="listing" related={related} />
        </aside>
      </div>
    </section>
  )
}

function QuickFact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3 sm:justify-center sm:py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-text)]" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</p>
        <p className="mt-1 truncate text-[13px] font-medium text-[var(--tk-text)]">{value}</p>
      </div>
    </div>
  )
}

function ContactRow({ icon: Icon, label, href, external }: { icon: React.ComponentType<{ className?: string }>; label: string; href?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 break-words text-[14px] leading-6 text-[var(--tk-text)]">{label}</span>
      {href ? <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--tk-muted)]" /> : null}
    </>
  )
  if (!href) return <div className="flex w-full items-start gap-3">{inner}</div>
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="flex w-full items-start gap-3 transition hover:text-[var(--tk-text)]">
      {inner}
    </a>
  )
}

function TrustRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-text)]" />
      <span>{children}</span>
    </div>
  )
}

/* ============================== PDF (Reading Room) — document workspace ============================== */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const pages = getField(post, ['pages', 'pageCount'])
  const fileSize = getField(post, ['fileSize', 'size'])
  const format = getField(post, ['format']) || 'PDF'
  const category = categoryOf(post, 'Reference')
  const uploadedBy = getField(post, ['author', 'uploadedBy']) || SITE_CONFIG.name
  const filename = getField(post, ['fileName', 'filename']) || `${post.slug || 'guide'}.pdf`
  const tags = Array.isArray(post.tags) ? post.tags.slice(0, 6) : []
  const inside = tags.length ? tags : ['Overview', 'Method', 'References', 'Appendix']

  return (
    <section className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <BackLink task="pdf" />

      <EditableReveal index={0}>
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <span className="rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-text)]">
            Reading Room · Reference
          </span>
          <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">
            {format}
          </span>
          <span className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
            {category}
          </span>
        </div>

        <h1 className="editable-display mt-8 text-balance text-[3.25rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[4.75rem] lg:text-[6rem]">
          {post.title}
        </h1>

        {leadText(post) ? (
          <p className="editable-display mt-10 max-w-3xl border-l-2 border-[var(--slot4-accent-fill)] pl-6 text-[1.5rem] italic leading-[1.4] tracking-[-0.005em] text-[var(--tk-text)] sm:text-[1.75rem]">
            {leadText(post)}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {fileUrl ? (
            <>
              <a href={fileUrl} download className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)] transition hover:opacity-90">
                <Download className="h-4 w-4" /> Download the guide
              </a>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-text)] transition hover:bg-[var(--tk-text)] hover:text-[var(--tk-bg)]">
                Open in a new tab <ExternalLink className="h-4 w-4" />
              </a>
            </>
          ) : null}
        </div>
      </EditableReveal>

      <EditableReveal index={1}>
        <div className="mt-12 grid gap-0 border-y border-[var(--tk-line)] py-6 sm:grid-cols-4 sm:divide-x sm:divide-[var(--tk-line)]">
          <QuickFact icon={Layers} label="Pages" value={pages || '—'} />
          <QuickFact icon={FileText} label="File size" value={fileSize || '—'} />
          <QuickFact icon={Tag} label="Format" value={format} />
          <QuickFact icon={ShieldCheck} label="Kept" value="By hand" />
        </div>
      </EditableReveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <EditableReveal index={0}>
            <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {fileUrl ? (
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[82vh] w-full border-0 bg-[var(--tk-bg)]" />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center">
                  <span className="editable-display text-[14rem] leading-none tracking-[-0.05em] text-[var(--tk-text)]/60">Aa</span>
                </div>
              )}
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <div className="mt-16 grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="editable-display text-[2.25rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.75rem]">
                  Inside the <span className="editable-display italic">guide.</span>
                </h2>
                <BodyContent post={post} />
              </div>
              <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Chapters covered</p>
                <ol className="mt-5 grid gap-3 text-[14px] leading-6 text-[var(--tk-text)]">
                  {inside.map((item, index) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="editable-display shrink-0 text-lg font-medium text-[var(--tk-text)]">{String(index + 1).padStart(2, '0')}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </EditableReveal>

          {tags.length ? (
            <EditableReveal index={2}>
              <div className="mt-12 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-[var(--editable-radius-tag)] border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">
                    {tag}
                  </span>
                ))}
              </div>
            </EditableReveal>
          ) : null}

          <EditableReveal index={3}>
            <div className="mt-16">
              <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel className="mx-auto w-full" />
            </div>
          </EditableReveal>

          {fileUrl ? (
            <EditableReveal index={4}>
              <div className="mt-16 rounded-[var(--tk-radius)] bg-[var(--slot4-accent-fill)] p-10 text-center text-[var(--tk-text)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em]">Take it home</p>
                <h3 className="editable-display mt-4 text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
                  Keep the guide close.
                </h3>
                <a href={fileUrl} download className="mt-6 inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)]">
                  <Download className="h-4 w-4" /> Download the guide
                </a>
              </div>
            </EditableReveal>
          ) : null}
        </article>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <div className="flex h-32 items-center justify-center rounded-[var(--editable-radius-button)] bg-[var(--tk-raised)]">
              <span className="editable-display text-[6rem] leading-none tracking-[-0.05em] text-[var(--tk-text)]">Aa</span>
            </div>
            <p className="mt-5 truncate text-[13px] font-medium text-[var(--tk-text)]">{filename}</p>
            <dl className="mt-5 grid gap-3 text-[13px] text-[var(--tk-text)]">
              <IdentityRow label="Category" value={category} />
              <IdentityRow label="Pages" value={pages || '—'} />
              <IdentityRow label="File size" value={fileSize || '—'} />
              <IdentityRow label="Uploaded by" value={uploadedBy} />
            </dl>
            {fileUrl ? (
              <a href={fileUrl} download className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)]">
                <Download className="h-4 w-4" /> Download
              </a>
            ) : null}
          </div>

          <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">What is inside</p>
            <ul className="mt-4 grid gap-2.5 text-[13px] leading-6 text-[var(--tk-text)]">
              {inside.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--tk-text)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <PdfRelatedStrip related={related} />
    </section>
  )
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--tk-line)] pt-3">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">{label}</dt>
      <dd className="max-w-[55%] truncate text-right font-medium">{value}</dd>
    </div>
  )
}

function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig('pdf')
  return (
    <section className="mt-24 border-t border-[var(--tk-line)] pt-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="editable-display text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
          More from the <span className="editable-display italic">Reading Room.</span>
        </h2>
        <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-text)]">
          Browse the room <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item, index) => {
          const href = `${taskConfig?.route || '/pdf'}/${item.slug}`
          const size = getField(item, ['fileSize', 'size']) || '—'
          return (
            <EditableReveal key={item.id || item.slug} index={index}>
              <Link href={href} className="group block h-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 transition hover:-translate-y-0.5">
                <div className="flex h-28 items-center justify-center rounded-[var(--editable-radius-button)] bg-[var(--tk-raised)]">
                  <span className="editable-display text-[4rem] leading-none tracking-[-0.05em] text-[var(--tk-text)]">Aa</span>
                </div>
                <h3 className="editable-display mt-5 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.015em]">{item.title}</h3>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">
                  <FileText className="h-3.5 w-3.5" /> {size}
                </p>
              </Link>
            </EditableReveal>
          )
        })}
      </div>
    </section>
  )
}

/* ============================== Classified ============================== */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container-wide)] gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-8 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7">
            <Kicker>Board</Kicker>
            <h1 className="editable-display mt-4 text-3xl font-medium leading-tight tracking-[-0.02em]">{post.title}</h1>
            <p className="editable-display mt-6 text-[2.5rem] font-medium tracking-[-0.02em] text-[var(--tk-text)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)]"><Phone className="h-4 w-4" /> Call</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.14em]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ============================== Image ============================== */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-10 grid gap-14 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-6 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Kicker><Camera className="mr-1 inline-block h-3.5 w-3.5 -translate-y-0.5" /> Gallery</Kicker>
            <h1 className="editable-display mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-[1.7] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ============================== Bookmark ============================== */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-text)]">
          <Bookmark className="h-7 w-7" />
        </div>
        <Kicker>Shelf</Kicker>
        <h1 className="editable-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-[1.7] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <a href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)]">
            Open the link <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ============================== Profile ============================== */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-10 grid gap-14 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-medium tracking-[-0.015em]">{post.title}</h1>
              {role ? <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">{role}</p> : null}
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker>People</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

/* ============================== Shared helpers ============================== */
function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-5 grid gap-4 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--tk-text)] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--tk-bg)]">Website <ExternalLink className="h-4 w-4" /></a> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.14em]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.14em]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="mt-10 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)]">Get in touch</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = taskDisplayLabel(task, 'plural')
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="editable-display text-lg font-medium tracking-[-0.015em]">More {label.toLowerCase()}</h2>
        <Link href={taskConfig?.route || '/'} className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--tk-text)]">All</Link>
      </div>
      <div className="mt-5 grid gap-3">
        {related.slice(0, 3).map((item) => {
          const href = `${taskConfig?.route || `/${task}`}/${item.slug}`
          const image = getImages(item)[0]
          return (
            <Link key={item.id || item.slug} href={href} className="group flex gap-3 rounded-[var(--editable-radius-button)] border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-text)]">
              {image ? (
                <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-[var(--editable-radius-button)] object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--editable-radius-button)] bg-[var(--tk-raised)]">
                  <FileText className="h-5 w-5 text-[var(--tk-muted)]" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{item.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(item))}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = taskDisplayLabel(task, 'plural')
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container-wide)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="editable-display text-[2rem] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
            More {label.toLowerCase()}
          </h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-text)]">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => {
            const href = `${taskConfig?.route || `/${task}`}/${item.slug}`
            const image = getImages(item)[0]
            return (
              <EditableReveal key={item.id || item.slug} index={index}>
                <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition hover:-translate-y-0.5">
                  <div className="aspect-[4/5] overflow-hidden bg-[var(--tk-raised)]">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="editable-display line-clamp-2 text-lg font-medium leading-snug tracking-[-0.015em]">{item.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(item))}</p>
                  </div>
                </Link>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
