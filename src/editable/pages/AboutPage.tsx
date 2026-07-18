import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} pt-16 sm:pt-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.about.badge}</p>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-3xl`}>
              About <span className="editable-display italic">{SITE_CONFIG.name}.</span>
            </h1>
            <p className="mt-10 max-w-2xl text-xl leading-[1.65] text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} py-24`}>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <EditableReveal index={0}>
              <div className="editable-display text-[2.5rem] font-medium italic leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-[3rem]">
                “A guide should feel like a well-kept notebook, not a marketplace.”
              </div>
            </EditableReveal>
            <div className="grid gap-6">
              {pagesContent.about.paragraphs.map((paragraph, index) => (
                <EditableReveal key={paragraph} index={index + 1}>
                  <p className="text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{paragraph}</p>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]">
          <div className={`${dc.shell.section} py-24`}>
            <EditableReveal index={0}>
              <p className={dc.type.eyebrow}>What we care about</p>
              <h2 className={`${dc.type.sectionTitle} mt-4 max-w-3xl`}>
                Three things we hold to.
              </h2>
            </EditableReveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {pagesContent.about.values.map((value, index) => (
                <EditableReveal key={value.title} index={index}>
                  <div className={`${dc.surface.card} h-full p-8`}>
                    <span className="editable-display text-4xl font-medium leading-none text-[var(--slot4-page-text)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="editable-display mt-6 text-2xl font-medium leading-snug tracking-[-0.015em]">{value.title}</h3>
                    <p className="mt-4 text-[15px] leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
