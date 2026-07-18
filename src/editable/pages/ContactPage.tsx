'use client'

import { StoreIcon, BookOpen, Mail, Handshake } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const lanes = [
  { icon: StoreIcon, title: 'Add a place', body: 'Suggest an independent shop, studio, kitchen or host-run space worth adding to the directory.' },
  { icon: BookOpen, title: 'Send a reference', body: 'Share a guide, report or reading-room reference for the shelf.' },
  { icon: Handshake, title: 'Corrections & small edits', body: 'Spotted a phone number that has changed, or a note that has aged? Send it here.' },
  { icon: Mail, title: 'Just say hi', body: 'Notes of appreciation, ideas, and quiet critiques are all welcome. We read every one.' },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} pt-16 sm:pt-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.contact.eyebrow}</p>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-3xl`}>
              A quiet inbox for <span className="editable-display italic">corrections and hellos.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.contact.description}</p>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} py-24`}>
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="grid gap-6">
              {lanes.map((lane, index) => (
                <EditableReveal key={lane.title} index={index}>
                  <div className={`${dc.surface.card} p-7`}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-page-text)]">
                      <lane.icon className="h-5 w-5" />
                    </span>
                    <h2 className="editable-display mt-5 text-xl font-medium tracking-[-0.015em]">{lane.title}</h2>
                    <p className="mt-3 text-[15px] leading-7 text-[var(--slot4-muted-text)]">{lane.body}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
            <EditableReveal index={1}>
              <div className={`${dc.surface.soft} p-8`}>
                <h2 className="editable-display text-3xl font-medium leading-snug tracking-[-0.02em]">{pagesContent.contact.formTitle}</h2>
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
