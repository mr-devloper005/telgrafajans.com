'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function EditableContactLeadForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Unable to send your note.')
      setStatus('success')
      setMessage(data?.message || 'Thanks — your note has been received.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send your note.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field name="name" label="Your name" placeholder="Ada Lovelace" required />
        <Field name="email" type="email" label="Email" placeholder="you@example.com" required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field name="phone" label="Phone (optional)" placeholder="Optional" />
        <Field name="subject" label="Subject" placeholder="What is this note about?" />
      </div>
      <label className="grid gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
        Note
        <textarea
          name="message"
          required
          rows={6}
          placeholder="A few sentences about what you would like to add, correct or ask…"
          className="w-full border-b border-[var(--editable-border-strong)] bg-transparent py-3 text-base font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-page-text)]"
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {message ? (
        <div className={`flex items-start gap-3 rounded-[var(--editable-radius-button)] px-4 py-3 text-sm font-semibold ${
          status === 'success' ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-page-text)]' : 'bg-[#FDE0DF] text-[#B22B29]'
        }`}>
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span>{message}</span>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--editable-radius-button)] bg-[var(--slot4-page-text)] px-6 text-sm font-medium uppercase tracking-[0.16em] text-[var(--slot4-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send note
      </button>
    </form>
  )
}

function Field({ name, label, type = 'text', placeholder, required = false }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border-b border-[var(--editable-border-strong)] bg-transparent py-3 text-base font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-page-text)]"
      />
    </label>
  )
}
