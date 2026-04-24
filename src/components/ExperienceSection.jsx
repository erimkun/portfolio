import { useRef, useEffect } from 'react'
import { experience } from '../data/content'

export default function ExperienceSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const items = section.querySelectorAll('.exp-item')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          e.target.classList.toggle('visible', e.isIntersecting)
        }
      },
      { threshold: 0.2 }
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-experience"
      className="portfolio-section experience-section"
      data-section-idx="3"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// DENEYİM</span>
          <h2 className="section-title"><span className="title-text" data-river-node="experience">EXPERIENCE</span></h2>
        </header>
        <div className="exp-list">
          {experience.map((item) => (
            <article key={item.id} className="exp-item">
              <div className="exp-meta">
                <span className="exp-period">{item.period}</span>
                <span className="exp-icon-dot" />
              </div>
              <div className="exp-content">
                <h3 className="exp-company">{item.company}</h3>
                <p className="exp-role">{item.role}</p>
                <p className="exp-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
