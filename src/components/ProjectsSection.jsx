import { useRef, useEffect, useState, useCallback } from 'react'
import { projects } from '../data/content'

// Exactly 9 entries required — the mosaic tiles perfectly only when all 9 cells render.
const CLIP_PATHS = [
  'polygon(0% 0%, 37% 0%, 35% 48%, 0% 46%)',
  'polygon(37% 0%, 67% 0%, 68% 45%, 35% 48%)',
  'polygon(67% 0%, 100% 0%, 100% 47%, 68% 45%)',
  'polygon(0% 46%, 35% 48%, 33% 67%, 0% 69%)',
  'polygon(35% 48%, 68% 45%, 69% 70%, 33% 67%)',
  'polygon(68% 45%, 100% 47%, 100% 68%, 69% 70%)',
  'polygon(0% 69%, 33% 67%, 31% 100%, 0% 100%)',
  'polygon(33% 67%, 69% 70%, 69% 100%, 31% 100%)',
  'polygon(69% 70%, 100% 68%, 100% 100%, 69% 100%)',
]

const GRID_LINES = [
  '37,0 35,48 33,67 31,100',
  '67,0 68,45 69,70 69,100',
  '0,46 35,48 68,45 100,47',
  '0,69 33,67 69,70 100,68',
]

// Per-cell bottom offset for info overlay so it sits inside each polygon's visible area.
// Value = 100% - polygon_bottom_y so the info bottom edge aligns with the cell's bottom edge.
const CELL_INFO_BOTTOM = [
  '52%', '52%', '53%',  // top row    (polygon bottoms ≈ 47–48%)
  '31%', '30%', '30%',  // middle row (polygon bottoms ≈ 69–70%)
  '0%',  '0%',  '0%',   // bottom row (polygon bottoms = 100%)
]

function SparkleIcon() {
  return (
    <svg
      className="mosaic-sparkle"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 0 L8.7 6.8 L8 8 L7.3 6.8 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M0 8 L6.8 7.3 L8 8 L6.8 8.7 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M8 16 L7.3 9.2 L8 8 L8.7 9.2 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M16 8 L9.2 8.7 L8 8 L9.2 7.3 Z" fill="rgba(180,210,255,0.7)" />
    </svg>
  )
}

export default function ProjectsSection() {
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const hideTimer = useRef(null)
  const [expandedProj, setExpandedProj] = useState(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cells = section.querySelectorAll('.mosaic-cell')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          e.target.classList.toggle('visible', e.isIntersecting)
        }
      },
      { threshold: 0.1 }
    )
    cells.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  const handleCellEnter = useCallback((proj, e) => {
    clearTimeout(hideTimer.current)
    const container = containerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const eRect = e.currentTarget.getBoundingClientRect()
    const cellCX = eRect.left + eRect.width / 2 - cRect.left - cRect.width / 2
    const cellCY = eRect.top + eRect.height / 2 - cRect.top - cRect.height / 2
    setOrigin({ x: cellCX, y: cellCY })
    setExpandedProj(proj)
  }, [])

  const handleCellLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setExpandedProj(null), 80)
  }, [])

  const handleExpandedEnter = useCallback(() => {
    clearTimeout(hideTimer.current)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-projects"
      className="portfolio-section projects-section mosaic-projects"
      data-section-idx="4"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// PROJELER</span>
          <h2 className="section-title">
            <span className="title-text" data-river-node="projects">PROJECTS</span>
          </h2>
        </header>
        <div className="mosaic-container" ref={containerRef}>
          <svg
            className="mosaic-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {GRID_LINES.map((points, i) => (
              <polyline key={i} points={points} />
            ))}
          </svg>
          {projects.slice(0, 9).map((proj, idx) => (
            <a
              key={proj.id}
              href={proj.url}
              className="mosaic-cell"
              style={{
                clipPath: CLIP_PATHS[idx],
                transitionDelay: `${idx * 0.06}s`,
                '--cell-info-bottom': CELL_INFO_BOTTOM[idx],
              }}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${proj.name} — yeni sekmede açılır`}
              onMouseEnter={(e) => handleCellEnter(proj, e)}
              onMouseLeave={handleCellLeave}
            >
              {proj.image && (
                <img
                  className="mosaic-cell-img"
                  src={proj.image}
                  alt={proj.name}
                  loading="lazy"
                />
              )}
              <div className="mosaic-cell-info">
                <h3 className="mosaic-cell-name">{proj.name}</h3>
                <p className="mosaic-cell-desc">{proj.description}</p>
                <ul className="mosaic-cell-tech">
                  {proj.tech?.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </a>
          ))}
          {expandedProj && (
            <div
              key={expandedProj.id}
              className="mosaic-expanded"
              style={{
                '--origin-x': `${origin.x}px`,
                '--origin-y': `${origin.y}px`,
              }}
              onMouseEnter={handleExpandedEnter}
              onMouseLeave={handleCellLeave}
            >
              {expandedProj.image && (
                <img
                  className="mosaic-expanded-img"
                  src={expandedProj.image}
                  alt={expandedProj.name}
                />
              )}
              <div className="mosaic-expanded-body">
                <h3 className="mosaic-expanded-name">{expandedProj.name}</h3>
                <p className="mosaic-expanded-desc">{expandedProj.description}</p>
                <ul className="mosaic-expanded-tech">
                  {expandedProj.tech?.map(t => <li key={t}>{t}</li>)}
                </ul>
                {expandedProj.details?.length > 0 && (
                  <ul className="mosaic-expanded-details">
                    {expandedProj.details.map(d => <li key={d}>{d}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}
          <SparkleIcon />
        </div>
      </div>
    </section>
  )
}
