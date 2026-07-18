import Link from 'next/link'
import { ArrowUpRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export function EditableArticleArchive({ posts, pagination, category = 'all', basePath = '/article' }: { posts: SitePost[]; pagination: SiteFeedPagination; category?: string; basePath?: string }) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) => `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.sectionWide} pt-16 sm:pt-24`}>
        <EditableReveal index={0}>
          <p className={dc.type.eyebrow}>{voice.eyebrow}</p>
          <h1 className={`${dc.type.heroTitle} mt-6 max-w-4xl`}>
            {voice.headline}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{voice.description}</p>
          <form action={basePath} className="mt-10 flex max-w-xl gap-3">
            <select name="category" defaultValue={category || 'all'} className="min-w-0 flex-1 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm outline-none">
              <option value="all">Every topic</option>
              {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <button className={dc.button.primary}>Filter</button>
          </form>
        </EditableReveal>
      </section>

      <section className={`${dc.shell.sectionWide} py-20`}>
        {posts.length ? (
          <div className="grid gap-8">
            {posts.map((post, index) => (
              <EditableReveal key={post.id} index={index % 4}>
                <ArticleListCard post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />
              </EditableReveal>
            ))}
          </div>
        ) : (
          <div className={`${dc.surface.soft} p-12 text-center`}>
            <h2 className="editable-display text-3xl font-medium tracking-[-0.02em]">Nothing on this shelf.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Try another topic or come back later.</p>
          </div>
        )}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? <Link href={pageHref(page - 1)} className="rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-5 py-2.5 text-sm font-medium">← Previous</Link> : null}
          <span className="rounded-[var(--editable-radius-button)] bg-[var(--slot4-page-text)] px-5 py-2.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--slot4-dark-text)]">Page {page} of {pagination.totalPages || 1}</span>
          {pagination.hasNextPage ? <Link href={pageHref(page + 1)} className="rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-5 py-2.5 text-sm font-medium">Next →</Link> : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-14 sm:pt-20`}>
        <Link href="/article" className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
          <ChevronLeft className="h-3.5 w-3.5" /> Field Notes
        </Link>
        <p className={`${dc.type.eyebrow} mt-10`}>{voice.eyebrow}</p>
        <h1 className={`${dc.type.heroTitle} mt-6 max-w-4xl`}>
          {post?.title || pagesContent.detailPages.article.fallbackTitle}
        </h1>
      </section>
      <section className={`${dc.shell.reader} pb-24 pt-12`}>
        <div className={`${dc.surface.card} p-8 sm:p-10`}>
          <p className="text-[15px] leading-[1.75] text-[var(--slot4-muted-text)]">
            {post?.summary || `Field note content for ${slug} will render through the editable detail page.`}
          </p>
          <Link href="/contact" className={`${dc.button.secondary} mt-8`}>
            Send a note <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
