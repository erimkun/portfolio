import { useState, useEffect, useRef } from 'react'

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
  const navRef = useRef(null)
  const [trackProps, setTrackProps] = useState({ top: 0, height: 0 })

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

  useEffect(() => {
    const updateTrack = () => {
      if (!navRef.current) return;
      // timeout gives DOM time to render changes in active font size
      setTimeout(() => {
        if (!navRef.current) return;
        const dots = Array.from(navRef.current.querySelectorAll('.side-nav-dot'));
        if (dots.length > 1) {
          const first = dots[0];
          const last = dots[dots.length - 1];
          const firstCenter = first.offsetTop + (first.offsetHeight / 2);
          const lastCenter = last.offsetTop + (last.offsetHeight / 2);
          setTrackProps({
            top: firstCenter,
            height: lastCenter - firstCenter
          });
        }
      }, 50);
    };

    updateTrack();
    window.addEventListener('resize', updateTrack);
    return () => window.removeEventListener('resize', updateTrack);
  }, [sections, isOpen, active]);

  const scrollTo = (id) => {
    if (onNavigate) {
      onNavigate(id)
    } else {
      const el = scrollerRef.current?.querySelector(`#section-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsOpen(false)
  }

  const maxIdx = Math.max(1, sections.length - 1);

  return (
    <div className={`nav-wrapper ${isOpen ? 'is-open' : ''}`}>
      <button 
        className="nav-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bölüm Menüsünü Aç/Kapat"
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      <nav className="side-nav" aria-hidden={!isOpen} ref={navRef}>
        <div className="track-line" style={{ top: trackProps.top, height: trackProps.height }}></div>
        <div className="track-progress" style={{ top: trackProps.top, height: trackProps.height * (active / maxIdx) }}></div>
        
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`side-nav-item ${active === i ? 'active' : ''}`}
            onClick={() => scrollTo(s.id)}
            aria-label={s.label}
          >
            <div className="side-nav-label-wrapper">
              <span className="side-nav-label">{s.label}</span>
              {active === i && <span className="side-nav-underline"></span>}
            </div>
            <span className="side-nav-dot"></span>
          </button>
        ))}
      </nav>
    </div>
  )
}
