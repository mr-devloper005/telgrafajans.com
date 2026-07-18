import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Get started', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-14 py-20 lg:grid-cols-[0.9fr_1fr]`}>
          <EditableReveal index={0}>
            <div className={`${dc.surface.card} p-8 sm:p-10`}>
              <h1 className="editable-display text-2xl font-medium tracking-[-0.015em]">{pagesContent.auth.signup.formTitle}</h1>
              <EditableLocalSignupForm />
              <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[var(--slot4-page-text)] underline underline-offset-4">
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <p className={dc.type.eyebrow}>{pagesContent.auth.signup.badge}</p>
            <h2 className={`${dc.type.heroTitle} mt-6 max-w-xl`}>
              Get started as a <span className="editable-display italic">contributor.</span>
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.auth.signup.description}</p>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
