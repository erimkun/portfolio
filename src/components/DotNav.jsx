import { useState, useEffect } from 'react'

function MenuIcon({ isOpen }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      {isOpen ? (
        <path d="M18 6L6 18M6 6l12 12" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  )
}

export default function DotNav({ sections, scrollerRef, onNavigate }) {
  const [active, setActive] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

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
    } else {
      const el = scrollerRef.current?.querySelector(`#section-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsOpen(false)
  }

  return (
    <div className={`nav-wrapper ${isOpen ? 'is-open' : ''}`}>
      <button 
        className="nav-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bölüm Menüsünü Aç/Kapat"
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      <nav className="side-nav" aria-hidden={!isOpen}>
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`side-nav-item${active === i ? ' active' : ''}`}
            onClick={() => scrollTo(s.id)}
            aria-label={s.label}
          >
            <span className="side-nav-num">0{i + 1}</span>
            <span className="side-nav-label">{s.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
