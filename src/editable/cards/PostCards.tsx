import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
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
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
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

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ------------------------- Editorial feature card ------------------------- */
export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`group relative block min-w-0 overflow-hidden ${dc.surface.card} ${dc.motion.lift} ${dc.motion.zoom}`}>
      <div className={`${dc.media.frameFull} ${dc.media.ratioCinema}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,65,64,0)_0%,rgba(1,65,64,0.55)_60%,rgba(1,65,64,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-page-text)]">
            {label}
          </span>
          <h3 className="editable-display mt-5 max-w-3xl text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">{getEditableExcerpt(post, 200)}</p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent-fill)]">
            Read the story <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------ Rail card -------------------------------- */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block ${dc.surface.card} ${dc.motion.lift} ${dc.motion.zoom}`}>
      <div className={`${dc.media.frameFull} ${dc.media.ratioEditorial}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <p className={`${dc.type.eyebrow}`}>№ {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}</p>
        <h3 className={`editable-display mt-3 line-clamp-3 text-[1.5rem] font-medium leading-[1.15] tracking-[-0.015em] ${pal.panelText}`}>{post.title}</h3>
        <p className={`mt-3 line-clamp-3 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 140)}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-page-text)]">
          Read more <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

/* ---------------------------- Compact index card -------------------------- */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid grid-cols-[64px_1fr] items-start gap-5 ${dc.surface.soft} p-6 ${dc.motion.lift}`}>
      <span className="editable-display flex h-14 items-center justify-center text-3xl font-medium text-[var(--slot4-page-text)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className={`${dc.type.eyebrow}`}>{getEditableCategory(post)}</p>
        <h3 className={`editable-display mt-2 line-clamp-2 text-xl font-medium leading-snug tracking-[-0.015em] ${pal.panelText}`}>{post.title}</h3>
        <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>{getEditableExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

/* ---------------------------- Article list card --------------------------- */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid min-w-0 gap-6 ${dc.surface.card} p-4 ${dc.motion.lift} ${dc.motion.zoom} sm:grid-cols-[280px_minmax(0,1fr)] sm:p-5`}>
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-[3/4]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="min-w-0 py-2 sm:py-6 sm:pr-6">
        <p className={`${dc.type.eyebrow}`}>№ {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}</p>
        <h2 className={`editable-display mt-3 line-clamp-3 text-3xl font-medium leading-[1.1] tracking-[-0.02em] ${pal.panelText} sm:text-4xl`}>{post.title}</h2>
        <p className={`mt-4 line-clamp-3 text-[15px] leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 200)}</p>
        <span className={`mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${pal.panelText}`}>
          Continue reading <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
