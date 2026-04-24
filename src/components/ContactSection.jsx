import { useRef, useEffect } from 'react'
import { contact } from '../data/content'

export default function ContactSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const icons = section.querySelectorAll('.contact-icon-item')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          e.target.classList.toggle('visible', e.isIntersecting)
        }
      },
      { threshold: 0.3 }
    )
    icons.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-contact"
      className="portfolio-section contact-section"
      data-section-idx="5"
    >
      <div className="section-inner contact-inner">
        <header className="section-header">
          <span className="section-tag">// İLETİŞİM</span>
          <h2 className="section-title"><span className="title-text" data-river-node="contact">LET'S<br />CONNECT</span></h2>
        </header>
        <ul className="contact-icons">
          {contact.map((item, i) => (
            <li
              key={item.id}
              className="contact-icon-item"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="contact-icon-link"
              >
                <img
                  src={`/icons/${item.icon}.svg`}
                  alt={item.label}
                  className="contact-icon-svg"
                />
                <span className="contact-icon-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
