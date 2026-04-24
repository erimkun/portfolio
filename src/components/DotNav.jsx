import { useState, useEffect } from 'react'

export default function DotNav({ sections, scrollerRef, onNavigate }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIdx, 10)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        }
      },
      { root: container, threshold: 0.5 }
    )

    sections.forEach(({ id }) => {
      const el = container.querySelector(`#section-${id}`)
      if (el) io.observe(el)
    })

    return () => io.disconnect()
  }, [sections, scrollerRef])

  const scrollTo = (id) => {
    if (onNavigate) {
      onNavigate(id)
      return
    }

    const el = scrollerRef.current?.querySelector(`#section-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="dot-nav" aria-label="Bölüm navigasyonu">
      {sections.map((s, i) => (
        <button
          key={s.id}
          className={`dot-nav-item${active === i ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
          aria-label={s.label}
          aria-current={active === i ? 'true' : undefined}
        >
          <span className="dot-nav-dot" />
          <span className="dot-nav-label">{s.label}</span>
        </button>
      ))}
    </nav>
  )
}
