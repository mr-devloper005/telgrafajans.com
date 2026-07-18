'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, PlusCircle, LogIn, UserPlus, LogOut } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Reference-driven editorial navbar.

  Rules:
  - No task-archive links (no Places, no Reading Room). Discovery lives in the footer.
  - Only About + Contact (plus any other static pages) between the logo and the actions.
  - Right side: search icon (→ /search) + auth actions.
  - Cream on cream, tracked small-caps labels, hairline underline on active.
*/

const staticLinks: Array<{ label: string; href: string }> = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container-wide)] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-page-text)] text-[var(--slot4-dark-text)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-10 w-10 object-contain" />
          </span>
          <span className="editable-display block max-w-[240px] truncate text-xl font-semibold leading-none tracking-[-0.01em] text-[var(--slot4-page-text)]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {staticLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition ${
                  active
                    ? 'text-[var(--slot4-page-text)]'
                    : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-[var(--slot4-page-text)]" />
                ) : null}
              </Link>
            )
          })}
        </div>

        <span className="ml-auto" />

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/search"
            aria-label={globalContent.commonLabels?.search || 'Search'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border-strong)] text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-dark-text)]"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent-fill)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:brightness-95"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-dark-text)]"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:bg-[var(--slot4-page-text)] hover:text-[var(--slot4-dark-text)]"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-accent-fill)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-page-text)] transition hover:brightness-95"
              >
                <UserPlus className="h-3.5 w-3.5" /> Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border-strong)] text-[var(--slot4-page-text)] md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div className="h-px bg-[var(--editable-border)]" />

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-4 py-6 md:hidden">
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="mb-4 flex items-center gap-3 rounded-[var(--editable-radius-button)] border border-[var(--editable-border-strong)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)]"
          >
            <Search className="h-4 w-4" /> Search {SITE_CONFIG.name}
          </Link>
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...staticLinks, ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }])].map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-[var(--editable-radius-button)] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.18em] transition ${
                    active
                      ? 'bg-[var(--slot4-page-text)] text-[var(--slot4-dark-text)]'
                      : 'text-[var(--slot4-muted-text)] hover:bg-[var(--slot4-accent-soft)] hover:text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button
                type="button"
                onClick={() => { logout(); setOpen(false) }}
                className="rounded-[var(--editable-radius-button)] px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
