import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-14 py-20 lg:grid-cols-[1fr_0.9fr]`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.auth.login.badge}</p>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-xl`}>
              Welcome <span className="editable-display italic">back.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.auth.login.description}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <div className={`${dc.surface.card} p-8 sm:p-10`}>
              <h2 className="editable-display text-2xl font-medium tracking-[-0.015em]">{pagesContent.auth.login.formTitle}</h2>
              <EditableLocalLoginForm />
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                New here?{' '}
                <Link href="/signup" className="font-semibold text-[var(--slot4-page-text)] underline underline-offset-4">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
