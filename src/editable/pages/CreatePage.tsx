'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, StoreIcon, BookOpen, Bookmark, UserRound, Megaphone } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { taskDisplayLabel } from '@/editable/theme/task-themes'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: StoreIcon,
  classified: Megaphone,
  image: ImageIcon,
  profile: UserRound,
  pdf: BookOpen,
  sbm: Bookmark,
}

const fieldClass = 'w-full border-b border-[var(--editable-border-strong)] bg-transparent py-3 text-base font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)] transition focus:border-[var(--slot4-page-text)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
          <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-14 py-20 lg:grid-cols-[0.9fr_1.1fr]`}>
            <EditableReveal index={0}>
              <div className={`${dc.surface.dark} flex h-[420px] items-center justify-center`}>
                <Lock className="h-20 w-20 text-[var(--slot4-accent-fill)]" />
              </div>
            </EditableReveal>
            <EditableReveal index={1}>
              <p className={dc.type.eyebrow}>{pagesContent.create.locked.badge}</p>
              <h1 className={`${dc.type.heroTitle} mt-6 max-w-2xl`}>
                Sign in to add to <span className="editable-display italic">the guide.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/login" className={dc.button.primary}>Sign in <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/signup" className={dc.button.secondary}>Get started</Link>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className={`${dc.shell.section} pt-16 sm:pt-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.create.hero.badge}</p>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-3xl`}>
              Add to <span className="editable-display italic">the guide.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-[1.7] text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} py-20`}>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <EditableReveal index={0}>
              <p className={dc.type.eyebrow}>Choose a shelf</p>
              <div className="mt-6 grid gap-3">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  const label = taskDisplayLabel(item.key, 'plural')
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`flex items-center gap-4 rounded-[var(--editable-radius-card)] border p-5 text-left transition ${
                        active
                          ? 'border-[var(--slot4-page-text)] bg-[var(--slot4-accent-fill)]'
                          : 'border-[var(--editable-border-strong)] bg-[var(--slot4-surface-bg)] hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${active ? 'bg-[var(--slot4-page-text)] text-[var(--slot4-dark-text)]' : 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-page-text)]'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="editable-display block text-lg font-medium tracking-[-0.015em] text-[var(--slot4-page-text)]">{label}</span>
                        <span className="mt-1 block text-xs font-medium text-[var(--slot4-muted-text)]">{item.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <form onSubmit={submit} className={`${dc.surface.card} p-8 sm:p-10`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={dc.type.eyebrow}>{pagesContent.create.formTitle}</p>
                    <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.02em]">
                      New {taskDisplayLabel(task, 'singular').toLowerCase()}
                    </h2>
                  </div>
                  <span className="rounded-[var(--editable-radius-tag)] bg-[var(--slot4-accent-fill)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--slot4-page-text)]">{session.name}</span>
                </div>

                <div className="mt-8 grid gap-6">
                  <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Entry title" required />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                    <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                  </div>
                  <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                  <textarea className={`${fieldClass} min-h-24 resize-y`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short note (one paragraph)" required />
                  <textarea className={`${fieldClass} min-h-48 resize-y`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main body — details, notes, description" required />
                </div>

                {created ? (
                  <div className="mt-6 rounded-[var(--editable-radius-button)] border border-[var(--slot4-page-text)]/20 bg-[var(--slot4-accent-soft)] p-4 text-[var(--slot4-page-text)]">
                    <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4" /> {pagesContent.create.successTitle}</p>
                    <p className="mt-1 text-sm">{created.title}</p>
                  </div>
                ) : null}

                <button type="submit" className={`${dc.button.primary} mt-8 w-full`}>
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </button>
              </form>
            </EditableReveal>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">
            <PlusCircle className="h-3.5 w-3.5" /> Drafts are saved to this device — {activeTask?.description}
          </p>
        </section>
      </main>
    </EditableSiteShell>
  )
}
