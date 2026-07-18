'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/*
  Scroll-reveal wrapper. IntersectionObserver-driven fade + subtle rise.

  Server-render is fully visible so JS-off visitors see content immediately.
  On mount, we flip to `is-hidden` and then let the observer promote to
  `is-visible` when the element scrolls into view. Stagger via `index` prop.
*/
export function EditableReveal({
  children,
  as: Tag = 'div',
  index = 0,
  step = 80,
  className = '',
  style,
  once = true,
}: {
  children: ReactNode
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'li' | 'span'
  index?: number
  step?: number
  className?: string
  style?: CSSProperties
  once?: boolean
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const node = ref.current
    if (!node) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [mounted, once])

  const state = mounted ? (visible ? 'is-visible' : 'is-hidden') : ''
  const combined: CSSProperties = {
    transitionDelay: `${Math.max(0, index) * step}ms`,
    ...(style || {}),
  }
  const Component = Tag as 'div'
  return (
    <Component
      ref={ref as never}
      className={`editable-reveal ${state} ${className}`.trim()}
      style={combined}
    >
      {children}
    </Component>
  )
}
