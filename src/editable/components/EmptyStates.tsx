import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing on this shelf yet',
  description = 'New entries will appear here as they are added to the guide.',
  actionLabel = 'Back to the cover',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[var(--editable-radius-card)] border border-dashed border-[var(--editable-border-strong)] bg-[var(--slot4-warm)] p-12 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-page-text)]">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="editable-display mt-6 text-3xl font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--slot4-muted-text)]">{description}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-dark-text)]"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`New ${taskLabel} will appear here as they are added to the guide. The layout stays ready even when the shelf is empty.`}
      actionLabel="Wander the guide"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for writing — your note is in the queue and we will read it by hand."
      actionLabel="Back to the guide"
      actionHref="/"
    />
  )
}
