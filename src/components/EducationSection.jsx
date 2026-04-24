import { useRef, useEffect } from 'react'
import { education } from '../data/content'

export default function EducationSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const items = section.querySelectorAll('.edu-card')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          e.target.classList.toggle('visible', e.isIntersecting)
        }
      },
      { threshold: 0.25 }
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-education"
      className="portfolio-section education-section"
      data-section-idx="2"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// EĞİTİM & SERTİFİKA</span>
          <h2 className="section-title"><span className="title-text" data-river-node="education">EDUCATION</span></h2>
        </header>
        <div className="edu-timeline">
          <span className="timeline-line" />
          {education.map((item) => (
            <article key={item.id} className="edu-card">
              <span className="timeline-dot" />
              <div className="edu-card-inner">
                <span className="edu-year">{item.year}</span>
                <h3 className="edu-institution">{item.institution}</h3>
                <p className="edu-degree">{item.degree}</p>
                <p className="edu-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
