'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { taskDisplayLabel } from '@/editable/theme/task-themes'

/*
  Reference-style multi-column footer on deep-teal ground.

  Layout (desktop):
   [Brand + description + newsletter] · [Discover] · [Resources] · [Account]

  Discover uses the editable task-display labels (Places, Reading Room, …).
  Nav intentionally hides task links; footer is the discovery surface.
*/
export function EditableFooter() {
  const { session, logout } = useEditableLocalAuthSession()
  const year = new Date().getFullYear()
  const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled)

  const discoveryLinks = enabledTasks.map((task) => ({
    label: taskDisplayLabel(task.key, 'plural'),
    href: task.route,
  }))

  const resourceLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Search', href: '/search' },
  ]

  const accountLinks = session
    ? [
        { label: 'Submit', href: '/create' },
      ]
    : [
        { label: 'Sign in', href: '/login' },
        { label: 'Get started', href: '/signup' },
      ]

  return (
    <footer className="mt-24 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid max-w-[var(--editable-container-wide)] gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8 lg:py-24">
        {/* Brand + description + newsletter */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center bg-[var(--slot4-accent-fill)] text-[var(--slot4-page-text)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
            </span>
            <span className="editable-display text-2xl font-semibold tracking-[-0.01em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-[var(--editable-footer-text)]/70">
            {globalContent.footer?.description ||
              `${SITE_CONFIG.name} is a neighborhood guide to independent places worth visiting and reference guides worth reading.`}
          </p>

          <form action="/search" className="mt-8 flex max-w-md items-stretch border-b border-white/30 pb-2 transition focus-within:border-[var(--slot4-accent-fill)]">
            <input
              name="q"
              type="search"
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/55"
            />
            <button type="submit" className="ml-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--slot4-accent-fill)]">
              Go →
            </button>
          </form>

          
        </div>

        <FooterColumn title="Discover" links={discoveryLinks} arrow />
        <FooterColumn title="Resources" links={resourceLinks} />

        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent-fill)]">Account</h3>
          <div className="mt-6 grid gap-3">
            {accountLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] font-medium text-white/80 transition hover:text-[var(--slot4-accent-fill)]"
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-[15px] font-medium text-white/80 transition hover:text-[var(--slot4-accent-fill)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--editable-container-wide)] flex-col items-start gap-3 px-4 py-6 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="text-xs font-medium tracking-[0.14em] text-white/50">© {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="editable-display text-sm italic tracking-[-0.005em] text-white/70">
            {globalContent.footer?.bottomNote || 'Made with quiet attention.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links, arrow = false }: { title: string; links: Array<{ label: string; href: string }>; arrow?: boolean }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-accent-fill)]">{title}</h3>
      <div className="mt-6 grid gap-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-white/80 transition hover:text-[var(--slot4-accent-fill)]"
          >
            {item.label}
            {arrow ? <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" /> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
